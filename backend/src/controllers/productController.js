const mongoose = require("mongoose");
const Product = require("../models/Product");

// CREATE a new product - Admin only
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products
// Public – Filtering / Sorting / Pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = "createdAt",
      order = "desc",
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
    } = req.query;

    // Only active products with stock > 0
    const query = {
      isActive: true,
      stock: { $gt: 0 },
    };

    // Search (name + slug)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter (category id, optional)
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Rating filter (minRating)
    if (minRating) {
      const value = Number(minRating);
      if (!Number.isNaN(value)) {
        query.rating = {
          ...(query.rating || {}),
          $gte: value,
        };
      }
    }

    // Sorting & Pagination
    const sortField = typeof sort === "string" ? sort : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 12;
    const skip = (pageNumber - 1) * limitNumber;

    const [items, total] = await Promise.all([
      Product.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNumber)
        .populate("category", "name slug"),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNumber) || 1;

    res.json({
      items,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/admin
// Admin-only – returns all products including inactive and out-of-stock
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .populate("category", "name slug");

    res.json(products);
  } catch (error) {
    console.error("Get admin products error:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET product detail by slug
exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "category"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Product - Admin only
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Stock - Admin only
exports.updateStock = async (req, res) => {
  try {
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Stock updated successfully",
      stock: product.stock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE Product Status (Active / Inactive) - Admin only
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product is now ${product.isActive ? "Active" : "Inactive"}`,
      isActive: product.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
