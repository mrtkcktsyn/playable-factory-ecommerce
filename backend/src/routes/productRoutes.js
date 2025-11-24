const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
  createProduct,
  getProducts,
  getProductDetail,
  updateProduct,
  updateStock,
  toggleProductStatus,
  getAllProductsAdmin,
} = require("../controllers/productController");

// Public route to get all products
router.get("/", getProducts);

// Admin route to get all products (including inactive/out-of-stock)
// This MUST be defined BEFORE the "/:slug" route
router.get("/admin", authentication, admin, getAllProductsAdmin);

// Public route to get product detail by slug
router.get("/:slug", getProductDetail);

// Private route to create a new product - Admin only
router.post("/", authentication, admin, createProduct);

// Private route to update a product - Admin only
router.put("/:id", authentication, admin, updateProduct);

// Private route to update product stock - Admin only
router.patch("/:id/stock", authentication, admin, updateStock);

// Private route to toggle product status - Admin only
router.patch("/:id/toggle", authentication, admin, toggleProductStatus);

module.exports = router;
