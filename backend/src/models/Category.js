const mongoose = require("mongoose");
const mongooseCleanResponse = require("../utils/mongooseCleanResponse");


const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.plugin(mongooseCleanResponse);

module.exports = mongoose.model("Category", categorySchema);
