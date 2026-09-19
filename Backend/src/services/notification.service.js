import { prisma } from "../common/prisma/connect.prisma.js";

export const notificationService = {
  async getNotifications(req) {
    const userId = req.user.nguoi_dung_id;
    try {
      const notifications = await prisma.thong_bao.findMany({
        where: {
          nguoi_nhan_id: userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
        include: {
          nguoi_gui: {
            select: {
              nguoi_dung_id: true,
              ho_ten: true,
              email: true,
              anh_dai_dien: true,
            },
          },
          hinh_anh: {
            select: {
              hinh_id: true,
              ten_hinh: true,
              duong_dan: true,
            },
          },
        },
      });

      return notifications;
    } catch (err) {
      console.warn("Notifications table query fallback:", err.message);
      return [];
    }
  },

  async getUnreadCount(req) {
    const userId = req.user.nguoi_dung_id;
    try {
      const count = await prisma.thong_bao.count({
        where: {
          nguoi_nhan_id: userId,
          da_doc: false,
        },
      });

      return { unreadCount: count };
    } catch (err) {
      console.warn("Notification unread-count query fallback:", err.message);
      return { unreadCount: 0 };
    }
  },

  async markAsRead(req) {
    const userId = req.user.nguoi_dung_id;
    const notificationId = Number(req.params.id);
    try {
      const updated = await prisma.thong_bao.updateMany({
        where: {
          thong_bao_id: notificationId,
          nguoi_nhan_id: userId,
        },
        data: {
          da_doc: true,
        },
      });

      return updated;
    } catch (err) {
      return { count: 0 };
    }
  },

  async markAllAsRead(req) {
    const userId = req.user.nguoi_dung_id;
    try {
      const updated = await prisma.thong_bao.updateMany({
        where: {
          nguoi_nhan_id: userId,
          da_doc: false,
        },
        data: {
          da_doc: true,
        },
      });

      return updated;
    } catch (err) {
      return { count: 0 };
    }
  },

  async createNotification({ senderId, receiverId, imageId, type, content }) {
    // Không gửi thông báo nếu người thao tác là chính chủ sở hữu
    if (!senderId || !receiverId || senderId === receiverId) {
      return null;
    }

    try {
      const notification = await prisma.thong_bao.create({
        data: {
          nguoi_gui_id: senderId,
          nguoi_nhan_id: receiverId,
          hinh_id: imageId || null,
          loai: type, // "LIKE" | "COMMENT"
          noi_dung: content,
        },
      });
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  },
};
