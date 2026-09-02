import type { NextFunction, Request, RequestHandler, Response } from "express";

import { MACHINE_POLLED_PATHS, resolveRoute } from "./http-metrics.js";
import { createLogger, type Logger } from "./logging.js";
import { getServiceName } from "./registry.js";

let logger: Logger | null = null;

function getLogger(): Logger {
  if (!logger) {
    logger = createLogger(getServiceName() ?? "unknown-service");
  }
  return logger;
}

/**
 * One structured line per completed request.
 *
 * This replaces `morgan`, which wrote a human-readable sentence. A sentence is
 * fine when a person is reading a terminal and useless once the lines are in a
 * log store: `GET /product 200 6.2ms` cannot be filtered by status, grouped by
 * route, or joined to a trace. This line carries the correlation id and trace
 * id from the request context, which is what turns "show me this request across
 * all seven services" into one query.
 */
export function httpLogging(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (MACHINE_POLLED_PATHS.has(req.path)) {
      next();
      return;
    }

    const startedAt = process.hrtime.bigint();

    let settled = false;
    const record = () => {
      if (settled) {
        return;
      }
      settled = true;

      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const status = res.statusCode;

      // The level is the status class. A 500 that logs at info is a 500 nobody
      // finds, and a 404 that logs at error is noise that trains people to
      // filter errors out.
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

      getLogger()[level](
        {
          method: req.method,
          route: resolveRoute(req),
          path: req.originalUrl,
          status,
          durationMs: Number(durationMs.toFixed(2)),
        },
        "request completed",
      );
    };

    // Same pair as the metrics middleware: "close" catches the client that hung
    // up before the response was written, which is a request that happened and
    // therefore a request worth a line.
    res.on("finish", record);
    res.on("close", record);

    next();
  };
}
