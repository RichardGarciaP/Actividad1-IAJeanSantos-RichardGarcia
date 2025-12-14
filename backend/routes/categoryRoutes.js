const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

// Obtener categorías (requiere autenticación)
router.get('/', authMiddleware, categoryController.getCategories);

module.exports = router;
