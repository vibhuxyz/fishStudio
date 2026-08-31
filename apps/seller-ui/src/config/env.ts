export const frontendEnv = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_URI ||
    "http://localhost:8080",
  corsUrl:
    process.env.NEXT_PUBLIC_CORS_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3002",
  servicePort: process.env.NEXT_PUBLIC_SERVICE_PORT || "3002",
  // No localhost fallback in production: NEXT_PUBLIC_* is inlined at build
  // time, so an unset var used to bake "http://localhost:3000" into the
  // deployed bundle and every "View product" link sent staff to their own
  // machine. Empty here makes the link resolve relative to this dashboard —
  // a visible 404 on the right host instead of a silent dead end.
  userUiUrl:
    process.env.NEXT_PUBLIC_USER_UI_LINK ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"),
  workerWebsocketUrl: (
    process.env.NEXT_PUBLIC_WORKER_WS_URL ||
    process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI ||
    "ws://localhost:8080"
  ).replace(/^http/, "ws").replace(/\/$/, ""),
  chatWebsocketUrl:
    process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI || "ws://localhost:8080",
} as const;
