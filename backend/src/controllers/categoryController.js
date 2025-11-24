const Category = require("../models/Category");

// Create category - Admin only
exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) return res.status(400).json({ message: "Slug already exists." });

    const category = await Category.create({name, slug});
    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all active categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ categories });
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
};