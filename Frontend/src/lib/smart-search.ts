import { ImageItem, CommentItem } from "@/types";

// Helper: Chuyển đổi bỏ dấu tiếng Việt
export const removeVietnameseTones = (str: string): string =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

// Helper: Tách các từ riêng lẻ
export const cleanWords = (str: string): string[] =>
  (str || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

// Helper: Kiểm tra từ / cụm từ độc lập (tránh 'cho' ăn nhầm 'chơi')
export const isWordOrPhraseMatch = (fullText: string, sub: string): boolean => {
  if (!fullText || !sub) return false;
  const escaped = sub.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|\\s|[.,!?:;\\-_/])${escaped}($|\\s|[.,!?:;\\-_/])`, "i");
  return regex.test(fullText);
};

export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  "thú cưng": ["chó", "mèo", "cún", "pet", "dog", "cat", "puppy", "kitten", "thú", "động vật"],
  "xe cộ": ["xe", "oto", "ô tô", "car", "motor", "mô tô", "xe máy", "bike", "phương tiện", "mustang", "porsche", "nissan"],
  "công nghệ": ["tech", "game", "code", "máy tính", "laptop", "điện thoại", "phone", "ai", "ps4", "ps5", "tay cầm"],
  "thiên nhiên": ["nature", "hoa", "cây", "rừng", "biển", "núi", "cảnh", "mây", "trời", "hoàng hôn"],
  "ẩm thực": ["food", "món", "ăn", "uống", "nấu", "bánh", "cafe", "cà phê", "trà", "nước", "salad"],
  "nghệ thuật": ["art", "vẽ", "tranh", "design", "thiết kế", "họa", "sơn dầu", "sketch"],
  "kiến trúc": ["nhà", "building", "phòng", "nội thất", "kiến trúc", "công trình", "tháp", "chùa"],
  "thời trang": ["fashion", "áo", "quần", "váy", "giày", "túi", "style", "outfit", "mặc"],
};

/**
 * Bộ tìm kiếm thông minh đa tầng (Smart Relevance Search) cho danh sách Ghim / Ảnh
 */
export function smartFilterPins(pins: ImageItem[], rawQuery: string): ImageItem[] {
  const query = (rawQuery || "").trim().toLowerCase();
  if (!query) return pins;

  const unaccentedQuery = removeVietnameseTones(query);
  const queryWords = cleanWords(query);
  const unaccentedQueryWords = queryWords.map(removeVietnameseTones);

  const scored: { pin: ImageItem; score: number }[] = [];

  for (const pin of pins) {
    const title = (pin.ten_hinh || "").toLowerCase();
    const desc = (pin.mo_ta || "").toLowerCase();
    const cat = (pin.the_loai || "").toLowerCase();

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

    // 1. Khớp chính xác cả cụm từ có dấu trong tiêu đề/thể loại/mô tả (Ưu tiên cao nhất)
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
      scored.push({ pin, score });
    }
  }

  // Sắp xếp theo điểm độ liên quan giảm dần (Relevance Ranking)
  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.pin);
}

/**
 * Bộ tìm kiếm thông minh đa tầng (Smart Relevance Search) cho danh sách Bình luận
 */
export function smartFilterComments(comments: CommentItem[], rawQuery: string): CommentItem[] {
  const query = (rawQuery || "").trim().toLowerCase();
  if (!query) return comments;

  const unaccentedQuery = removeVietnameseTones(query);
  const queryWords = cleanWords(query);
  const unaccentedQueryWords = queryWords.map(removeVietnameseTones);

  const scored: { comment: CommentItem; score: number }[] = [];

  for (const c of comments) {
    const text = (c.noi_dung || "").toLowerCase();
    const authorName = (c.nguoi_dung?.ho_ten || "").toLowerCase();
    const pinTitle = (c.hinh_anh?.ten_hinh || "").toLowerCase();

    const textWords = cleanWords(text);
    const authorWords = cleanWords(authorName);
    const pinWords = cleanWords(pinTitle);

    const unTextWords = textWords.map(removeVietnameseTones);
    const unAuthorWords = authorWords.map(removeVietnameseTones);
    const unPinWords = pinWords.map(removeVietnameseTones);

    const unText = removeVietnameseTones(text);
    const unAuthor = removeVietnameseTones(authorName);
    const unPin = removeVietnameseTones(pinTitle);

    let score = 0;

    // 1. Khớp cụm từ trong nội dung bình luận
    if (text.includes(query)) score += 120;
    else if (isWordOrPhraseMatch(unText, unaccentedQuery)) score += 60;

    // 2. Khớp cụm từ trong tên tác giả hoặc tên ghim
    if (authorName.includes(query)) score += 50;
    else if (isWordOrPhraseMatch(unAuthor, unaccentedQuery)) score += 25;

    if (pinTitle.includes(query)) score += 40;
    else if (isWordOrPhraseMatch(unPin, unaccentedQuery)) score += 20;

    // 3. Khớp từng từ nguyên vẹn
    queryWords.forEach((word, idx) => {
      const unWord = unaccentedQueryWords[idx];

      if (textWords.includes(word)) score += 35;
      else if (unTextWords.includes(unWord)) score += 20;

      if (authorWords.includes(word)) score += 20;
      else if (unAuthorWords.includes(unWord)) score += 10;

      if (pinWords.includes(word)) score += 15;
      else if (unPinWords.includes(unWord)) score += 10;
    });

    // 4. Khớp đa từ
    if (queryWords.length > 1) {
      const allDocWords = [...textWords, ...authorWords, ...pinWords];
      const allUnDocWords = [...unTextWords, ...unAuthorWords, ...unPinWords];

      const allExact = queryWords.every((w) => allDocWords.includes(w));
      const allUnaccented = unaccentedQueryWords.every((w) => allUnDocWords.includes(w));

      if (allExact) score += 70;
      else if (allUnaccented) score += 40;
    }

    if (score > 0) {
      scored.push({ comment: c, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.map((item) => item.comment);
}
