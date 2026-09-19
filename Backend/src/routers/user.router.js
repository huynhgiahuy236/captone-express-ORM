import express from "express";
import { userController } from "../controllers/user.controller.js";
import { protect, optionalProtect } from "../common/middlewares/protect.middleware.js";
import { uploadMemoryStorage } from "../common/multer/memory-storage.multer.js";
import { likeController } from "../controllers/like.controller.js";

const userRouter = express.Router();

// Lấy thông tin cá nhân của user đang đăng nhập
userRouter.get("/profile", protect, userController.getProfile);

// Cập nhật cài đặt quyền riêng tư
userRouter.put("/privacy", protect, userController.updatePrivacySettings);

// Lấy danh sách ảnh đã lưu
userRouter.get("/saved-images", protect, userController.getSavedImagesByUser);
userRouter.get("/saved-images/:userId", optionalProtect, userController.getSavedImagesByUser);

// Lấy danh sách ảnh đã tạo
userRouter.get("/created-images", protect, userController.getCreatedImagesByUser);
userRouter.get("/created-images/:userId", optionalProtect, userController.getCreatedImagesByUser);

// Lấy danh sách ảnh đã thích (Tym ảnh)
userRouter.get("/liked-images", protect, likeController.getUserLikedImages);
userRouter.get("/liked-images/:userId", optionalProtect, likeController.getUserLikedImages);

// Lấy danh sách bình luận đã thích (Tym bình luận)
userRouter.get("/liked-comments", protect, likeController.getUserLikedComments);
userRouter.get("/liked-comments/:userId", optionalProtect, likeController.getUserLikedComments);

// Lấy thông tin công khai của người dùng / tác giả
userRouter.get("/:userId", optionalProtect, userController.getUserById);

// Cập nhật thông tin cá nhân & đổi avatar qua Cloudinary
userRouter.put("/profile", protect, uploadMemoryStorage.single("avatar"), userController.updateProfile);

export default userRouter;
