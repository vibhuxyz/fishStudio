// Public storefront origin. NEXT_PUBLIC_* is inlined at build time, so if the
// var is missing from the deploy env the bundle ships whatever this resolves
// to. History here: an unset var once baked "http://localhost:3000" into prod
// and every "View product" link sent staff to their own machine; the next
// attempt shipped "" which made the link resolve against this dashboard (404
// on admin.fishstudio.in/product/...). So in production we fall back to the
// known storefront domain — a hardcoded prod URL beats a broken link — and
// warn loudly so the missing var still gets fixed in the deploy config.
const PROD_STOREFRONT_ORIGIN = "https://fishstudio.in";

const resolveUserUiUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_USER_UI_LINK;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  console.warn(
    "NEXT_PUBLIC_USER_UI_LINK is not set; falling back to " +
      PROD_STOREFRONT_ORIGIN +
      ". Set it in the deploy environment to point product links at the right storefront.",
  );
  return PROD_STOREFRONT_ORIGIN;
};

export const frontendEnv = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_URI ||
    "http://localhost:8080",
  corsUrl:
    process.env.NEXT_PUBLIC_CORS_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3001",
  servicePort: process.env.NEXT_PUBLIC_SERVICE_PORT || "3001",
  userUiUrl: resolveUserUiUrl(),
  chatWebsocketUrl:
    process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI || "ws://localhost:8080",
} as const;
