// Best-effort device label for the "Login Devices" screen. Web clients don't
// send anything explicit, so we derive a label from the User-Agent; mobile
// sends its own platform/deviceLabel (RN's default UA isn't informative).
export const labelFromUserAgent = (userAgent: string | undefined | null): string => {
  const ua = userAgent || "";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";

  return `${browser} on ${os}`;
};

export const resolveDeviceInfo = (
  req: { headers: Record<string, unknown>; body?: any },
): { platform: string; deviceLabel: string; userAgent: string | null } => {
  const userAgent = (req.headers["user-agent"] as string | undefined) || null;
  const clientPlatform =
    typeof req.body?.platform === "string" ? req.body.platform.trim().toLowerCase() : undefined;
  const clientLabel =
    typeof req.body?.deviceLabel === "string" ? req.body.deviceLabel.trim() : undefined;

  if (clientPlatform === "ios" || clientPlatform === "android") {
    return {
      platform: clientPlatform,
      deviceLabel: clientLabel || (clientPlatform === "ios" ? "iOS device" : "Android device"),
      userAgent,
    };
  }

  return {
    platform: "web",
    deviceLabel: labelFromUserAgent(userAgent),
    userAgent,
  };
};
