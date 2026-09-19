import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import rootRouter from "./src/routers/root.router.js";
import { appError } from "./src/common/helpers/appError.helper.js";
import { logAPI } from "./src/common/middlewares/log-api.middleware.js";
import { appLimit } from "./src/common/middlewares/rateLimit.middleware.js";
import { initLoginGooglePassport } from "./src/common/passport/google.passport.js";
import { swaggerDocument } from "./src/common/swagger/init.swagger.js";
import { PORT, FRONTEND_URL } from "./src/common/constants/app.constant.js";

const app = express();

// CORS configuration (hỗ trợ gọi từ Next.js Frontend trên Localhost & Vercel)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  FRONTEND_URL,
].filter(Boolean).map(url => url?.replace(/\/$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có header origin (mobile apps, postman, curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = 
        allowedOrigins.includes(origin) || 
        origin.endsWith(".vercel.app"); // Cho phép mọi domain deploy trên Vercel

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow in dev/production with credentials
    },
    credentials: true,
  })
);

// Middleware parse cookie
app.use(cookieParser());

// Middleware log API
app.use(logAPI());

// Khởi tạo Passport Google OAuth 2.0
initLoginGooglePassport();

// Middleware parse JSON body
app.use(express.json());

// Public static files
app.use(express.static("public"));

// Swagger UI Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root API Router với Rate Limit
app.use("/api", appLimit, rootRouter);

// Global Error Handler Middleware
app.use(appError);

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Server Pinterest API online at: http://localhost:${PORT}`);
  console.log(`📖 Swagger API Documentation at:  http://localhost:${PORT}/api-docs`);
  console.log(`=================================================`);
});
