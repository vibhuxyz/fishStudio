import { Prisma } from "../prisma/generated-client/index.js";
import { prismaPostgres } from "./client.js";

/**
 * Runs a transaction at Serializable isolation, retrying serialization
 * failures.
 *
 * Serializable is not a way to avoid conflicts — it is a way to be *told*
 * about them. Postgres aborts one of two transactions whose reads and writes
 * can't be ordered, which is exactly what stops two people spending the last
 * use of a coupon. Without a retry that abort reaches the customer as a failed
 * checkout, so the isolation level buys correctness at the cost of a spurious
 * error. Retrying is the other half of using it.
 *
 * Only safe for callers whose body is idempotent under replay. The whole
 * transaction rolled back before we get here, so anything written inside it is
 * gone; work done *outside* it (a Mongo stock decrement, a gateway call) is
 * not, and must not be repeated by the callback.
 */

/** Postgres serialization_failure / deadlock_detected. */
const RETRYABLE_PG_CODES = ["40001", "40P01"];

// Prisma normalises write conflicts and deadlocks to this.
const PRISMA_CONFLICT_CODE = "P2034";

const DEFAULT_MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 25;

function isRetryable(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === PRISMA_CONFLICT_CODE) return true;
    // Some driver paths surface the raw SQLSTATE instead of P2034.
    const pgCode = (error.meta as { code?: string } | undefined)?.code;
    if (pgCode && RETRYABLE_PG_CODES.includes(pgCode)) return true;
  }

  // PrismaClientUnknownRequestError carries the SQLSTATE only in its message.
  if (error instanceof Error) {
    return RETRYABLE_PG_CODES.some((code) => error.message.includes(code));
  }

  return false;
}

/**
 * Full jitter: retries of two transactions that conflicted must not line up
 * again on the next attempt, which a fixed backoff would guarantee.
 */
function backoffMs(attempt: number): number {
  return Math.random() * BASE_BACKOFF_MS * 2 ** (attempt - 1);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SerializableRetryOptions {
  maxAttempts?: number;
  /** Called before each retry — for logging the contention, not control flow. */
  onRetry?: (attempt: number, error: unknown) => void;
}

export async function runSerializable<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: SerializableRetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await prismaPostgres.$transaction(fn, {
        isolationLevel: "Serializable",
      });
    } catch (error) {
      // A business error thrown by the callback (coupon exhausted, say) is the
      // answer, not a failure to retry — replaying it would just produce the
      // same rejection after a pointless delay.
      if (!isRetryable(error)) throw error;

      lastError = error;
      if (attempt === maxAttempts) break;

      options.onRetry?.(attempt, error);
      await sleep(backoffMs(attempt));
    }
  }

  throw lastError;
}
