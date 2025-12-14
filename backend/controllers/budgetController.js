const { db } = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener todos los presupuestos del usuario
exports.getBudgets = (req, res) => {
  const { month, year } = req.query;

  let query = `
    SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ?
  `;

  const params = [req.userId];

  if (month && year) {
    query += ' AND b.month = ? AND b.year = ?';
    params.push(parseInt(month), parseInt(year));
  }

  query += ' ORDER BY c.name';

  db.all(query, params, (err, budgets) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener presupuestos' });
    }
    res.json(budgets);
  });
};

// Crear o actualizar presupuesto
exports.upsertBudget = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { categoryId, month, year, amount } = req.body;

  // Verificar si ya existe un presupuesto para esta categoría en este mes/año
  db.get(
    'SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?',
    [req.userId, categoryId, month, year],
    (err, existingBudget) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (existingBudget) {
        // Actualizar presupuesto existente
        db.run(
          `UPDATE budgets 
           SET amount = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [amount, existingBudget.id],
          (err) => {
            if (err) {
              return res
                .status(500)
                .json({ error: 'Error al actualizar presupuesto' });
            }
            getBudgetById(existingBudget.id, res);
          }
        );
      } else {
        // Crear nuevo presupuesto
        db.run(
          `INSERT INTO budgets (user_id, category_id, month, year, amount)
           VALUES (?, ?, ?, ?, ?)`,
          [req.userId, categoryId, month, year, amount],
          function (err) {
            if (err) {
              return res
                .status(500)
                .json({ error: 'Error al crear presupuesto' });
            }
            getBudgetById(this.lastID, res);
          }
        );
      }
    }
  );
};

// Eliminar presupuesto
exports.deleteBudget = (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
    [id, req.userId],
    (err, budget) => {
      if (err) {
        return res.status(500).json({ error: 'Error en el servidor' });
      }

      if (!budget) {
        return res.status(404).json({ error: 'Presupuesto no encontrado' });
      }

      db.run('DELETE FROM budgets WHERE id = ?', [id], (err) => {
        if (err) {
          return res
            .status(500)
            .json({ error: 'Error al eliminar presupuesto' });
        }
        res.json({ message: 'Presupuesto eliminado exitosamente' });
      });
    }
  );
};

// Obtener análisis de presupuesto vs gastos reales
exports.getBudgetAnalysis = (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'Mes y año son requeridos' });
  }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  // Obtener presupuestos del mes
  db.all(
    `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM budgets b
     JOIN categories c ON b.category_id = c.id
     WHERE b.user_id = ? AND b.month = ? AND b.year = ?`,
    [req.userId, parseInt(month), parseInt(year)],
    (err, budgets) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener presupuestos' });
      }

      // Obtener gastos reales por categoría en el mes
      db.all(
        `SELECT category_id, SUM(amount) as total_spent
         FROM transactions
         WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?
         GROUP BY category_id`,
        [req.userId, startDate, endDate],
        (err, expenses) => {
          if (err) {
            return res.status(500).json({ error: 'Error al obtener gastos' });
          }

          // Mapear gastos por categoría
          const expenseMap = {};
          expenses.forEach((exp) => {
            expenseMap[exp.category_id] = exp.total_spent;
          });

          // Combinar presupuestos con gastos reales
          const analysis = budgets.map((budget) => {
            const spent = expenseMap[budget.category_id] || 0;
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;

            return {
              ...budget,
              spent: spent,
              remaining: remaining,
              percentage: Math.min(percentage, 100),
              isOverBudget: spent > budget.amount,
            };
          });

          // Calcular totales
          const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
          const totalSpent = Object.values(expenseMap).reduce(
            (sum, val) => sum + val,
            0
          );

          res.json({
            budgets: analysis,
            summary: {
              totalBudget,
              totalSpent,
              totalRemaining: totalBudget - totalSpent,
              overallPercentage:
                totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            },
          });
        }
      );
    }
  );
};

// Función auxiliar para obtener presupuesto por ID
function getBudgetById(id, res) {
  db.get(
    `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM budgets b
     JOIN categories c ON b.category_id = c.id
     WHERE b.id = ?`,
    [id],
    (err, budget) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener presupuesto' });
      }
      res.status(201).json(budget);
    }
  );
}
