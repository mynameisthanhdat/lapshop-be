const express = require("express");
const router = express.Router();
const { createCart, getCartByUserId, updateCartItem, deleteCartItem } = require("../controllers/cartController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/cart", createCart);
router.get("/cart/:userId", getCartByUserId);
router.put("/cart", updateCartItem);
router.delete("/cart", deleteCartItem);

module.exports = router;
