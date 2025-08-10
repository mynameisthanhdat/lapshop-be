const express = require("express");
const router = express.Router();
const { getProducts, getAllProducts, createProduct, getProductById, deleteProductById, updateProductById } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/product/all", getAllProducts);
router.get("/product", getProducts);
router.post("/product", protect, adminOnly, createProduct);
router.get("/product/:productId", getProductById);
router.put("/product/:productId", updateProductById);
router.delete("/product/:productId", deleteProductById);

module.exports = router;
