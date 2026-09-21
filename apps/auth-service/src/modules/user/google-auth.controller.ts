import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import { prismaMongo as prisma } from "@repo/db-mongo";
import { ValidationError } from "@repo/error-handlers";
import { ENV } from "@repo/env-config";
import { createUserSession, resolveReferralCode } from "./user.controller.js";

const GOOGLE_CLIENT_IDS = ENV.GOOGLE_CLIENT_ID.split(",")
  .map((id) => id.trim())
  .filter(Boolean);

// Fetches and caches Google's signing keys; one instance is enough.
const googleClient = new OAuth2Client();

/**
 * Sign in / sign up with a Google ID token.
 *
 * The client (web Google button or the native SDK) does the Google prompt and
 * hands us the resulting ID token. We never trust anything the client says
 * about the user — the token's signature, audience, expiry and email are all
 * checked here, and the profile comes from the verified claims.
 *
 * Accounts are matched on email. That is safe because we require Google to
 * have verified the address (`email_verified`), so a Google login can only
 * ever reach an account whose email the caller controls. It also means someone
 * who first signed up by email OTP lands in the same account.
 */
export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (GOOGLE_CLIENT_IDS.length === 0) {
      return res.status(503).json({
        success: false,
        message: "Google sign-in is not available right now. Please use email.",
      });
    }

    const { idToken, referralCode } = req.body ?? {};
    if (!idToken || typeof idToken !== "string") {
      return next(new ValidationError("Google ID token is required"));
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_IDS,
      });
      payload = ticket.getPayload();
    } catch {
      return next(new ValidationError("Google sign-in failed. Please try again."));
    }

    if (!payload?.email || !payload.email_verified) {
      return next(
        new ValidationError("Your Google account does not have a verified email."),
      );
    }

    const email = payload.email.trim().toLowerCase();
    const findByEmail = () =>
      prisma.users.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });

    let user = await findByEmail();
    let isNewUser = false;

    if (!user) {
      const referredByCode = await resolveReferralCode(referralCode);
      try {
        user = await prisma.users.create({
          data: {
            email,
            name: payload.name?.trim() || email.split("@")[0] || email,
            referredByCode,
          },
        });
        isNewUser = true;
      } catch (createError: any) {
        // Two first-time requests racing (double-tap, web + app at once):
        // the sparse unique index rejects the second, so just read the winner.
        if (createError.code !== "P2002") throw createError;
        user = await findByEmail();
        if (!user) throw createError;
      }
    }

    const { accessToken, refreshToken } = await createUserSession(req, res, user);

    // Tokens in the body are for the mobile client (Bearer auth); the web
    // client relies on the httpOnly cookies createUserSession just set.
    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      isNewUser,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};
