const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener transacciones
router.get('/', transactionController.getTransactions);

// Crear transacción
router.post(
  '/',
  [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('El monto debe ser mayor a 0'),
    body('date').isISO8601().withMessage('Fecha inválida'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    body('type').isIn(['income', 'expense']).withMessage('Tipo inválido'),
    body('categoryId').isInt().withMessage('Categoría inválida'),
  ],
  transactionController.createTransaction
);

// Actualizar transacción
router.put(
  '/:id',
  [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('El monto debe ser mayor a 0'),
    body('date').isISO8601().withMessage('Fecha inválida'),
    body('description').notEmpty().withMessage('La descripción es requerida'),
    body('type').isIn(['income', 'expense']).withMessage('Tipo inválido'),
    body('categoryId').isInt().withMessage('Categoría inválida'),
  ],
  transactionController.updateTransaction
);

// Eliminar transacción
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
