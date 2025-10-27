import express from "express";
import {
  createproduct,
  deleteProduct,
  getAllproducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeaturedProduct,
  updateStock,
  updatePrice,
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllproducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createproduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.put("/:id/stock", protectRoute, adminRoute, updateStock);
router.put("/:id/price", protectRoute, adminRoute, updatePrice);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
