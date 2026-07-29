import Constants from "expo-constants";

// Single source for the production host — axiosInstance and the WebSocket
// provider both need it as a release-build fallback if env injection is missed.
export const PRODUCTION_API_BASE_URL = "https://api.fishstudio.in";
export const PRODUCTION_WS_BASE_URL = "wss://api.fishstudio.in/";

export const getExpoHost = (): string | null => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).expoGoConfig?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    "";

  const host = String(hostUri).split(":")[0]?.trim();
  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  return host;
};
