import { BadRequestException, NotFoundException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const followService = {
  async toggleFollow(req) {
    const followerId = req.user.nguoi_dung_id;
    const authorId = Number(req.params.authorId);

    if (!authorId || isNaN(authorId)) {
      throw new BadRequestException("ID tác giả không hợp lệ");
    }

    if (followerId === authorId) {
      throw new BadRequestException("Bạn không thể tự theo dõi chính mình");
    }

    const author = await prisma.nguoi_dung.findFirst({
      where: { nguoi_dung_id: authorId, isDeleted: false },
    });

    if (!author) {
      throw new NotFoundException("Tác giả không tồn tại hoặc đã bị xóa");
    }

    const existingFollow = await prisma.theo_doi.findUnique({
      where: {
        nguoi_theo_doi_id_nguoi_duoc_theo_doi_id: {
          nguoi_theo_doi_id: followerId,
          nguoi_duoc_theo_doi_id: authorId,
        },
      },
    });

    let isFollowing = false;
    let message = "";

    if (existingFollow) {
      await prisma.theo_doi.delete({
        where: {
          theo_doi_id: existingFollow.theo_doi_id,
        },
      });
      isFollowing = false;
      message = `Đã hủy theo dõi ${author.ho_ten || "tác giả"}`;
    } else {
      await prisma.theo_doi.create({
        data: {
          nguoi_theo_doi_id: followerId,
          nguoi_duoc_theo_doi_id: authorId,
        },
      });
      isFollowing = true;
      message = `Đã theo dõi ${author.ho_ten || "tác giả"}`;

      // Tạo thông báo nếu theo dõi mới
      try {
        await prisma.thong_bao.create({
          data: {
            nguoi_gui_id: followerId,
            nguoi_nhan_id: authorId,
            loai: "FOLLOW",
            noi_dung: `${req.user.ho_ten || "Một người dùng"} đã bắt đầu theo dõi bạn`,
          },
        });
      } catch (notifErr) {
        console.error("Lỗi gửi thông báo follow:", notifErr);
      }
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.theo_doi.count({ where: { nguoi_duoc_theo_doi_id: authorId } }),
      prisma.theo_doi.count({ where: { nguoi_theo_doi_id: authorId } }),
    ]);

    return {
      isFollowing,
      message,
      followersCount,
      followingCount,
    };
  },

  async checkFollowStatus(req) {
    const authorId = Number(req.params.authorId);
    if (!authorId || isNaN(authorId)) {
      throw new BadRequestException("ID tác giả không hợp lệ");
    }

    let isFollowing = false;
    if (req.user && req.user.nguoi_dung_id) {
      const existing = await prisma.theo_doi.findUnique({
        where: {
          nguoi_theo_doi_id_nguoi_duoc_theo_doi_id: {
            nguoi_theo_doi_id: req.user.nguoi_dung_id,
            nguoi_duoc_theo_doi_id: authorId,
          },
        },
      });
      isFollowing = Boolean(existing);
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.theo_doi.count({ where: { nguoi_duoc_theo_doi_id: authorId } }),
      prisma.theo_doi.count({ where: { nguoi_theo_doi_id: authorId } }),
    ]);

    return {
      isFollowing,
      followersCount,
      followingCount,
    };
  },

  async getFollowers(req) {
    const targetUserId = Number(req.params.userId || req.user?.nguoi_dung_id);
    if (!targetUserId || isNaN(targetUserId)) {
      throw new BadRequestException("ID người dùng không hợp lệ");
    }

    const viewerId = req.user?.nguoi_dung_id;
    const isSelf = viewerId === targetUserId;

    // Check privacy settings if viewing another user's followers
    if (!isSelf) {
      const targetUser = await prisma.nguoi_dung.findUnique({
        where: { nguoi_dung_id: targetUserId },
        select: { quyen_rieng_tu: true },
      });
      let priv = { followers: "PUBLIC" };
      if (targetUser?.quyen_rieng_tu) {
        try { priv = { ...priv, ...JSON.parse(targetUser.quyen_rieng_tu) }; } catch (e) {}
      }
      if (priv.followers === "PRIVATE") return [];
      if (priv.followers === "FOLLOWERS") {
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

    const followers = await prisma.theo_doi.findMany({
      where: { nguoi_duoc_theo_doi_id: targetUserId },
      orderBy: { createdAt: "desc" },
      include: {
        nguoi_theo_doi: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
            email: true,
            anh_dai_dien: true,
            mo_ta: true,
          },
        },
      },
    });

    const result = await Promise.all(
      followers.map(async (f) => {
        let isFollowing = false;
        if (viewerId && viewerId !== f.nguoi_theo_doi.nguoi_dung_id) {
          const followRecord = await prisma.theo_doi.findUnique({
            where: {
              nguoi_theo_doi_id_nguoi_duoc_theo_doi_id: {
                nguoi_theo_doi_id: viewerId,
                nguoi_duoc_theo_doi_id: f.nguoi_theo_doi.nguoi_dung_id,
              },
            },
          });
          isFollowing = Boolean(followRecord);
        }
        return {
          ...f.nguoi_theo_doi,
          isFollowing,
          followedAt: f.createdAt,
        };
      })
    );

    return result;
  },

  async getFollowing(req) {
    const targetUserId = Number(req.params.userId || req.user?.nguoi_dung_id);
    if (!targetUserId || isNaN(targetUserId)) {
      throw new BadRequestException("ID người dùng không hợp lệ");
    }

    const viewerId = req.user?.nguoi_dung_id;
    const isSelf = viewerId === targetUserId;

    // Check privacy settings if viewing another user's following list
    if (!isSelf) {
      const targetUser = await prisma.nguoi_dung.findUnique({
        where: { nguoi_dung_id: targetUserId },
        select: { quyen_rieng_tu: true },
      });
      let priv = { following: "PUBLIC" };
      if (targetUser?.quyen_rieng_tu) {
        try { priv = { ...priv, ...JSON.parse(targetUser.quyen_rieng_tu) }; } catch (e) {}
      }
      if (priv.following === "PRIVATE") return [];
      if (priv.following === "FOLLOWERS") {
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

    const following = await prisma.theo_doi.findMany({
      where: { nguoi_theo_doi_id: targetUserId },
      orderBy: { createdAt: "desc" },
      include: {
        nguoi_duoc_theo_doi: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
            email: true,
            anh_dai_dien: true,
            mo_ta: true,
          },
        },
      },
    });

    const result = await Promise.all(
      following.map(async (f) => {
        let isFollowing = false;
        if (viewerId && viewerId !== f.nguoi_duoc_theo_doi.nguoi_dung_id) {
          const followRecord = await prisma.theo_doi.findUnique({
            where: {
              nguoi_theo_doi_id_nguoi_duoc_theo_doi_id: {
                nguoi_theo_doi_id: viewerId,
                nguoi_duoc_theo_doi_id: f.nguoi_duoc_theo_doi.nguoi_dung_id,
              },
            },
          });
          isFollowing = Boolean(followRecord);
        }
        return {
          ...f.nguoi_duoc_theo_doi,
          isFollowing,
          followedAt: f.createdAt,
        };
      })
    );

    return result;
  },
};
