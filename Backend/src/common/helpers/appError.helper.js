import { responseError } from "./response.helper.js";
import jwt from "jsonwebtoken";
import { statusCodes } from "./statusCode.helper.js";

export const appError = (err, req, res, next) => {
  if (err instanceof jwt.JsonWebTokenError) {
    err.code = statusCodes.UNAUTHORIZED;
  }
  if (err instanceof jwt.TokenExpiredError) {
    err.code = statusCodes.FORBIDDEN;
  }

  // Đảm bảo status code luôn là số nguyên hợp lệ của HTTP (mặc định 500 nếu là chuỗi mã lỗi như Prisma P2010...)
  const statusCode =
    typeof err?.code === "number" && err.code >= 100 && err.code <= 599
      ? err.code
      : statusCodes.INTERNAL_SERVER_ERROR;

  const response = responseError(err?.message, statusCode, err?.stack);
  res.status(response.statusCode).json(response);
};
