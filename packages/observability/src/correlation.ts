import type { NextFunction, Request, RequestHandler, Response } from "express";

import { REQUEST_ID_HEADER, resolveRequestId, runWithContext } from "./context.js";

/**
 * Opens the request context for everything downstream.
 *
 * Registered first, before metrics and before the rate limiter, so even a
 * request that gets rejected with a 429 still has an id in its log lines. A
 * correlation id that only exists for successful requests is missing precisely
 * when it is needed.
 *
 * The id is echoed back in the response header so a user reporting a problem
 * can quote it, and the whole request can be pulled out of Loki by that one
 * string.
 */
export function correlationId(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = resolveRequestId(req.headers[REQUEST_ID_HEADER]);

    // Set on the request too: the gateway proxy reads it back off here when it
    // forwards, and handlers that build outbound calls can reach it without
    // importing the store.
    req.headers[REQUEST_ID_HEADER] = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    runWithContext({ requestId }, next);
  };
}
