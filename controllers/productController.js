const Product = require("../models/Product");

// CREATE
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      status: 201,
      message: "Tạo mới sản phẩm thành công.",
      data: product,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
exports.getAllProducts = async (req, res) => {
  const products = await Product.find().sort({ updatedAt: -1 });
  products.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.status(200).json({
    status: 200,
    data: products,
  });
};

// GET /products?category=phone&brand=Apple,Samsung&specs[ram]=8GB&specs[storage]=128GB&page=1&limit=10
exports.getProducts = async (req, res) => {
  try {
    const { category, brand, page = "1", limit = "10" } = req.query;

    // --- parse paging
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // --- extract specs robustly
    const specs = {};
    // Case A: req.query.specs is an object (qs parser)
    if (req.query.specs && typeof req.query.specs === "object") {
      Object.assign(specs, req.query.specs);
    }
    // Case B: keys like specs[storage] or specs.storage
    const specKeys = ["ram", "storage", "cpu", "gpu"];
    specKeys.forEach((k) => {
      const bracKey = `specs[${k}]`;
      const dotKey = `specs.${k}`;
      if (req.query[bracKey]) specs[k] = req.query[bracKey];
      else if (req.query[dotKey]) specs[k] = req.query[dotKey];
      // also check direct (if someone sent specs as single string '512GB')
      else if (req.query[k] && !req.query.specs) {
        // optional: only pick up if they sent ?storage=512GB (less likely)
        // comment the next line out if you don't want this behavior
        // specs[k] = req.query[k];
      }
    });

    // --- build filter
    const filter = {};
    if (category) filter.category = category;

    if (brand) {
      const brands = Array.isArray(brand)
        ? brand.map((b) => String(b).trim()).filter(Boolean)
        : String(brand)
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean);

      if (brands.length === 1) filter.brand = brands[0];
      else if (brands.length > 1) filter.brand = { $in: brands };
    }

    // specs: only single value for each key (exact match)
    specKeys.forEach((k) => {
      if (
        specs[k] !== undefined &&
        specs[k] !== null &&
        String(specs[k]).trim() !== ""
      ) {
        // normalize (trim). If you want case-insensitive, replace with regex (see note).
        filter[`specs.${k}`] = String(specs[k]).trim();
      }
    });

    // --- DEBUG: nếu vẫn không đúng, bật log xem filter thực tế
    // console.log('Product filter:', JSON.stringify(filter, null, 2));

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      status: 200,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// READ ONE
exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  res.status(200).json({
    status: 200,
    product,
  });
};

// UPDATE
exports.updateProductById = async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.productId, req.body, {
    new: true,
  });
  res.status(200).json({
    status: 200,
    updated,
  });
};

// DELETE
exports.deleteProductById = async (req, res) => {
  await Product.findByIdAndDelete(req.params.productId);
  res.status(200).json({ status: 200, message: "Xóa sản phẩm thành công." });
};

// add something