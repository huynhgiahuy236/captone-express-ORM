import { BadRequestException, UnauthorizedException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import bcrypt from "bcrypt";
import { tokenService } from "./token.service.js";

export const authService = {
  async register(req) {
    const email = req.body.email;
    const password = req.body.password || req.body.mat_khau;
    const fullName = req.body.fullName || req.body.ho_ten;
    const age = req.body.age || req.body.tuoi;

    if (!email || !password) {
      throw new BadRequestException("Vui lòng cung cấp đầy đủ email và mật khẩu");
    }

    const userExist = await prisma.nguoi_dung.findUnique({
      where: { email: email },
    });

    if (userExist) {
      throw new BadRequestException("Tài khoản email này đã được đăng ký");
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = await prisma.nguoi_dung.create({
      data: {
        email: email,
        mat_khau: hashPassword,
        ho_ten: fullName || null,
        tuoi: age ? Number(age) : null,
      },
    });

    return {
      nguoi_dung_id: newUser.nguoi_dung_id,
      email: newUser.email,
      ho_ten: newUser.ho_ten,
      tuoi: newUser.tuoi,
    };
  },

  async login(req) {
    const email = req.body.email;
    const password = req.body.password || req.body.mat_khau;

    if (!email || !password) {
      throw new BadRequestException("Vui lòng nhập đầy đủ email và mật khẩu");
    }

    const user = await prisma.nguoi_dung.findUnique({
      where: { email: email },
      omit: {
        mat_khau: false,
      },
    });

    if (!user || user.isDeleted) {
      throw new BadRequestException("Tài khoản không tồn tại hoặc đã bị vô hiệu hóa");
    }

    if (!user.mat_khau) {
      throw new BadRequestException("Tài khoản này được đăng ký bằng Google, vui lòng đăng nhập qua Google");
    }

    const isPasswordValid = bcrypt.compareSync(password, user.mat_khau);
    if (!isPasswordValid) {
      throw new BadRequestException("Mật khẩu không chính xác");
    }

    const accessToken = tokenService.createAccessToken(user.nguoi_dung_id);
    const refreshToken = tokenService.createRefreshToken(user.nguoi_dung_id);

    let privacySettings = {
      created: "PUBLIC",
      saved: "PUBLIC",
      liked_pins: "PUBLIC",
      liked_comments: "PUBLIC",
      followers: "PUBLIC",
      following: "PUBLIC",
    };

    if (user.quyen_rieng_tu) {
      try {
        privacySettings = { ...privacySettings, ...JSON.parse(user.quyen_rieng_tu) };
      } catch (e) {}
    }

    return {
      user: {
        nguoi_dung_id: user.nguoi_dung_id,
        email: user.email,
        ho_ten: user.ho_ten,
        tuoi: user.tuoi,
        anh_dai_dien: user.anh_dai_dien,
        mo_ta: user.mo_ta,
        quyen_rieng_tu: user.quyen_rieng_tu,
        privacySettings,
      },
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(req) {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Không tìm thấy Refresh Token");
    }

    const decode = tokenService.verifyRefreshToken(refreshToken);
    const user = await prisma.nguoi_dung.findUnique({
      where: { nguoi_dung_id: decode.userId },
    });

    if (!user || user.isDeleted) {
      throw new UnauthorizedException("Người dùng không tồn tại hoặc đã bị xóa");
    }

    const newAccessToken = tokenService.createAccessToken(user.nguoi_dung_id);
    const newRefreshToken = tokenService.createRefreshToken(user.nguoi_dung_id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async getInfo(req) {
    const user = await prisma.nguoi_dung.findUnique({
      where: { nguoi_dung_id: req.user.nguoi_dung_id },
    });
    if (!user) return null;

    let privacySettings = {
      created: "PUBLIC",
      saved: "PUBLIC",
      liked_pins: "PUBLIC",
      liked_comments: "PUBLIC",
      followers: "PUBLIC",
      following: "PUBLIC",
    };

    if (user.quyen_rieng_tu) {
      try {
        privacySettings = { ...privacySettings, ...JSON.parse(user.quyen_rieng_tu) };
      } catch (e) {}
    }

    return {
      ...user,
      privacySettings,
    };
  },
};
