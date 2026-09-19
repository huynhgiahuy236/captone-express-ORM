import { BadRequestException, NotFoundException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import { uploadToCloudinary } from "../common/cloudinary/init.cloudinary.js";

export const userService = {
  async getProfile(req) {
    const user = await prisma.nguoi_dung.findUnique({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
      include: {
        _count: {
          select: {
            hinh_anh: { where: { isDeleted: false } },
            luu_anh: true,
          },
        },
      },
    });

    return user;
  },

  async getUserById(req) {
    const userId = Number(req.params.userId);
    if (!userId) {
      throw new BadRequestException("ID người dùng không hợp lệ");
    }

    const user = await prisma.nguoi_dung.findUnique({
      where: { nguoi_dung_id: userId, isDeleted: false },
      select: {
        nguoi_dung_id: true,
        ho_ten: true,
        email: true,
        tuoi: true,
        anh_dai_dien: true,
        mo_ta: true,
        createdAt: true,
        _count: {
          select: {
            hinh_anh: { where: { isDeleted: false } },
            luu_anh: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("Không tìm thấy thông tin tác giả");
    }

    return user;
  },

  async getSavedImagesByUser(req) {
    const targetUserId = req.params.userId ? Number(req.params.userId) : req.user.nguoi_dung_id;

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

    // Trả về danh sách hình ảnh đã lưu
    const savedImages = savedRecords.map((item) => ({
      ...item.hinh_anh,
      ngay_luu: item.ngay_luu,
    }));

    return savedImages;
  },

  async getCreatedImagesByUser(req) {
    const targetUserId = req.params.userId ? Number(req.params.userId) : req.user.nguoi_dung_id;

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
    if (age !== undefined && age !== null && age !== "") {
      updateData.tuoi = Number(age);
    }
    if (bio !== undefined || mo_ta !== undefined) {
      updateData.mo_ta = bio ?? mo_ta;
    }

    // Nếu người dùng upload file avatar mới
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
