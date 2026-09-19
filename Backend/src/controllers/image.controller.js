import { responseSuccess } from "../common/helpers/response.helper.js";
import { imageService } from "../services/image.service.js";

export const imageController = {
  async getImages(req, res, next) {
    try {
      const result = await imageService.getImages(req);
      const response = responseSuccess(result, "Lấy danh sách hình ảnh thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async searchImages(req, res, next) {
    try {
      const result = await imageService.searchImages(req);
      const response = responseSuccess(result, "Tìm kiếm hình ảnh thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getImageDetail(req, res, next) {
    try {
      const result = await imageService.getImageDetail(req);
      const response = responseSuccess(result, "Lấy chi tiết hình ảnh thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async createImage(req, res, next) {
    try {
      const result = await imageService.createImage(req);
      const response = responseSuccess(result, "Tạo và tải ảnh lên thành công", 201);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async deleteImage(req, res, next) {
    try {
      const result = await imageService.deleteImage(req);
      const response = responseSuccess(result, "Xóa hình ảnh thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async batchDeleteImages(req, res, next) {
    try {
      const result = await imageService.batchDeleteImages(req);
      const response = responseSuccess(result, result.message);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },
};
