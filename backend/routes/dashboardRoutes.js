const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

// Obtener resumen del dashboard (requiere autenticación)
router.get('/summary', authMiddleware, dashboardController.getDashboardSummary);

module.exports = router;
