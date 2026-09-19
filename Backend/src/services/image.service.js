import { BadRequestException, ForbiddenException, NotFoundException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../common/cloudinary/init.cloudinary.js";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";

export const imageService = {
  async getImages(req) {
    const { where, page, pageSize, index } = buildQueryPrisma(req);

    const [totalItems, items] = await Promise.all([
      prisma.hinh_anh.count({ where }),
      prisma.hinh_anh.findMany({
        where,
        skip: index,
        take: pageSize,
        orderBy: { createdAt: "desc" },
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
              luu_anh: true,
              binh_luan: true,
              tym_anh: true,
            },
          },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      items,
    };
  },

  async searchImages(req) {
    const searchName = req.query.name || req.query.search || "";

    const images = await prisma.hinh_anh.findMany({
      where: {
        isDeleted: false,
        ten_hinh: {
          contains: String(searchName),
        },
      },
      orderBy: { createdAt: "desc" },
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
            luu_anh: true,
            binh_luan: true,
            tym_anh: true,
          },
        },
      },
    });

    return images;
  },

  async getImageDetail(req) {
    const hinhId = Number(req.params.id);
    if (!hinhId) {
      throw new BadRequestException("ID hình ảnh không hợp lệ");
    }

    const image = await prisma.hinh_anh.findFirst({
      where: {
        hinh_id: hinhId,
        isDeleted: false,
      },
      include: {
        nguoi_dung: {
          select: {
            nguoi_dung_id: true,
            ho_ten: true,
            email: true,
            anh_dai_dien: true,
          },
        },
        _count: {
          select: {
            luu_anh: true,
            binh_luan: true,
            tym_anh: true,
          },
        },
      },
    });

    if (!image) {
      throw new NotFoundException("Không tìm thấy hình ảnh yêu cầu");
    }

    let isLiked = false;
    let isSaved = false;

    if (req.user?.nguoi_dung_id) {
      const [likeRecord, saveRecord] = await Promise.all([
        prisma.tym_anh.findUnique({
          where: {
            nguoi_dung_id_hinh_id: {
              nguoi_dung_id: req.user.nguoi_dung_id,
              hinh_id: hinhId,
            },
          },
        }),
        prisma.luu_anh.findUnique({
          where: {
            nguoi_dung_id_hinh_id: {
              nguoi_dung_id: req.user.nguoi_dung_id,
              hinh_id: hinhId,
            },
          },
        }),
      ]);
      isLiked = !!likeRecord;
      isSaved = !!saveRecord;
    }

    return {
      ...image,
      isLiked,
      isSaved,
      likeCount: image._count?.tym_anh || 0,
      saveCount: image._count?.luu_anh || 0,
      commentCount: image._count?.binh_luan || 0,
    };
  },

  async createImage(req) {
    const { title, description } = req.body;

    if (!title || title.trim().length < 10) {
      throw new BadRequestException("Tiêu đề Ghim phải có ít nhất 10 ký tự");
    }

    if (!description || description.trim().length < 10) {
      throw new BadRequestException("Mô tả Ghim bắt buộc và phải có ít nhất 10 ký tự");
    }

    let imageUrl = req.body.imageUrl || "";

    // Nếu người dùng upload file từ máy tính
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "capstone-pinterest/pins");
      imageUrl = uploadResult.secure_url;
    }

    if (!imageUrl) {
      throw new BadRequestException("Vui lòng chọn file hình ảnh hoặc cung cấp đường dẫn ảnh");
    }

    const category = req.body.the_loai || req.body.category || "Nghệ thuật";

    const newImage = await prisma.hinh_anh.create({
      data: {
        ten_hinh: title,
        mo_ta: description || null,
        duong_dan: imageUrl,
        the_loai: category,
        nguoi_dung_id: req.user.nguoi_dung_id,
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

    return newImage;
  },

  async deleteImage(req) {
    const hinhId = Number(req.params.id);
    if (!hinhId) {
      throw new BadRequestException("ID hình ảnh không hợp lệ");
    }

    const image = await prisma.hinh_anh.findFirst({
      where: {
        hinh_id: hinhId,
        isDeleted: false,
      },
    });

    if (!image) {
      throw new NotFoundException("Hình ảnh không tồn tại hoặc đã bị xóa");
    }

    // Kiểm tra quyền sở hữu ảnh
    if (image.nguoi_dung_id !== req.user.nguoi_dung_id) {
      throw new ForbiddenException("Bạn không có quyền xóa hình ảnh của người khác");
    }

    await prisma.hinh_anh.update({
      where: { hinh_id: hinhId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.nguoi_dung_id,
      },
    });

    return { message: "Xóa hình ảnh thành công", hinh_id: hinhId };
  },
};
