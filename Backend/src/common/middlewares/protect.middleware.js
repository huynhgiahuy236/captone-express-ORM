import { tokenService } from "../../services/token.service.js";
import { UnauthorizedException } from "../helpers/exception.helper.js";
import { prisma } from "../prisma/connect.prisma.js";

export const protect = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;

    if (!accessToken && (req.headers.authorization || req.headers.token)) {
      let authHeader = (req.headers.authorization || req.headers.token).trim();
      while (authHeader.toLowerCase().startsWith("bearer ")) {
        authHeader = authHeader.slice(7).trim();
      }
      accessToken = authHeader;
    }

    if (!accessToken) {
      throw new UnauthorizedException("Vui lòng đăng nhập để thực hiện chức năng này (Thiếu AccessToken)");
    }

    const decode = tokenService.verifyAccessToken(accessToken);
    if (!decode || !decode.userId) {
      throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn");
    }

    const user = await prisma.nguoi_dung.findUnique({
      where: {
        nguoi_dung_id: decode.userId,
      },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException("Tài khoản người dùng không tồn tại hoặc đã bị khóa");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalProtect = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;

    if (!accessToken && (req.headers.authorization || req.headers.token)) {
      let authHeader = (req.headers.authorization || req.headers.token).trim();
      while (authHeader.toLowerCase().startsWith("bearer ")) {
        authHeader = authHeader.slice(7).trim();
      }
      accessToken = authHeader;
    }

    if (accessToken) {
      try {
        const decode = tokenService.verifyAccessToken(accessToken);
        if (decode && decode.userId) {
          const user = await prisma.nguoi_dung.findUnique({
            where: {
              nguoi_dung_id: decode.userId,
            },
          });

          if (user && !user.isDeleted) {
            req.user = user;
          }
        }
      } catch (e) {
        // Ignored for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

