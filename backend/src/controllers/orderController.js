const Order = require("../models/Order");
const Product = require("../models/Product");

// POST /api/orders/checkout
// Create a new order for logged in user
exports.createOrder = async (req, res) => {
  try {
    const { items, customerName, customerEmail, shippingAddress } = req.body;

    // Validate items
    (!items || !Array.isArray(items) || items.length === 0) &&
      res.status(400).json({ message: "Items are required" });

    // Get product id's from items
    const productIds = items.map((item) => item.productId);
    const uniqueIds = [...new Set(productIds)];

    // Fetch products from DB
    const products = await Product.find({
      _id: { $in: uniqueIds },
      isActive: true,
    });

    // Check for missing products
    const foundIdSet = new Set(products.map((p) => p._id.toString()));
    const missingIds = uniqueIds.filter((id) => !foundIdSet.has(id));

    if (missingIds.length > 0) {
        res.status(400).json({ message: "One or more products are invalid or inactive", missingProductIds: missingIds });
    }
     
    // Map products by id for easy access
    const productMap = {};
    products.forEach((product) => {
      productMap[product._id.toString()] = product;
    });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productMap[item.productId];

      !product &&
        res
          .status(400)
          .json({
            message: `Product not found for id: ${item.productId}`,
          });

      product.stock < item.quantity &&
        res
          .status(400)
          .json({ message: `Insufficient stock for product ${product.name}` });

      const price = product.price;
      const quantity = item.quantity;

      totalAmount += price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity,
        price,
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      customerName,
      customerEmail,
      shippingAddress,
      status: "pending",
      paymentStatus: "pending",
    });

    // Update stock after order creation
    await Promise.all(
      orderItems.map((item) =>
        Product.updateOne(
          { _id: item.product },
          { $inc: { stock: -item.quantity } }
        )
      )
    );

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name slug price");

    res.json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: error.message });
  }
};



// GET /api/orders/:id
// User can see their own order, admin can see everyone's order
exports.getOrderById = async (req, res) => {
    try {
        const order = (await Order.findById(req.params.id)).populate("items.product", "name slug price")
        
        !order && res.status(404).json({ message: "Order not found" });

        // Check if the user is the owner of the order or an admin
        const isCustomer = order.user && order.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        !isCustomer && !isAdmin && res.status(403).json({ message: "Not authorized to view this order" });

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// GET api/orders
// List all orders - Admin only
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("items.product", "name slug price");

      res.json(orders);
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// PATCH api/orders/:id/status
// Update order status - Admin only
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const allowedStatuses = ["pending", "paid", "shipped", "completed", "cancelled"];
    const allowedPaymentStatuses = ["pending", "paid", "failed"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid paymentStatus value" });
    }

    const order = await Order.findById(req.params.id);

    !order && res.status(404).json({ message: "Order not found" });

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({
      message: "Order updated successfully",
      order
    })
  }catch(error){
    console.error("Update order status error:", error);
    res.status(500).json({ message: error.message });
  }
}