import express from "express";
import { commentController } from "../controllers/comment.controller.js";
import { protect, optionalProtect } from "../common/middlewares/protect.middleware.js";

const commentRouter = express.Router();

// Lấy danh sách bình luận theo imageId (Public / Optional Auth)
commentRouter.get("/image/:imageId", optionalProtect, commentController.getCommentsByImageId);

// Gửi bình luận (Protected)
commentRouter.post("/", protect, commentController.createComment);

export default commentRouter;
