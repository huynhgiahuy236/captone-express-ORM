import express from "express";
import { savedImageController } from "../controllers/savedImage.controller.js";
import { protect, optionalProtect } from "../common/middlewares/protect.middleware.js";

const savedImageRouter = express.Router();

// Kiểm tra user đã lưu ảnh chưa
savedImageRouter.get("/check/:imageId", optionalProtect, savedImageController.checkSavedImage);

// Lưu hoặc Bỏ lưu ảnh (Toggle)
savedImageRouter.post("/toggle/:imageId", protect, savedImageController.toggleSaveImage);
savedImageRouter.post("/:imageId", protect, savedImageController.toggleSaveImage);

export default savedImageRouter;
