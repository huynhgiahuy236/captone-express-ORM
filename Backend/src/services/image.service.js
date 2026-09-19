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

    const WORD_SYNONYMS = {
      "biển": ["biển", "đại dương", "bãi biển", "bờ biển", "hải đảo", "ocean", "sea", "beach", "sóng biển"],
      "núi": ["núi", "đỉnh núi", "đồi", "mountain", "hill", "dãy núi"],
      "rừng": ["rừng", "cây", "forest", "jungle", "nguyên sinh"],
      "hoa": ["hoa", "bông", "flower", "rose", "tulip"],
      "chó": ["chó", "cún", "dog", "puppy", "corgi", "husky", "shiba", "golden", "poodle", "bulldog"],
      "mèo": ["mèo", "kitten", "meo", "mimi", "mướp", "scottish fold", "tai cụp"],
      "xe": ["xe", "oto", "ô tô", "car", "motor", "mô tô", "xe máy", "bike", "phương tiện", "mustang", "porsche", "nissan", "bmw", "audi", "ferrari", "lamborghini", "siêu xe"],
      "công nghệ": ["tech", "máy tính", "laptop", "điện thoại", "phone", "ai", "ps4", "ps5", "tay cầm", "setup", "pc", "gadget", "bàn phím"],
      "game": ["game", "gaming", "gamer", "cyberpunk", "trò chơi"],
      "ẩm thực": ["food", "món", "ăn", "uống", "nấu", "bánh", "cafe", "cà phê", "trà", "nước", "salad", "nướng", "quán", "cooking", "matcha"],
      "anime": ["anime", "manga", "gundam", "wibu", "otaku", "hoạt hình"],
      "kiến trúc": ["nhà", "building", "phòng", "nội thất", "kiến trúc", "công trình", "tháp", "chùa", "decor", "interior", "minimalist", "villa"],
      "thời trang": ["fashion", "áo", "quần", "váy", "giày", "túi", "style", "outfit", "mặc", "streetwear"],
    };

    const STOP_WORDS_MODIFIERS = [
      "đẹp", "xinh", "cute", "ngon", "hay", "hot", "cực", "rất", "nhiều", "nhất", "dễ thương",
      "cool", "ngầu", "vip", "pro", "nhỏ", "to", "lớn", "đỉnh", "chất", "mới", "xịn", "top", "siêu"
    ];

    const unaccentedStopWords = STOP_WORDS_MODIFIERS.map(removeVietnameseTones);

    const query = rawSearch.toLowerCase();
    const unaccentedQuery = removeVietnameseTones(query);
    const queryWords = cleanWords(query);
    const unaccentedQueryWords = queryWords.map(removeVietnameseTones);

    // Xác định các từ khóa cốt lõi (loại bỏ từ bổ nghĩa)
    let coreWords = queryWords.filter((w, idx) => !unaccentedStopWords.includes(unaccentedQueryWords[idx]));
    if (coreWords.length === 0) coreWords = queryWords;

    const isTokenMatch = (origWords, unaccentedWords, target) => {
      if (!target) return false;
      const targetTokens = cleanWords(target);
      const unTargetTokens = targetTokens.map(removeVietnameseTones);

      if (targetTokens.length === 1) {
        const single = targetTokens[0];
        const unSingle = unTargetTokens[0];

        // Nếu từ có dấu tiếng Việt (ví dụ: 'chó', 'mèo', 'cún') -> ưu tiên so khớp có dấu
        if (single !== unSingle) {
          if (origWords.includes(single)) return true;
        }
        // Tránh từ 'cho' ăn nhầm giới từ 'cho' trong mô tả
        if (unSingle === "cho") {
          return origWords.includes("chó");
        }
        if (unSingle.length <= 3) {
          return unaccentedWords.includes(unSingle);
        }
        return unaccentedWords.some((w) => w === unSingle || w.startsWith(unSingle));
      }

      // Khớp cụm từ nhiều từ (Multi-word phrase) theo thứ tự từ liền kề
      for (let i = 0; i <= unaccentedWords.length - unTargetTokens.length; i++) {
        let match = true;
        for (let j = 0; j < unTargetTokens.length; j++) {
          if (unaccentedWords[i + j] !== unTargetTokens[j]) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
      return false;
    };

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
      const author = (img.nguoi_dung?.ho_ten || "").toLowerCase();

      const unTitle = removeVietnameseTones(title);
      const unDesc = removeVietnameseTones(desc);
      const unCat = removeVietnameseTones(cat);
      const unAuthor = removeVietnameseTones(author);

      const titleWords = cleanWords(title);
      const descWords = cleanWords(desc);
      const catWords = cleanWords(cat);
      const authorWords = cleanWords(author);

      const unTitleWords = titleWords.map(removeVietnameseTones);
      const unDescWords = descWords.map(removeVietnameseTones);
      const unCatWords = catWords.map(removeVietnameseTones);
      const unAuthorWords = authorWords.map(removeVietnameseTones);

      const origDocWords = [...titleWords, ...catWords, ...authorWords, ...descWords];
      const allDocWords = [...unTitleWords, ...unCatWords, ...unAuthorWords, ...unDescWords];

      // BẮT BUỘC: Nếu người dùng có gõ từ khóa cốt lõi (ví dụ 'chó', 'biển' trong 'biển đẹp', 'xe' trong 'xe đẹp'),
      // bài viết bắt buộc phải khớp ít nhất một từ cốt lõi hoặc từ đồng nghĩa chính xác của nó.
      const matchesAnyCore = coreWords.some((cw) => {
        if (isTokenMatch(origDocWords, allDocWords, cw)) return true;
        const unCw = removeVietnameseTones(cw);
        for (const [, keywords] of Object.entries(WORD_SYNONYMS)) {
          const unKeywords = keywords.map(removeVietnameseTones);
          if (unKeywords.includes(unCw) || keywords.includes(cw)) {
            if (keywords.some((syn) => isTokenMatch(origDocWords, allDocWords, syn))) {
              return true;
            }
          }
        }
        return false;
      });

      if (!matchesAnyCore) {
        continue; // Loại bỏ hoàn toàn các ảnh không khớp từ cốt lõi
      }

      let score = 0;

      // 1. Khớp chính xác toàn bộ chuỗi tìm kiếm (Exact phrase match)
      if (title.includes(query)) score += 150;
      else if (unTitle.includes(unaccentedQuery)) score += 100;

      if (cat.includes(query)) score += 80;
      else if (unCat.includes(unaccentedQuery)) score += 60;

      if (author.includes(query)) score += 70;
      else if (unAuthor.includes(unaccentedQuery)) score += 50;

      if (desc.includes(query)) score += 40;
      else if (unDesc.includes(unaccentedQuery)) score += 30;

      // 2. So khớp linh hoạt từng từ (Flexible Token & Prefix matching)
      queryWords.forEach((word, idx) => {
        const unWord = unaccentedQueryWords[idx];
        if (!unWord || unWord.length < 2) return;

        const isCore = !unaccentedStopWords.includes(unWord);
        const weightMultiplier = isCore ? 1.5 : 0.4;

        if (titleWords.some((w) => w === word)) score += 40 * weightMultiplier;
        else if (unTitleWords.some((w) => w === unWord)) score += 30 * weightMultiplier;
        else if (unTitleWords.some((w) => w.startsWith(unWord))) score += 20 * weightMultiplier;

        if (catWords.some((w) => w === word)) score += 35 * weightMultiplier;
        else if (unCatWords.some((w) => w === unWord)) score += 25 * weightMultiplier;

        if (descWords.some((w) => w === word)) score += 15 * weightMultiplier;
        else if (unDescWords.some((w) => w === unWord)) score += 10 * weightMultiplier;
      });

      // 3. Thưởng nhẹ theo độ phổ biến thực tế (Lượt tim & lượt lưu)
      const likes = img._count?.tym_anh || 0;
      const saves = img._count?.luu_anh || 0;
      score += Math.min(likes * 1.5 + saves * 2, 30);
      scored.push({ img, score });
    }

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

