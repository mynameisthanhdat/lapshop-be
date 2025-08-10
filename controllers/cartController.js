const Cart = require('../models/Cart');
const Product = require('../models/Product');

// CREATE (Thêm giỏ hàng mới cho user)
exports.createCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Chưa có giỏ hàng → tạo mới
      cart = await Cart.create({
        userId,
        items: [{
          productId: product._id,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          quantity
        }]
      });
    } else {
      // Đã có giỏ hàng → kiểm tra sản phẩm
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

      if (itemIndex > -1) {
        // Nếu đã tồn tại → tăng số lượng
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Nếu chưa có → thêm mới
        cart.items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          quantity
        });
      }

      await cart.save();
    }

    res.status(200).json({
      status: 200,
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      cart
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm vào giỏ hàng", error: error.message });
  }
};


// READ (Lấy giỏ hàng của 1 user)
exports.getCartByUserId = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  res.status(200).json({
    status: 200,
    data: cart
  });
};

// UPDATE (Thêm hoặc update sản phẩm trong giỏ)
exports.updateCartItem = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // Nếu số lượng <= 0 thì xóa luôn sản phẩm khỏi giỏ
    if (quantity <= 0) {
      const updatedCart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { items: { productId } } },
        { new: true }
      );

      if (!updatedCart) {
        return res.status(404).json({
          status: 404,
          message: "Không tìm thấy giỏ hàng hoặc sản phẩm"
        });
      }

      return res.json({
        status: 200,
        message: "Sản phẩm đã được xóa khỏi giỏ hàng",
        data: updatedCart
      });
    }

    // Cập nhật số lượng sản phẩm
    const updatedCart = await Cart.findOneAndUpdate(
      { userId, "items.productId": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({
        status: 404,
        message: "Không tìm thấy giỏ hàng hoặc sản phẩm"
      });
    }

    res.json({
      status: 200,
      message: "Cập nhật số lượng sản phẩm thành công",
      data: updatedCart
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      error: error.message
    });
  }
};

// DELETE (Xóa giỏ hàng của user)
exports.deleteCartItem = async (req, res) => {
  const { userId, productId } = req.body; // hoặc req.params nếu bạn muốn

  try {
    // Xóa sản phẩm khỏi items của user
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({
        status: 404,
        message: "Không tìm thấy giỏ hàng hoặc sản phẩm"
      });
    }

    res.json({
      status: 200,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
      data: updatedCart
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      error: error.message
    });
  }
};
