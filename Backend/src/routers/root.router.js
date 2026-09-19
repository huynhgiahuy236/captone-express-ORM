import express from "express";
import authRouter from "./auth.router.js";
import imageRouter from "./image.router.js";
import commentRouter from "./comment.router.js";
import savedImageRouter from "./savedImage.router.js";
import userRouter from "./user.router.js";
import notificationRouter from "./notification.router.js";
import likeRouter from "./like.router.js";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/images", imageRouter);
rootRouter.use("/comments", commentRouter);
rootRouter.use("/saved-images", savedImageRouter);
rootRouter.use("/likes", likeRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/notifications", notificationRouter);

export default rootRouter;
