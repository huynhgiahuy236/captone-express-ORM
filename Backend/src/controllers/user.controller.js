import { responseSuccess } from "../common/helpers/response.helper.js";
import { userService } from "../services/user.service.js";

export const userController = {
  async getProfile(req, res, next) {
    try {
      const result = await userService.getProfile(req);
      const response = responseSuccess(result, "Lấy thông tin cá nhân thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getSavedImagesByUser(req, res, next) {
    try {
      const result = await userService.getSavedImagesByUser(req);
      const response = responseSuccess(result, "Lấy danh sách hình ảnh đã lưu thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getCreatedImagesByUser(req, res, next) {
    try {
      const result = await userService.getCreatedImagesByUser(req);
      const response = responseSuccess(result, "Lấy danh sách hình ảnh đã tạo thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getUserById(req, res, next) {
    try {
      const result = await userService.getUserById(req);
      const response = responseSuccess(result, "Lấy thông tin tác giả thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const result = await userService.updateProfile(req);
      const response = responseSuccess(result, "Cập nhật thông tin cá nhân thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async updatePrivacySettings(req, res, next) {
    try {
      const result = await userService.updatePrivacySettings(req);
      const response = responseSuccess(result, "Cập nhật quyền riêng tư thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },
};
