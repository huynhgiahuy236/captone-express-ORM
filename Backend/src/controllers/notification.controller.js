import { responseSuccess } from "../common/helpers/response.helper.js";
import { notificationService } from "../services/notification.service.js";

export const notificationController = {
  async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getNotifications(req);
      const response = responseSuccess(result, "Lấy danh sách thông báo thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req);
      const response = responseSuccess(result, "Lấy số lượng thông báo chưa đọc thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const result = await notificationService.markAsRead(req);
      const response = responseSuccess(result, "Đã đánh dấu thông báo là đã đọc");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req);
      const response = responseSuccess(result, "Đã đánh dấu tất cả thông báo là đã đọc");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },
};
