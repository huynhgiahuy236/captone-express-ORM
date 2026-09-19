import { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } from "../common/constants/app.constant.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";
import jwt from "jsonwebtoken";

export const tokenService = {
  createAccessToken(userId) {
    if (!userId) {
      throw new BadRequestException("Không có userId để tạo accessToken");
    }
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET_KEY, { expiresIn: "1h" });
  },

  createRefreshToken(userId) {
    if (!userId) {
      throw new BadRequestException("Không có userId để tạo refreshToken");
    }
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET_KEY, { expiresIn: "7d" });
  },

  verifyAccessToken(accessToken, option) {
    return jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY, option);
  },

  verifyRefreshToken(refreshToken, option) {
    return jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, option);
  },
};
