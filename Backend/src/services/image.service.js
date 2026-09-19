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
    const rawSearch = String(req.query.name || req.query.search || "").trim();

    if (!rawSearch) {
      return prisma.hinh_anh.findMany({
        where: { isDeleted: false },
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
    }

    // Helper: Chuyển đổi bỏ dấu tiếng Việt
    const removeVietnameseTones = (str) =>
      (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();

    // Helper: Tách các từ riêng lẻ
    const cleanWords = (str) =>
      (str || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean);

    // Helper: Kiểm tra từ / cụm từ độc lập (tránh 'cho' ăn nhầm 'chơi')
    const isWordOrPhraseMatch = (fullText, sub) => {
      if (!fullText || !sub) return false;
      const escaped = sub.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|\\s|[.,!?:;\\-_/])${escaped}($|\\s|[.,!?:;\\-_/])`, "i");
      return regex.test(fullText);
    };

    const CATEGORY_SYNONYMS = {
      "thú cưng": ["chó", "mèo", "cún", "pet", "dog", "cat", "puppy", "kitten", "thú", "động vật"],
      "xe cộ": ["xe", "oto", "ô tô", "car", "motor", "mô tô", "xe máy", "bike", "phương tiện", "mustang", "porsche", "nissan"],
      "công nghệ": ["tech", "game", "code", "máy tính", "laptop", "điện thoại", "phone", "ai", "ps4", "ps5", "tay cầm"],
      "thiên nhiên": ["nature", "hoa", "cây", "rừng", "biển", "núi", "cảnh", "mây", "trời", "hoàng hôn"],
      "ẩm thực": ["food", "món", "ăn", "uống", "nấu", "bánh", "cafe", "cà phê", "trà", "nước", "salad"],
      "nghệ thuật": ["art", "vẽ", "tranh", "design", "thiết kế", "họa", "sơn dầu", "sketch"],
      "kiến trúc": ["nhà", "building", "phòng", "nội thất", "kiến trúc", "công trình", "tháp", "chùa"],
      "thời trang": ["fashion", "áo", "quần", "váy", "giày", "túi", "style", "outfit", "mặc"],
    };

    const query = rawSearch.toLowerCase();
    const unaccentedQuery = removeVietnameseTones(query);
    const queryWords = cleanWords(query);
    const unaccentedQueryWords = queryWords.map(removeVietnameseTones);

    const allImages = await prisma.hinh_anh.findMany({
      where: { isDeleted: false },
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

    const scored = [];

    for (const img of allImages) {
      const title = (img.ten_hinh || "").toLowerCase();
      const desc = (img.mo_ta || "").toLowerCase();
      const cat = (img.the_loai || "").toLowerCase();

      const titleWords = cleanWords(title);
      const descWords = cleanWords(desc);
      const catWords = cleanWords(cat);

      const unTitleWords = titleWords.map(removeVietnameseTones);
      const unDescWords = descWords.map(removeVietnameseTones);
      const unCatWords = catWords.map(removeVietnameseTones);

      const unTitle = removeVietnameseTones(title);
      const unDesc = removeVietnameseTones(desc);
      const unCat = removeVietnameseTones(cat);

      let score = 0;

      // 1. Khớp chính xác cả cụm từ có dấu trong tiêu đề/thể loại (Ưu tiên cao nhất)
      if (title.includes(query)) score += 120;
      else if (isWordOrPhraseMatch(unTitle, unaccentedQuery)) score += 60;

      if (cat.includes(query)) score += 60;
      else if (isWordOrPhraseMatch(unCat, unaccentedQuery)) score += 30;

      if (desc.includes(query)) score += 40;
      else if (isWordOrPhraseMatch(unDesc, unaccentedQuery)) score += 20;

      // 2. So khớp từng từ nguyên vẹn (Whole-word matching)
      queryWords.forEach((word, idx) => {
        const unWord = unaccentedQueryWords[idx];

        if (titleWords.includes(word)) score += 40;
        else if (unTitleWords.includes(unWord)) score += 25;

        if (catWords.includes(word)) score += 35;
        else if (unCatWords.includes(unWord)) score += 20;

        if (descWords.includes(word)) score += 15;
        else if (unDescWords.includes(unWord)) score += 10;
      });

      // 3. Khớp đa từ (Khi người dùng gõ từ 2 từ trở lên: ví dụ "chó vàng", "tay cầm ps4")
      if (queryWords.length > 1) {
        const allDocWords = [...titleWords, ...descWords, ...catWords];
        const allUnDocWords = [...unTitleWords, ...unDescWords, ...unCatWords];

        const allExact = queryWords.every((w) => allDocWords.includes(w));
        const allUnaccented = unaccentedQueryWords.every((w) => allUnDocWords.includes(w));

        if (allExact) score += 80;
        else if (allUnaccented) score += 45;
      }

      // 4. Khớp từ đồng nghĩa & thể loại liên quan
      for (const [categoryName, keywords] of Object.entries(CATEGORY_SYNONYMS)) {
        if (cat.includes(categoryName)) {
          for (const kw of keywords) {
            const unKw = removeVietnameseTones(kw);
            if (queryWords.includes(kw) || unaccentedQueryWords.includes(unKw)) {
              score += 20;
              break;
            }
          }
        }
      }

      if (score > 0) {
        scored.push({ img, score });
      }
    }

    // Sắp xếp theo điểm độ liên quan giảm dần (Relevance Ranking)
    scored.sort((a, b) => b.score - a.score);

    return scored.map((item) => item.img);
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

  async batchDeleteImages(req) {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException("Danh sách ID không hợp lệ");
    }

    const numIds = ids.map(Number).filter(Boolean);

    await prisma.hinh_anh.updateMany({
      where: {
        hinh_id: { in: numIds },
        nguoi_dung_id: req.user.nguoi_dung_id,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.nguoi_dung_id,
      },
    });

    return { message: `Đã xóa thành công ${numIds.length} hình ảnh`, count: numIds.length };
  },
};

