const mongoose = require("mongoose");
const mongooseCleanResponse = require("../utils/mongooseCleanResponse");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    images: [{ type: String }],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 }, // Average rating
    ratingCount: { type: Number, default: 0 }, // Product rating count
    stock: { type: Number, default: 0 }, // Available stock quantity (visible only if greater than 0)
    isActive: { type: Boolean, default: true }, // Admin controls product visibility
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

productSchema.index({ name: "text", description: "text" });

productSchema.plugin(mongooseCleanResponse);

module.exports = mongoose.model("Product", productSchema);
