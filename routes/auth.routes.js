import express from "express";
import {
  getLoginForm,
  getRegisterForm,
  login,
  logout,
  registered,
  registerUser,
  resendVerificationEmail,
  verifyEmail,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/register", getRegisterForm);
router.get("/login", getLoginForm);
router.post("/register", registerUser);
router.post("/login", login);

router.get("/logout", logout);
router.get("/registered", registered);

router.post("/verify/resend", /*resendEmailLimiter,*/ resendVerificationEmail);
router.get("/verify/verify-email", verifyEmail);

export default router;
