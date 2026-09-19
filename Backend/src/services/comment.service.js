import { BadRequestException, NotFoundException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import { notificationService } from "./notification.service.js";

export const commentService = {
  async getCommentsByImageId(req) {
    const imageId = Number(req.params.imageId);
    if (!imageId) {
      throw new BadRequestException("ID hình ảnh không hợp lệ");
    }

    const image = await prisma.hinh_anh.findFirst({
      where: { hinh_id: imageId, isDeleted: false },
    });

    if (!image) {
      throw new NotFoundException("Hình ảnh không tồn tại");
    }

    const comments = await prisma.binh_luan.findMany({
      where: {
        hinh_id: imageId,
        isDeleted: false,
      },
      orderBy: { ngay_binh_luan: "desc" },
      include: {
        nguoi_dung: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
            anh_dai_dien: true,
          },
        },
        _count: {
          select: {
            tym_binh_luan: true,
          },
        },
        ...(req.user?.nguoi_dung_id
          ? {
              tym_binh_luan: {
                where: {
                  nguoi_dung_id: req.user.nguoi_dung_id,
                },
                select: {
                  nguoi_dung_id: true,
                },
              },
            }
          : {}),
      },
    });

    return comments.map((c) => ({
      binh_luan_id: c.binh_luan_id,
      nguoi_dung_id: c.nguoi_dung_id,
      hinh_id: c.hinh_id,
      ngay_binh_luan: c.ngay_binh_luan,
      noi_dung: c.noi_dung,
      nguoi_dung: c.nguoi_dung,
      likeCount: c._count?.tym_binh_luan || 0,
      isLiked: Array.isArray(c.tym_binh_luan) ? c.tym_binh_luan.length > 0 : false,
    }));
  },

  async createComment(req) {
    const { imageId, content } = req.body;

    if (!imageId || !content?.trim()) {
      throw new BadRequestException("Vui lòng cung cấp ID hình ảnh và nội dung bình luận");
    }

    const image = await prisma.hinh_anh.findFirst({
      where: { hinh_id: Number(imageId), isDeleted: false },
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
      throw new NotFoundException("Hình ảnh cần bình luận không tồn tại");
    }

    const newComment = await prisma.binh_luan.create({
      data: {
        hinh_id: Number(imageId),
        nguoi_dung_id: req.user.nguoi_dung_id,
        noi_dung: content.trim(),
      },
      include: {
        nguoi_dung: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
            anh_dai_dien: true,
          },
        },
      },
    });

    // Tạo thông báo cho chủ sở hữu ảnh
    const senderName = req.user.ho_ten || req.user.email || "Một người dùng";
    const previewContent = content.trim().length > 40 ? content.trim().substring(0, 40) + "..." : content.trim();
    await notificationService.createNotification({
      senderId: req.user.nguoi_dung_id,
      receiverId: image.nguoi_dung_id,
      imageId: Number(imageId),
      type: "COMMENT",
      content: `${senderName} đã bình luận trên ý tưởng "${image.ten_hinh}": "${previewContent}"`,
    });

    return newComment;
  },
};
