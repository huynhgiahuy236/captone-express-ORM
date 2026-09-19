import { BadRequestException, NotFoundException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import { uploadToCloudinary } from "../common/cloudinary/init.cloudinary.js";

export const userService = {
  async getProfile(req) {
    const userId = req.user.nguoi_dung_id;
    const [user, followersCount, followingCount] = await Promise.all([
      prisma.nguoi_dung.findUnique({
        where: { nguoi_dung_id: userId },
        include: {
          _count: {
            select: {
              hinh_anh: { where: { isDeleted: false } },
              luu_anh: true,
            },
          },
        },
      }),
      prisma.theo_doi.count({ where: { nguoi_duoc_theo_doi_id: userId } }),
      prisma.theo_doi.count({ where: { nguoi_theo_doi_id: userId } }),
    ]);

    let privacySettings = {
      created: "PUBLIC",
      saved: "PUBLIC",
      liked_pins: "PUBLIC",
      liked_comments: "PUBLIC",
      followers: "PUBLIC",
      following: "PUBLIC",
    };

    if (user?.quyen_rieng_tu) {
      try {
        privacySettings = { ...privacySettings, ...JSON.parse(user.quyen_rieng_tu) };
      } catch (e) {}
    }

    return {
      ...user,
      followersCount,
      followingCount,
      privacySettings,
    };
  },

  async getUserById(req) {
    const userId = Number(req.params.userId);
    if (!userId) {
      throw new BadRequestException("ID người dùng không hợp lệ");
    }

    const viewerId = req.user?.nguoi_dung_id;
    const isSelf = viewerId === userId;

    const [user, followersCount, followingCount, isFollowingRecord] = await Promise.all([
      prisma.nguoi_dung.findUnique({
        where: { nguoi_dung_id: userId, isDeleted: false },
        select: {
          nguoi_dung_id: true,
          ho_ten: true,
          email: true,
          tuoi: true,
          anh_dai_dien: true,
          mo_ta: true,
          quyen_rieng_tu: true,
          createdAt: true,
          _count: {
            select: {
              hinh_anh: { where: { isDeleted: false } },
              luu_anh: true,
            },
          },
        },
      }),
      prisma.theo_doi.count({ where: { nguoi_duoc_theo_doi_id: userId } }),
      prisma.theo_doi.count({ where: { nguoi_theo_doi_id: userId } }),
      viewerId && !isSelf
        ? prisma.theo_doi.findUnique({
            where: {
              nguoi_theo_doi_id_nguoi_duoc_theo_doi_id: {
                nguoi_theo_doi_id: viewerId,
                nguoi_duoc_theo_doi_id: userId,
              },
            },
          })
        : null,
    ]);

    if (!user) {
      throw new NotFoundException("Không tìm thấy thông tin tác giả");
    }

    const isFollowing = Boolean(isFollowingRecord);

    let privacySettings = {
      created: "PUBLIC",
      saved: "PUBLIC",
      liked_pins: "PUBLIC",
      liked_comments: "PUBLIC",
      followers: "PUBLIC",
      following: "PUBLIC",
    };

    if (user.quyen_rieng_tu) {
      try {
        privacySettings = { ...privacySettings, ...JSON.parse(user.quyen_rieng_tu) };
      } catch (e) {}
    }

    const checkTabAccess = (setting) => {
      if (isSelf) return true;
      if (setting === "PUBLIC") return true;
      if (setting === "FOLLOWERS" && isFollowing) return true;
      return false; // PRIVATE or not followed
    };

    return {
      ...user,
      followersCount,
      followingCount,
      isFollowing,
      privacySettings,
      canViewCreated: checkTabAccess(privacySettings.created),
      canViewSaved: checkTabAccess(privacySettings.saved),
      canViewLikedPins: checkTabAccess(privacySettings.liked_pins),
      canViewLikedComments: checkTabAccess(privacySettings.liked_comments),
      canViewFollowers: checkTabAccess(privacySettings.followers || "PUBLIC"),
      canViewFollowing: checkTabAccess(privacySettings.following || "PUBLIC"),
    };
  },

  async updatePrivacySettings(req) {
    const { created, saved, liked_pins, liked_comments, followers, following } = req.body;
    const validLevels = ["PUBLIC", "FOLLOWERS", "PRIVATE"];

    const currentSettings = {
      created: validLevels.includes(created) ? created : "PUBLIC",
      saved: validLevels.includes(saved) ? saved : "PUBLIC",
      liked_pins: validLevels.includes(liked_pins) ? liked_pins : "PUBLIC",
      liked_comments: validLevels.includes(liked_comments) ? liked_comments : "PUBLIC",
      followers: validLevels.includes(followers) ? followers : "PUBLIC",
      following: validLevels.includes(following) ? following : "PUBLIC",
    };

    await prisma.nguoi_dung.update({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
      data: {
        quyen_rieng_tu: JSON.stringify(currentSettings),
      },
    });

    return currentSettings;
  },

  async getSavedImagesByUser(req) {
    const targetUserId = req.params.userId ? Number(req.params.userId) : req.user?.nguoi_dung_id;
    if (!targetUserId) {
      throw new BadRequestException("ID người dùng không hợp lệ");
    }

    const viewerId = req.user?.nguoi_dung_id;
    const isSelf = viewerId === targetUserId;

    // Check privacy if viewing another user's saved images
    if (!isSelf) {
      const targetUser = await prisma.nguoi_dung.findUnique({
        where: { nguoi_dung_id: targetUserId },
        select: { quyen_rieng_tu: true },
      });
      let priv = { saved: "PUBLIC" };
      if (targetUser?.quyen_rieng_tu) {
        try { priv = { ...priv, ...JSON.parse(targetUser.quyen_rieng_tu) }; } catch (e) {}
      }
      if (priv.saved === "PRIVATE") return [];
      if (priv.saved === "FOLLOWERS") {
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

    const savedRecords = await prisma.luu_anh.findMany({
      where: {
        nguoi_dung_id: targetUserId,
        hinh_anh: {
          isDeleted: false,
        },
      },
      orderBy: { ngay_luu: "desc" },
      include: {
        hinh_anh: {
          include: {
            nguoi_dung: {
              select: {
                nguoi_dung_id: true,
                ho_ten: true,
                anh_dai_dien: true,
                mo_ta: true,
              },
            },
          },
        },
      },
    });

    return savedRecords.map((item) => ({
      ...item.hinh_anh,
      ngay_luu: item.ngay_luu,
    }));
  },

  async getCreatedImagesByUser(req) {
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
      let priv = { created: "PUBLIC" };
      if (targetUser?.quyen_rieng_tu) {
        try { priv = { ...priv, ...JSON.parse(targetUser.quyen_rieng_tu) }; } catch (e) {}
      }
      if (priv.created === "PRIVATE") return [];
      if (priv.created === "FOLLOWERS") {
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

    const images = await prisma.hinh_anh.findMany({
      where: {
        nguoi_dung_id: targetUserId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        nguoi_dung: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
            email: true,
            anh_dai_dien: true,
            mo_ta: true,
          },
        },
        _count: {
          select: {
            luu_anh: true,
            binh_luan: true,
          },
        },
      },
    });

    return images;
  },

  async updateProfile(req) {
    const { fullName, age, bio, mo_ta } = req.body;
    const updateData = {};

    if (fullName !== undefined) {
      updateData.ho_ten = fullName;
    }
    if (age !== undefined && age !== null && age !== "" && age !== "null" && age !== "undefined") {
      const parsedAge = Number(age);
      if (!isNaN(parsedAge)) {
        updateData.tuoi = parsedAge;
      }
    }
    if (bio !== undefined || mo_ta !== undefined) {
      updateData.mo_ta = bio ?? mo_ta;
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "capstone-pinterest/avatars");
      updateData.anh_dai_dien = uploadResult.secure_url;
    } else if (req.body.avatarUrl) {
      updateData.anh_dai_dien = req.body.avatarUrl;
    }

    const updatedUser = await prisma.nguoi_dung.update({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
      data: updateData,
    });

    return updatedUser;
  },
};
