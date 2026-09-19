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

export const WORD_SYNONYMS: Record<string, string[]> = {
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

export const STOP_WORDS_MODIFIERS = [
  "đẹp", "xinh", "cute", "ngon", "hay", "hot", "cực", "rất", "nhiều", "nhất", "dễ thương",
  "cool", "ngầu", "vip", "pro", "nhỏ", "to", "lớn", "đỉnh", "chất", "mới", "xịn", "top", "siêu"
];

export const isTokenMatch = (origWords: string[], unaccentedWords: string[], target: string): boolean => {
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

/**
 * Bộ tìm kiếm thông minh đa tầng linh hoạt (Flexible Smart Search) cho danh sách Ghim / Ảnh
 */
export function smartFilterPins(pins: ImageItem[], rawQuery: string): ImageItem[] {
  const query = (rawQuery || "").trim().toLowerCase();
  if (!query) return pins;

  const unaccentedStopWords = STOP_WORDS_MODIFIERS.map(removeVietnameseTones);

  const unaccentedQuery = removeVietnameseTones(query);
  const queryWords = cleanWords(query);
  const unaccentedQueryWords = queryWords.map(removeVietnameseTones);

  // Xác định các từ khóa cốt lõi (loại bỏ từ bổ nghĩa)
  let coreWords = queryWords.filter((w, idx) => !unaccentedStopWords.includes(unaccentedQueryWords[idx]));
  if (coreWords.length === 0) coreWords = queryWords;

  const scored: { pin: ImageItem; score: number }[] = [];

  for (const pin of pins) {
    const title = (pin.ten_hinh || "").toLowerCase();
    const desc = (pin.mo_ta || "").toLowerCase();
    const cat = (pin.the_loai || "").toLowerCase();
    const author = (pin.nguoi_dung?.ho_ten || "").toLowerCase();

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

    // BẮT BUỘC: Phải khớp từ cốt lõi hoặc từ đồng nghĩa chính xác
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
      continue;
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
    const likes = (pin as any)._count?.tym_anh || 0;
    const saves = (pin as any)._count?.luu_anh || 0;
    score += Math.min(likes * 1.5 + saves * 2, 30);
    scored.push({ pin, score });
  }

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
