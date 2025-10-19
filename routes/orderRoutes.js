const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderById, deleteOrderById, getOrdersByUserId } = require("../controllers/orderController");

router.get("/admin/order", getOrders);
router.post("/order", createOrder);
router.get("/order/:userId", getOrdersByUserId);
router.get("/admin/order/:orderId", getOrderById);
router.put("/admin/order/:orderId", updateOrderById);
router.delete("/admin/order/:orderId", deleteOrderById);

module.exports = router;
