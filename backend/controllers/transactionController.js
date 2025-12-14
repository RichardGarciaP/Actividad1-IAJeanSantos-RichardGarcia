const { db } = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener todas las transacciones del usuario
exports.getTransactions = (req, res) => {
  const { startDate, endDate, type, categoryId } = req.query;

  let query = `
    SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
  `;

  const params = [req.userId];

  if (startDate) {
    query += ' AND t.date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND t.date <= ?';
    params.push(endDate);
  }

  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
  }

  if (categoryId) {
    query += ' AND t.category_id = ?';
    params.push(categoryId);
  }

  query += ' ORDER BY t.date DESC, t.created_at DESC';

  db.all(query, params, (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener transacciones' });
    }
    res.json(transactions);
  });
};

// Crear nueva transacción
exports.createTransaction = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, date, description, type, categoryId } = req.body;

  db.run(
    `INSERT INTO transactions (user_id, amount, date, description, type, category_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, amount, date, description, type, categoryId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error al crear transacción' });
      }

      // Obtener la transacción recién creada con la información de categoría
      db.get(
        `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         WHERE t.id = ?`,
        [this.lastID],
        (err, transaction) => {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Error al obtener transacción' });
          }
          res.status(201).json(transaction);
        }
      );
    }
  );
};

// Actualizar transacción
exports.updateTransaction = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { amount, date, description, type, categoryId } = req.body;

  // Verificar que la transacción pertenezca al usuario
  db.get(
    'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
    [id, req.userId],
    (err, transaction) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (!transaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      // Actualizar
      db.run(
        `UPDATE transactions 
         SET amount = ?, date = ?, description = ?, type = ?, category_id = ?
         WHERE id = ?`,
        [amount, date, description, type, categoryId, id],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Error al actualizar transacción' });
          }

          // Obtener la transacción actualizada
          db.get(
            `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.id = ?`,
            [id],
            (err, updatedTransaction) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: 'Error al obtener transacción' });
              }
              res.json(updatedTransaction);
            }
          );
        }
      );
    }
  );
};

// Eliminar transacción
exports.deleteTransaction = (req, res) => {
  const { id } = req.params;

  // Verificar que la transacción pertenezca al usuario
  db.get(
    'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
    [id, req.userId],
    (err, transaction) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (!transaction) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
      }

      // Eliminar
      db.run('DELETE FROM transactions WHERE id = ?', [id], (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: 'Error al eliminar transacción' });
        }
        res.json({ message: 'Transacción eliminada exitosamente' });
      });
    }
  );
};
