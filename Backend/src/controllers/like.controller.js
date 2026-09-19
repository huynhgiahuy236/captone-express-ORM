import { responseSuccess } from "../common/helpers/response.helper.js";
import { likeService } from "../services/like.service.js";

export const likeController = {
  async toggleLikeImage(req, res, next) {
    try {
      const result = await likeService.toggleLikeImage(req);
      const response = responseSuccess(result, result.message);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async checkLikeImage(req, res, next) {
    try {
      const result = await likeService.checkLikeImage(req);
      const response = responseSuccess(result, "Kiểm tra lượt thích ảnh thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async toggleLikeComment(req, res, next) {
    try {
      const result = await likeService.toggleLikeComment(req);
      const response = responseSuccess(result, result.message);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getUserLikedImages(req, res, next) {
    try {
      const result = await likeService.getUserLikedImages(req);
      const response = responseSuccess(result, "Lấy danh sách ảnh đã thích thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async getUserLikedComments(req, res, next) {
    try {
      const result = await likeService.getUserLikedComments(req);
      const response = responseSuccess(result, "Lấy danh sách bình luận đã thích thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },
};
