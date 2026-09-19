import { responseSuccess } from "../common/helpers/response.helper.js";
import { authService } from "../services/auth.service.js";
import { FRONTEND_URL } from "../common/constants/app.constant.js";

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req);
      const response = responseSuccess(result, "Đăng ký tài khoản thành công", 201);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req);
      const response = responseSuccess(result, "Đăng nhập thành công");

      res.cookie("accessToken", result.accessToken, { httpOnly: true });
      res.cookie("refreshToken", result.refreshToken, { httpOnly: true });
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req);
      const response = responseSuccess(result, "Làm mới Token thành công");

      res.cookie("accessToken", result.accessToken, { httpOnly: true });
      res.cookie("refreshToken", result.refreshToken, { httpOnly: true });
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getInfo(req, res, next) {
    try {
      const result = await authService.getInfo(req);
      const response = responseSuccess(result, "Lấy thông tin người dùng thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async googleCallback(req, res) {
    const accessToken = req.user?.accessToken || "";
    const refreshToken = req.user?.refreshToken || "";
    const targetFrontend = (FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.redirect(`${targetFrontend}/login-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  },
};
