import { Response, NextFunction } from "express";
import { getUserNotifications, markAsRead as markAsReadSvc, markAllAsRead as markAllAsReadSvc } from "../services/notification.service.js";
import type { AuthenticatedRequest } from "../types/notification.types.js";

// isAuthenticated populates req.user (users), req.seller (sellers), or req.admin (admins)
const getUserId = (req: AuthenticatedRequest): string | null =>
  req.user?.id ?? req.seller?.id ?? req.admin?.id ?? null;

export const getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const limit = Number(req.query.limit) || undefined;

    // `notifications` keeps its existing shape and position in the response;
    // hasMore/nextCursor are new fields clients can start using when they add
    // infinite scroll, and are harmless to the ones that ignore them.
    const { notifications, hasMore, nextCursor } = await getUserNotifications(userId, {
      cursor,
      limit,
    });
    res.status(200).json({ success: true, notifications, hasMore, nextCursor });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ success: false, message: "Notification ID is required" });
    }

    await markAsReadSvc(id, userId);
    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await markAllAsReadSvc(userId);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

