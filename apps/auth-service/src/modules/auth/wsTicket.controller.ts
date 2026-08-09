import { Request, Response, NextFunction } from "express";
import { signAccessToken } from "../../utils/tokenRevocation.js";

interface AuthenticatedRequest extends Request {
  role?: "admin" | "seller" | "user" | "staff";
  seller?: { id: string; store?: { id: string } | null };
  staff?: { id: string };
  user?: { id: string };
  admin?: { id: string };
}

// The realtime socket lives on the worker-service origin, while the browser
// now holds its session cookie first-party to the UI origin — so that cookie
// is never sent on the WebSocket upgrade. Instead the client asks (over its
// authenticated same-origin API path) for a short-lived token and passes it as
// ?access_token=, which socket.ts already verifies.
//
// Deliberately short TTL: this value ends up in a URL, where it is far more
// likely to be logged by proxies than a cookie ever is. It is only needed for
// the few seconds between issuing and the upgrade handshake.
const WS_TICKET_TTL = "60s";

export const issueWsTicket = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = req.role;
    const id =
      role === "staff" ? req.staff?.id
      : role === "seller" ? req.seller?.id
      : role === "admin" ? req.admin?.id
      : req.user?.id;

    if (!role || !id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Which store/seller feed this session may listen to is decided here, from
    // the verified session, and carried in the signed ticket. worker-service
    // used to take these from the socket's own query string, which let any
    // logged-in seller or staff member subscribe to another tenant's orders.
    const ticket = signAccessToken(
      {
        id,
        role,
        // A staff member listens to their linked seller's store-wide feed; a
        // seller listens to their own store.
        ...(role === "seller" && req.seller?.store?.id
          ? { storeId: req.seller.store.id }
          : {}),
        ...(role === "staff" && req.seller?.id ? { sellerId: req.seller.id } : {}),
      },
      WS_TICKET_TTL,
    );

    res.status(200).json({ success: true, ticket, expiresIn: 60 });
  } catch (error) {
    next(error);
  }
};
