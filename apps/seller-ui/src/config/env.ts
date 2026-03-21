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
  userUiUrl: process.env.NEXT_PUBLIC_USER_UI_LINK || "http://localhost:3000",
  chatWebsocketUrl:
    process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI || "ws://localhost:8080",
} as const;
