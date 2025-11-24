const mongoose = require("mongoose");
const mongooseCleanResponse = require("../utils/mongooseCleanResponse");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    },
    { _id: false }  
);

const addressSchema = new mongoose.Schema(
    {
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    { _id: false}
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: (v) => Array.isArray(v) && v.length > 0,
        },
        totalAmount: { type: Number, required: true },
        status: { 
            type: String,
            enum: ["pending", "paid", "shipped", "completed", "cancelled"],
            default: "pending"
        },
        paymentStatus: { 
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        },
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
    
        shippingAddress: { type: addressSchema, required: true },
    },
    { timestamps: true }
);

orderSchema.plugin(mongooseCleanResponse);

module.exports = mongoose.model("Order", orderSchema);