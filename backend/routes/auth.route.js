import express from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  createAdmin,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working!" });
});

// Test signup route
router.post("/test-signup", (req, res) => {
  console.log('Test signup called with:', req.body);
  res.json({ message: "Test signup works!", data: req.body });
});

// Test login route
router.post("/test-login", (req, res) => {
  console.log('Test login called with:', req.body);
  res.json({ message: "Test login works!", data: req.body });
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/create-admin", createAdmin);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);

export default router;
