const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const { createCategory, getCategories } = require('../controllers/categoryController');

// Active categories accessible to all users
router.get('/', getCategories);

// Active category creation - Admin only
router.post('/', authentication, admin, createCategory);

module.exports = router;
