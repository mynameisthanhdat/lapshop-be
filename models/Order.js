const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true }, // Tên sản phẩm tại thời điểm đặt
        thumbnail: String,
        price: { type: Number, required: true }, // Giá tại thời điểm đặt
        discount: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        specs: {
          cpu: String,
          ram: String,
          storage: String,
          gpu: String
        }
      }
    ],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed", "cancelled"],
      default: "pending"
    },
    note: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
