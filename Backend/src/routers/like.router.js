import express from "express";
import { likeController } from "../controllers/like.controller.js";
import { protect, optionalProtect } from "../common/middlewares/protect.middleware.js";

const likeRouter = express.Router();

// Like image
likeRouter.post("/image/toggle/:imageId", protect, likeController.toggleLikeImage);
likeRouter.get("/image/check/:imageId", optionalProtect, likeController.checkLikeImage);

// Like comment
likeRouter.post("/comment/toggle/:commentId", protect, likeController.toggleLikeComment);

// Liked lists
likeRouter.get("/user/images", protect, likeController.getUserLikedImages);
likeRouter.get("/user/comments", protect, likeController.getUserLikedComments);
likeRouter.get("/user/:userId/images", likeController.getUserLikedImages);
likeRouter.get("/user/:userId/comments", likeController.getUserLikedComments);

export default likeRouter;
