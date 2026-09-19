import express from "express";
import { followController } from "../controllers/follow.controller.js";
import { protect, optionalProtect } from "../common/middlewares/protect.middleware.js";

const followRouter = express.Router();

// Toggle follow / unfollow author
followRouter.post("/:authorId", protect, followController.toggleFollow);

// Check follow status and get counts
followRouter.get("/status/:authorId", optionalProtect, followController.checkFollowStatus);

// Lấy danh sách người theo dõi (Followers)
followRouter.get("/followers/:userId", optionalProtect, followController.getFollowers);

// Lấy danh sách đang theo dõi (Following)
followRouter.get("/following/:userId", optionalProtect, followController.getFollowing);

export default followRouter;
