import rateLimit from "express-rate-limit";

export const appLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: process.env.NODE_ENV === "production" ? 2000 : 10000, // Tăng giới hạn để trải nghiệm mượt mà, không bị 429 khi thao tác
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    status: "error",
    statusCode: 429,
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.",
    doc: "/api-docs",
  },
  skip: (req) => {
    // Không áp đặt giới hạn chặn trên môi trường local / development
    const ip = req.ip || req.connection?.remoteAddress || "";
    return (
      process.env.NODE_ENV !== "production" ||
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip === "::ffff:127.0.0.1" ||
      ip.includes("127.0.0.1")
    );
  },
});
