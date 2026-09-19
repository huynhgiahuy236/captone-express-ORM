import express from "express";
import { imageController } from "../controllers/image.controller.js";
import { protect, optionalProtect } from "../common/middlewares/protect.middleware.js";
import { uploadMemoryStorage } from "../common/multer/memory-storage.multer.js";

const imageRouter = express.Router();

// Public routes
imageRouter.get("/", optionalProtect, imageController.getImages);
imageRouter.get("/search", optionalProtect, imageController.searchImages);
imageRouter.get("/:id", optionalProtect, imageController.getImageDetail);

// Protected routes
imageRouter.post("/", protect, uploadMemoryStorage.single("file"), imageController.createImage);
imageRouter.delete("/:id", protect, imageController.deleteImage);

export default imageRouter;
