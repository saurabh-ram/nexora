import express from "express";
import {
  getInDevelopmentPage,
  getAboutPage,
  getContactPage,
} from "../controllers/app.controller.js";

const router = express.Router();

router.get("/in-development", getInDevelopmentPage);

router.get("/about", getAboutPage);

router.get("/contact", getContactPage);

export default router;
