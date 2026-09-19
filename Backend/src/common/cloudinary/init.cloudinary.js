import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  secure: true,
});

export const uploadToCloudinary = (fileBuffer, folder = "capstone-pinterest") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: folder, resource_type: "auto" }, (error, uploadResult) => {
        if (error) {
          return reject(error);
        }
        return resolve(uploadResult);
      })
      .end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Lỗi xóa file trên Cloudinary:", error);
  }
};

export { cloudinary };
