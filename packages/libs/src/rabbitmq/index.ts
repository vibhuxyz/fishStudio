import * as amqp from "amqplib";
import type { Channel, ChannelModel, ConsumeMessage } from "amqplib";
import { ENV } from "@repo/env-config";
import {
  getRequestId,
  REQUEST_ID_HEADER,
  resolveRequestId,
  runWithContext,
  withConsumerSpan,
  withProducerSpan,
} from "@repo/observability";
import { logger } from "../utils/logger.js";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isReconnecting = false;

// Registered consumers — re-applied after reconnect
const consumers: Array<{
  queue: string;
  handler: (msg: ConsumeMessage | null) => void;
  options?: amqp.Options.Consume;
}> = [];

const getRabbitMQUrl = () =>
  `${ENV.RABBITMQ_PROTOCOL}://${ENV.RABBITMQ_USER_NAME}:${ENV.RABBITMQ_PASSWORD}@${ENV.RABBITMQ_HOST_NAME}:${ENV.RABBITMQ_PORT}`;

const reRegisterConsumers = async (ch: Channel) => {
  for (const c of consumers) {
    await ch.assertQueue(c.queue, { durable: true });
    await ch.consume(c.queue, c.handler, c.options);
    logger.info("Re-registered RabbitMQ consumer", { queue: c.queue });
  }
};

const reconnect = async (delayMs = 5000) => {
  if (isReconnecting) return;
  isReconnecting = true;
  logger.warn("RabbitMQ reconnecting", { delayMs });

  setTimeout(async () => {
    isReconnecting = false;
    try {
      await connectRabbitMQ();
      logger.info("RabbitMQ reconnected");
    } catch (err) {
      logger.error("RabbitMQ reconnect failed", err);
      reconnect(Math.min(delayMs * 2, 30000));
    }
  }, delayMs);
};

export const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel;

  try {
    connection = await amqp.connect(getRabbitMQUrl());
    channel = await connection.createChannel();

    logger.info("Connected to RabbitMQ");

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed, scheduling reconnect");
      connection = null;
      channel = null;
      reconnect();
    });

    connection.on("error", (err) => {
      logger.error("RabbitMQ connection error", err);
      connection = null;
      channel = null;
      reconnect();
    });

    // Re-apply consumers if this is a reconnect
    if (consumers.length > 0) {
      await reRegisterConsumers(channel);
    }

    return channel;
  } catch (error) {
    logger.error("Error connecting to RabbitMQ", error);
    throw error;
  }
};

/**
 * Reports whether this process currently holds a live channel.
 *
 * Deliberately a connection-state read and not an `assertQueue` round-trip: a
 * failed assert against a queue that does not exist closes the channel, so a
 * health probe using one would be capable of causing the outage it reports.
 */
export const isRabbitMQHealthy = (): boolean => channel !== null;

export const publishToQueue = async (
  queueName: string,
  message: unknown,
): Promise<void> => {
  const ch = await connectRabbitMQ();

  await ch.assertQueue(queueName, { durable: true });

  // The trace context and the correlation id ride in the AMQP headers.
  // Without this the story of a checkout ends at the publish: the consumer
  // starts a brand new trace, and nothing connects the confirmation email that
  // never arrived to the order that triggered it.
  const headers: Record<string, unknown> = {};
  const requestId = getRequestIdForOutbound();
  if (requestId) {
    headers[REQUEST_ID_HEADER] = requestId;
  }

  await withProducerSpan({ queue: queueName, carrier: headers }, async () => {
    ch.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      headers,
    });
    logger.info("Message published", { queue: queueName });
  });
};

export const consumeQueue = async (
  queueName: string,
  handler: (msg: ConsumeMessage | null) => void,
  options?: amqp.Options.Consume,
): Promise<void> => {
  const ch = await connectRabbitMQ();

  const traced = withMessageContext(queueName, handler);

  await ch.assertQueue(queueName, { durable: true });
  await ch.consume(queueName, traced, options);

  // Register the traced handler, not the raw one: after a reconnect the
  // re-registered consumer has to keep carrying the context too.
  if (!consumers.find((c) => c.queue === queueName)) {
    consumers.push({ queue: queueName, handler: traced, options });
  }

  logger.info("RabbitMQ consumer registered", { queue: queueName });
};

/**
 * The correlation id to stamp on an outbound message.
 *
 * Publishes that happen inside an HTTP request inherit its id. The outbox relay
 * publishes from a timer with no request around it, so there is nothing to
 * inherit — a fresh id is minted there instead of leaving the message
 * unlabelled, because "which relay tick sent this" is still worth being able to
 * ask.
 */
const getRequestIdForOutbound = (): string => getRequestId() ?? resolveRequestId(undefined);

/**
 * Wraps a consumer so every message is handled inside its publisher's context.
 *
 * Two things are restored: the correlation id from the AMQP headers, so log
 * lines written by the consumer join the same story as the request that
 * published the message; and the trace context, so the consumer's span becomes
 * a child of the publish rather than the root of an unrelated trace.
 */
const withMessageContext =
  (queueName: string, handler: (msg: ConsumeMessage | null) => void) =>
  (msg: ConsumeMessage | null): void => {
    // A null message means the consumer was cancelled by the broker. There is
    // no carrier to read and nothing to correlate.
    if (!msg) {
      handler(msg);
      return;
    }

    const carrier = (msg.properties.headers ?? {}) as Record<string, unknown>;
    const requestId = resolveRequestId(carrier[REQUEST_ID_HEADER] as string | undefined);

    void runWithContext({ requestId }, () =>
      withConsumerSpan({ queue: queueName, carrier }, async () => {
        // The handler may be sync or async. Awaiting the async case keeps the
        // span open for the actual work rather than ending it at the first
        // await inside the handler.
        await handler(msg);
      }),
    ).catch((err: unknown) => {
      // consumeQueue's callers install their own try/catch and ack/nack. This
      // catch exists so a handler that throws cannot become an unhandled
      // rejection that takes the process down.
      logger.error("Unhandled error in RabbitMQ consumer", {
        queue: queueName,
        err: err instanceof Error ? err : new Error(String(err)),
      });
    });
  };
