const User = require('../models/User');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// CREATE
exports.register = async (req, res) => {
  try {
    const { email, phone, ...rest } = req.body;

    // Kiểm tra email hoặc phone đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        status: 400,
        error: 'Email hoặc số điện thoại đã tồn tại'
      });
    }

    // Nếu chưa tồn tại thì tạo mới
    const user = await User.create({ email, phone, ...rest });
    res.status(201).json({
      status: 201,
      message: "Đăng ký thành công.",
      user
    });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kiểm tra email tồn tại
    const user = await User.findOne({
      $or: [{ email: username }, { phone: username }]
    });
    if (!user) return res.status(400).json({ message: "Email không tồn tại" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không chính xác" });

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // role: admin/user
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ALL
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 200,
    data: users
  });
};

// READ ONE
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.status(200).json({
    status: 200,
    user
  });
};

// UPDATE
exports.updateUserById = async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
  res.status(200).json({
    status: 200,
    updated
  });
};

// DELETE
exports.deleteUserById = async (req, res) => {
  await User.findByIdAndDelete(req.params.userId);
  res.status(200).json({ status: 200, message: 'Xóa user thành công.' });
};
