import express from "express";
import appRouter from "./app.routes.js";
import authRouter from "./auth.routes.js";
import postRouter from "./post.routes.js";
import userRouter from "./user.routes.js";

const router = express.Router();
router.use("/", appRouter);
router.get("/", (req, res) => {
  res.redirect("/posts");
});
router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);

export default router;
