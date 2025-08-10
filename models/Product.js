const mongoose = require("mongoose");

const specSchema = new mongoose.Schema({
  cpu: String,
  ram: String,
  storage: String,
  gpu: String
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  thumbnail: String,
  images: [String],
  discount: { type: Number, default: 0 },
  price: { type: Number, required: true },
  oldPrice: Number,
  isHot: { type: Boolean, default: false },
  specs: specSchema,
  brand: String,
  category: String,
  quantity: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
