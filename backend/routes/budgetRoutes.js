const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener presupuestos
router.get('/', budgetController.getBudgets);

// Obtener análisis de presupuesto vs gastos reales
router.get('/analysis', budgetController.getBudgetAnalysis);

// Crear o actualizar presupuesto
router.post(
  '/',
  [
    body('categoryId').isInt().withMessage('Categoría inválida'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Mes inválido'),
    body('year').isInt({ min: 2000 }).withMessage('Año inválido'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('El monto debe ser mayor a 0'),
  ],
  budgetController.upsertBudget
);

// Eliminar presupuesto
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
