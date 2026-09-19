import { responseSuccess } from "../common/helpers/response.helper.js";
import { followService } from "../services/follow.service.js";

export const followController = {
  async toggleFollow(req, res, next) {
    try {
      const result = await followService.toggleFollow(req);
      const response = responseSuccess(result, result.message);
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async checkFollowStatus(req, res, next) {
    try {
      const result = await followService.checkFollowStatus(req);
      const response = responseSuccess(result, "Lấy trạng thái theo dõi thành công");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getFollowers(req, res, next) {
    try {
      const result = await followService.getFollowers(req);
      const response = responseSuccess(result, "Lấy danh sách người theo dõi thành công");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getFollowing(req, res, next) {
    try {
      const result = await followService.getFollowing(req);
      const response = responseSuccess(result, "Lấy danh sách đang theo dõi thành công");
      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  },
};
