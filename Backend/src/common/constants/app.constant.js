import "dotenv/config";

export const DATABASE_URL = process.env.DATABASE_URL;
export const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || "huynhgiahuysecret";
export const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY || "huynhgiahuysecret";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
export const PORT = process.env.PORT || 3069;
