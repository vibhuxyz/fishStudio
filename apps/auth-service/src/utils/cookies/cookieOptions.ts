const isProduction = process.env.NODE_ENV === "production";

// Shared base options for every auth cookie. `secure`/`sameSite` must match
// between set and clear or browsers won't actually remove the cookie.
export const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
};
