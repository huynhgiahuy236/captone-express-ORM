import { responseSuccess } from "../common/helpers/response.helper.js";
import { commentService } from "../services/comment.service.js";

export const commentController = {
  async getCommentsByImageId(req, res, next) {
    try {
      const result = await commentService.getCommentsByImageId(req);
      const response = responseSuccess(result, "Lấy danh sách bình luận thành công");
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },

  async createComment(req, res, next) {
    try {
      const result = await commentService.createComment(req);
      const response = responseSuccess(result, "Gửi bình luận thành công", 201);
      res.status(response.statusCode).json(response);
    } catch (err) {
      next(err);
    }
  },
};
