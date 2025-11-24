const express = require('express');
const router = express.Router();
const authentication = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/userController');

router.get('/me', authentication, getProfile);

module.exports = router;