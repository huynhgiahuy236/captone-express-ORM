import multer from "multer";

const storage = multer.memoryStorage();

export const uploadMemoryStorage = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Giới hạn 20MB theo đúng UI
  },
});
