import express from "express";
import { authController } from "../controllers/auth.controller.js";
import passport from "passport";
import { protect } from "../common/middlewares/protect.middleware.js";

const authRouter = express.Router();

// Hỗ trợ cả signup/signin và register/login
authRouter.post("/signup", authController.register);
authRouter.post("/register", authController.register);

authRouter.post("/signin", authController.login);
authRouter.post("/login", authController.login);

authRouter.post("/refresh-token", authController.refreshToken);
authRouter.get("/info", protect, authController.getInfo);

// Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "http://localhost:3000/login?error=google" }),
  authController.googleCallback
);

export default authRouter;
