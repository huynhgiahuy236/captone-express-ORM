import express from "express";
import { notificationController } from "../controllers/notification.controller.js";
import { protect } from "../common/middlewares/protect.middleware.js";

const notificationRouter = express.Router();

// Lấy danh sách thông báo của người dùng
notificationRouter.get("/", protect, notificationController.getNotifications);

// Lấy số lượng thông báo chưa đọc
notificationRouter.get("/unread-count", protect, notificationController.getUnreadCount);

// Đánh dấu tất cả thông báo là đã đọc
notificationRouter.put("/read-all", protect, notificationController.markAllAsRead);

// Đánh dấu 1 thông báo là đã đọc
notificationRouter.put("/:id/read", protect, notificationController.markAsRead);

export default notificationRouter;
