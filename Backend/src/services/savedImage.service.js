import { BadRequestException, NotFoundException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import { notificationService } from "./notification.service.js";

export const savedImageService = {
  async checkSavedImage(req) {
    const imageId = Number(req.params.imageId);
    if (!imageId) {
      throw new BadRequestException("ID hình ảnh không hợp lệ");
    }

    if (!req.user) {
      return {
        isSaved: false,
        imageId: imageId,
      };
    }

    const savedRecord = await prisma.luu_anh.findUnique({
      where: {
        nguoi_dung_id_hinh_id: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          hinh_id: imageId,
        },
      },
    });

    return {
      isSaved: !!savedRecord,
      imageId: imageId,
    };
  },

  async toggleSaveImage(req) {
    const imageId = Number(req.params.imageId || req.body.imageId);
    if (!imageId) {
      throw new BadRequestException("ID hình ảnh không hợp lệ");
    }

    const image = await prisma.hinh_anh.findFirst({
      where: { hinh_id: imageId, isDeleted: false },
      include: {
        nguoi_dung: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException("Hình ảnh không tồn tại");
    }

    const existingRecord = await prisma.luu_anh.findUnique({
      where: {
        nguoi_dung_id_hinh_id: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          hinh_id: imageId,
        },
      },
    });

    if (existingRecord) {
      // Đã lưu -> Tiến hành Bỏ lưu (Unsave)
      await prisma.luu_anh.delete({
        where: {
          nguoi_dung_id_hinh_id: {
            nguoi_dung_id: req.user.nguoi_dung_id,
            hinh_id: imageId,
          },
        },
      });

      return {
        isSaved: false,
        message: "Đã bỏ lưu hình ảnh thành công",
        imageId: imageId,
      };
    } else {
      // Chưa lưu -> Tiến hành Lưu (Save)
      const saved = await prisma.luu_anh.create({
        data: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          hinh_id: imageId,
        },
      });

      // Tạo thông báo cho chủ sở hữu ảnh
      const senderName = req.user.ho_ten || req.user.email || "Một người dùng";
      await notificationService.createNotification({
        senderId: req.user.nguoi_dung_id,
        receiverId: image.nguoi_dung_id,
        imageId: imageId,
        type: "SAVE",
        content: `${senderName} đã lưu & yêu thích ý tưởng "${image.ten_hinh}" của bạn.`,
      });

      return {
        isSaved: true,
        message: "Đã lưu hình ảnh vào bộ sưu tập",
        data: saved,
      };
    }
  },

  async batchUnsave(req) {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Danh sách ID không hợp lệ");
    }

    const numIds = ids.map(Number).filter(Boolean);

    await prisma.luu_anh.deleteMany({
      where: {
        nguoi_dung_id: req.user.nguoi_dung_id,
        hinh_id: { in: numIds },
      },
    });

    return { message: `Đã bỏ lưu thành công ${numIds.length} hình ảnh`, count: numIds.length };
  },
};
