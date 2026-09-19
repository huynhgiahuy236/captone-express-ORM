import { BadRequestException, NotFoundException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import { notificationService } from "./notification.service.js";

export const likeService = {
  // ========================== LIKE IMAGE ==========================
  async toggleLikeImage(req) {
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

    const existingLike = await prisma.tym_anh.findUnique({
      where: {
        nguoi_dung_id_hinh_id: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          hinh_id: imageId,
        },
      },
    });

    let isLiked = false;
    if (existingLike) {
      // Đã thích -> Bỏ thích
      await prisma.tym_anh.delete({
        where: {
          nguoi_dung_id_hinh_id: {
            nguoi_dung_id: req.user.nguoi_dung_id,
            hinh_id: imageId,
          },
        },
      });
      isLiked = false;
    } else {
      // Chưa thích -> Thả tim
      await prisma.tym_anh.create({
        data: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          hinh_id: imageId,
        },
      });
      isLiked = true;

      // Gửi thông báo đến chủ sở hữu ảnh nếu không phải tự like ảnh mình
      if (image.nguoi_dung_id !== req.user.nguoi_dung_id) {
        const senderName = req.user.ho_ten || req.user.email || "Một người dùng";
        await notificationService.createNotification({
          senderId: req.user.nguoi_dung_id,
          receiverId: image.nguoi_dung_id,
          imageId: imageId,
          type: "LIKE",
          content: `${senderName} đã thả tim cho ảnh "${image.ten_hinh}" của bạn.`,
        });
      }
    }

    // Đếm tổng số like hiện tại
    const likeCount = await prisma.tym_anh.count({
      where: { hinh_id: imageId },
    });

    return {
      isLiked,
      likeCount,
      imageId,
      message: isLiked ? "Đã thả tim hình ảnh" : "Đã bỏ tim hình ảnh",
    };
  },

  async checkLikeImage(req) {
    const imageId = Number(req.params.imageId);
    if (!imageId) {
      throw new BadRequestException("ID hình ảnh không hợp lệ");
    }

    let isLiked = false;
    if (req.user) {
      const existingLike = await prisma.tym_anh.findUnique({
        where: {
          nguoi_dung_id_hinh_id: {
            nguoi_dung_id: req.user.nguoi_dung_id,
            hinh_id: imageId,
          },
        },
      });
      isLiked = !!existingLike;
    }

    const likeCount = await prisma.tym_anh.count({
      where: { hinh_id: imageId },
    });

    return {
      isLiked,
      likeCount,
      imageId,
    };
  },

  // ========================== LIKE COMMENT ==========================
  async toggleLikeComment(req) {
    const commentId = Number(req.params.commentId || req.body.commentId);
    if (!commentId) {
      throw new BadRequestException("ID bình luận không hợp lệ");
    }

    const comment = await prisma.binh_luan.findFirst({
      where: { binh_luan_id: commentId, isDeleted: false },
      include: {
        nguoi_dung: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException("Bình luận không tồn tại");
    }

    const existingLike = await prisma.tym_binh_luan.findUnique({
      where: {
        nguoi_dung_id_binh_luan_id: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          binh_luan_id: commentId,
        },
      },
    });

    let isLiked = false;
    if (existingLike) {
      // Đã thích -> Bỏ thích
      await prisma.tym_binh_luan.delete({
        where: {
          nguoi_dung_id_binh_luan_id: {
            nguoi_dung_id: req.user.nguoi_dung_id,
            binh_luan_id: commentId,
          },
        },
      });
      isLiked = false;
    } else {
      // Chưa thích -> Thả tim
      await prisma.tym_binh_luan.create({
        data: {
          nguoi_dung_id: req.user.nguoi_dung_id,
          binh_luan_id: commentId,
        },
      });
      isLiked = true;
    }

    // Đếm tổng số like bình luận
    const likeCount = await prisma.tym_binh_luan.count({
      where: { binh_luan_id: commentId },
    });

    return {
      isLiked,
      likeCount,
      commentId,
      message: isLiked ? "Đã thả tim bình luận" : "Đã bỏ tim bình luận",
    };
  },

  // ========================== GET USER LIKED LISTS ==========================
  async getUserLikedImages(req) {
    const targetUserId = req.params.userId ? Number(req.params.userId) : req.user?.nguoi_dung_id;
    if (!targetUserId) {
      throw new BadRequestException("ID người dùng không hợp lệ");
    }

    const viewerId = req.user?.nguoi_dung_id;
    const isSelf = viewerId === targetUserId;

    if (!isSelf) {
      const targetUser = await prisma.nguoi_dung.findUnique({
        where: { nguoi_dung_id: targetUserId },
        select: { quyen_rieng_tu: true },
      });
      let priv = { liked_pins: "PUBLIC" };
      if (targetUser?.quyen_rieng_tu) {
        try { priv = { ...priv, ...JSON.parse(targetUser.quyen_rieng_tu) }; } catch (e) {}
      }
      if (priv.liked_pins === "PRIVATE") return [];
      if (priv.liked_pins === "FOLLOWERS") {
        if (!viewerId) return [];
        const isFollowing = await prisma.theo_doi.findUnique({
          where: {
            nguoi_theo_doi_id_nguoi_duoc_theo_doi_id: {
              nguoi_theo_doi_id: viewerId,
              nguoi_duoc_theo_doi_id: targetUserId,
            },
          },
        });
        if (!isFollowing) return [];
      }
    }

    const likedRecords = await prisma.tym_anh.findMany({
      where: {
        nguoi_dung_id: targetUserId,
        hinh_anh: {
          isDeleted: false,
        },
      },
      orderBy: {
        ngay_tym: "desc",
      },
      include: {
        hinh_anh: {
          include: {
            nguoi_dung: {
              select: {
                nguoi_dung_id: true,
                ho_ten: true,
                anh_dai_dien: true,
              },
            },
          },
        },
      },
    });

    return likedRecords.map((record) => record.hinh_anh);
  },

  async getUserLikedComments(req) {
    const targetUserId = req.params.userId ? Number(req.params.userId) : req.user?.nguoi_dung_id;
    if (!targetUserId) {
      throw new BadRequestException("ID người dùng không hợp lệ");
    }

    const viewerId = req.user?.nguoi_dung_id;
    const isSelf = viewerId === targetUserId;

    if (!isSelf) {
      const targetUser = await prisma.nguoi_dung.findUnique({
        where: { nguoi_dung_id: targetUserId },
        select: { quyen_rieng_tu: true },
      });
      let priv = { liked_comments: "PUBLIC" };
      if (targetUser?.quyen_rieng_tu) {
        try { priv = { ...priv, ...JSON.parse(targetUser.quyen_rieng_tu) }; } catch (e) {}
      }
      if (priv.liked_comments === "PRIVATE") return [];
      if (priv.liked_comments === "FOLLOWERS") {
        if (!viewerId) return [];
        const isFollowing = await prisma.theo_doi.findUnique({
          where: {
            nguoi_theo_doi_id_nguoi_duoc_theo_doi_id: {
              nguoi_theo_doi_id: viewerId,
              nguoi_duoc_theo_doi_id: targetUserId,
            },
          },
        });
        if (!isFollowing) return [];
      }
    }

    const likedRecords = await prisma.tym_binh_luan.findMany({
      where: {
        nguoi_dung_id: targetUserId,
        binh_luan: {
          isDeleted: false,
        },
      },
      orderBy: {
        ngay_tym: "desc",
      },
      include: {
        binh_luan: {
          include: {
            nguoi_dung: {
              select: {
                nguoi_dung_id: true,
                ho_ten: true,
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
        },
      },
    });

    return likedRecords.map((record) => record.binh_luan);
  },

  async batchUnlikeImages(req) {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Danh sách ID không hợp lệ");
    }

    const numIds = ids.map(Number).filter(Boolean);

    await prisma.tym_anh.deleteMany({
      where: {
        nguoi_dung_id: req.user.nguoi_dung_id,
        hinh_id: { in: numIds },
      },
    });

    return { message: `Đã bỏ thích thành công ${numIds.length} hình ảnh`, count: numIds.length };
  },

  async batchUnlikeComments(req) {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Danh sách ID không hợp lệ");
    }

    const numIds = ids.map(Number).filter(Boolean);

    await prisma.tym_binh_luan.deleteMany({
      where: {
        nguoi_dung_id: req.user.nguoi_dung_id,
        binh_luan_id: { in: numIds },
      },
    });

    return { message: `Đã bỏ thích thành công ${numIds.length} bình luận`, count: numIds.length };
  },
};

