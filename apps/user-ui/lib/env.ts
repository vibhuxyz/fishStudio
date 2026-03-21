export const frontendEnv = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_URI ||
    "http://localhost:8080",
  corsUrl:
    process.env.NEXT_PUBLIC_CORS_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  servicePort: process.env.NEXT_PUBLIC_SERVICE_PORT || "3000",
};
