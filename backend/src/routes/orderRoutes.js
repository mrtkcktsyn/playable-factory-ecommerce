const express = require("express");
const router = express.Router();
const authentication = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} = require("../controllers/orderController");

// GET all orders = Admin only 
router.get("/", authentication, admin, getAllOrders);

// CREATE a new order - (Checkout => Logged in users)
router.post("/checkout", authentication, createOrder);

// GET user's own orders
router.get("/my", authentication, getMyOrders);

// GET order details (Both user and admin)
router.get("/:id", authentication, getOrderById);

// UPDATE order status - Admin only
router.patch("/:id/status", authentication, admin, updateOrderStatus);

module.exports = router;