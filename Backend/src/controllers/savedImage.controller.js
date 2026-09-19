import { responseSuccess } from "../common/helpers/response.helper.js";
import { savedImageService } from "../services/savedImage.service.js";

export const savedImageController = {
  async checkSavedImage(req, res, next) {
    try {
      const result = await savedImageService.checkSavedImage(req);
      const response = responseSuccess(result, "Kiểm tra trạng thái lưu ảnh thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async toggleSaveImage(req, res, next) {
    try {
      const result = await savedImageService.toggleSaveImage(req);
      const response = responseSuccess(result, result.message);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async batchUnsave(req, res, next) {
    try {
      const result = await savedImageService.batchUnsave(req);
      const response = responseSuccess(result, result.message);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },
};
