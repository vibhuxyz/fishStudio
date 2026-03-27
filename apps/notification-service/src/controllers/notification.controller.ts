import { Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service.js";

// isAuthenticated populates req.user (users), req.seller (sellers), or req.admin (admins)
const getUserId = (req: any): string | null =>
  req.user?.id ?? req.seller?.id ?? req.admin?.id ?? null;

export const getNotifications = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const notifications = await NotificationService.getUserNotifications(userId);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await NotificationService.markAsRead(id, userId);
    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await NotificationService.markAllAsRead(userId);
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
