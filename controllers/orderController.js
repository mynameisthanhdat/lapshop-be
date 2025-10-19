const Order = require("../models/Order");
const Product = require("../models/Product");

// CREATE
exports.createOrder = async (req, res) => {
  const { products, userId, shippingAddress } = req.body;

  try {
    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Danh sách sản phẩm không được để trống" });
    }

    let totalPrice = 0;
    const orderProducts = [];

    // 1. Kiểm tra tồn kho và chuẩn bị dữ liệu lưu
    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          status: 404,
          message: `Sản phẩm ID ${item.productId} không tồn tại`,
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          status: 400,
          message: `Sản phẩm ${product.name} chỉ còn ${product.quantity} trong kho`,
        });
      }

      // Tính tổng giá tiền
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      // Lưu dữ liệu sản phẩm vào order
      orderProducts.push({
        productId: product._id,
        name: product.name,
        price: product.price, // giá tại thời điểm mua
        quantity: item.quantity,
        thumbnail: product.thumbnail,
      });
    }

    // 2. Giảm tồn kho
    for (let item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
      });
    }

    // 3. Tạo đơn hàng
    const order = await Order.create({
      userId,
      products: orderProducts,
      shippingAddress,
      totalPrice,
      status: "pending",
    });

    res.status(201).json({
      status: 201,
      message: "Tạo đơn hàng thành công",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Có lỗi xảy ra khi tạo đơn hàng",
      error: error.message,
    });
  }
};

// READ ALL (Admin)
exports.getOrders = async (req, res) => {
  console.log('hihi');
  
  const orders = await Order.find();
  console.log('hihi: ', orders);
  res.status(200).json({
    status: 200,
    data: orders,
  });
};

// GET LIST ORDER BY USERID
exports.getOrdersByUserId = async (req, res) => {
  const userId = req.params.userId;
  const orders = await Order.find({ userId: userId });
  res.status(200).json({
    status: 200,
    data: orders,
  });
};

// READ ONE
exports.getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate(
    "products.productId"
  );
  res.status(200).json(order);
};

// UPDATE (status, etc.)
exports.updateOrderById = async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.orderId, req.body, {
    new: true,
  });
  
  res.status(200).json({
    status: 200,
    message: "Cập nhật đơn hàng thành công.",
    data: updated,
  });
};

// DELETE
exports.deleteOrderById = async (req, res) => {
  await Order.findByIdAndDelete(req.params.orderId);
  res.status(200).json({ status: 200, message: "Xóa đơn hàng thành công." });
};
