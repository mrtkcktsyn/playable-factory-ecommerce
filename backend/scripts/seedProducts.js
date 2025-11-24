// backend/scripts/seedProducts.js

// Load environment variables (MONGODB_URI)
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("../src/models/Product");
const Category = require("../src/models/Category");

// Seed script for local development / demo.
// - Clears categories and products
// - Inserts a small set of categories
// - Inserts products that are linked to those categories

const categories = [
  {
    name: "Headphones",
    slug: "headphones",
  },
  {
    name: "Mouse",
    slug: "mouse",
  },
  {
    name: "Keyboard",
    slug: "keyboard",
  },
  {
    name: "Audio",
    slug: "audio",
  },
  {
    name: "Monitor",
    slug: "monitor",
  },
  {
    name: "Accessories",
    slug: "accessories",
  },
];

const products = [
  {
    name: "Playable Pulse Wireless Headset",
    slug: "playable-pulse-wireless-headset",
    description:
      "Low-latency wireless gaming headset with spatial audio, tuned for long sessions.",
    price: 2499,
    images: [
      "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg",
    ],
    stock: 15,
    isActive: true,
    rating: 4.6,
    numReviews: 34,
    categorySlug: "headphones",
  },
  {
    name: "Playable Precision Gaming Mouse",
    slug: "playable-precision-gaming-mouse",
    description:
      "Lightweight gaming mouse with adjustable DPI and durable switches.",
    price: 1299,
    images: [
      "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg",
    ],
    stock: 30,
    isActive: true,
    rating: 4.4,
    numReviews: 21,
    categorySlug: "mouse",
  },
  {
    name: "Playable TKL Mechanical Keyboard",
    slug: "playable-tkl-mechanical-keyboard",
    description:
      "Tenkeyless mechanical keyboard with hot-swappable switches and RGB.",
    price: 1899,
    images: [
      "https://images.pexels.com/photos/389819/pexels-photo-389819.jpeg",
    ],
    stock: 20,
    isActive: true,
    rating: 4.7,
    numReviews: 18,
    categorySlug: "keyboard",
  },
  {
    name: "Playable Studio Microphone",
    slug: "playable-studio-microphone",
    description:
      "USB condenser microphone for streaming, content creation and remote collaboration.",
    price: 1599,
    images: [
      "https://images.pexels.com/photos/3394663/pexels-photo-3394663.jpeg",
    ],
    stock: 10,
    isActive: true,
    rating: 4.3,
    numReviews: 12,
    categorySlug: "audio",
  },
  {
    name: 'Playable 27" QHD Gaming Monitor',
    slug: "playable-27-qhd-gaming-monitor",
    description:
      "144Hz QHD monitor with low response time and vivid color reproduction.",
    price: 5499,
    images: [
      "https://images.pexels.com/photos/5720564/pexels-photo-5720564.jpeg",
    ],
    stock: 8,
    isActive: true,
    rating: 4.8,
    numReviews: 9,
    categorySlug: "monitor",
  },
  {
    name: "Playable Desk RGB Light Bar",
    slug: "playable-desk-rgb-light-bar",
    description:
      "USB powered RGB light bar to make your setup feel more immersive.",
    price: 499,
    images: [
      "https://images.pexels.com/photos/8132694/pexels-photo-8132694.jpeg",
    ],
    stock: 40,
    isActive: true,
    rating: 4.1,
    numReviews: 17,
    categorySlug: "accessories",
  },
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Clear existing categories and products
    await Category.deleteMany({});
    console.log("Existing categories removed");

    await Product.deleteMany({});
    console.log("Existing products removed");

    // Insert categories first
    const createdCategories = await Category.insertMany(categories);
    console.log(`Inserted ${createdCategories.length} categories`);

    // Build a quick lookup map: slug -> ObjectId
    const categoryMap = createdCategories.reduce((acc, category) => {
      acc[category.slug] = category._id;
      return acc;
    }, {});

    // Attach category ObjectIds to products based on categorySlug
    const productsWithCategory = products.map((p) => {
      const categoryId =
        categoryMap[p.categorySlug] || categoryMap["accessories"];
      return {
        ...p,
        category: categoryId,
      };
    });

    // Insert products
    const createdProducts = await Product.insertMany(productsWithCategory);
    console.log(`Inserted ${createdProducts.length} products`);

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
