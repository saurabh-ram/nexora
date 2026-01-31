import express from "express";
import {
  getAllPosts,
  getPostById,
  getNewPostForm,
  createNewPost,
  getLatestPost,
  updatePost,
} from "../controllers/post.controller.js";
import { upload } from "../services/media.service.js";

const router = express.Router();

router.get("/", getAllPosts);

router.put("/:id", updatePost);

router.get("/new-post", getNewPostForm);

router.get("/:id", getPostById);

router.post("/", upload.single("poster"), createNewPost);

router.get("/latest-post", getLatestPost);

export default router;
