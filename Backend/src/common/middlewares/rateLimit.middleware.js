import rateLimit from "express-rate-limit";

export const appLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 300, // Tối đa 300 request trong 15 phút
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.",
    doc: "/api-docs",
  },
});
