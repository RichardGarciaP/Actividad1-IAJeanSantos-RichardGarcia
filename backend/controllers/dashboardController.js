const { db } = require('../config/database');

// Obtener resumen del dashboard
exports.getDashboardSummary = (req, res) => {
  const { startDate, endDate } = req.query;

  let dateFilter = '';
  const params = [req.userId];

  if (startDate && endDate) {
    dateFilter = 'AND date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = 'AND date >= ?';
    params.push(startDate);
  } else if (endDate) {
    dateFilter = 'AND date <= ?';
    params.push(endDate);
  }

  // Balance total (ingresos - gastos)
  db.get(
    `SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
     FROM transactions
     WHERE user_id = ? ${dateFilter}`,
    params,
    (err, balance) => {
      if (err) {
        return res.status(500).json({ error: 'Error al calcular balance' });
      }

      const totalIncome = balance.total_income || 0;
      const totalExpense = balance.total_expense || 0;
      const currentBalance = totalIncome - totalExpense;

      // Gastos por categoría
      db.all(
        `SELECT c.name, c.icon, c.color, SUM(t.amount) as total
         FROM transactions t
         JOIN categories c ON t.category_id = c.id
         WHERE t.user_id = ? AND t.type = 'expense' ${dateFilter}
         GROUP BY t.category_id
         ORDER BY total DESC`,
        params,
        (err, expensesByCategory) => {
          if (err) {
            return res
              .status(500)
              .json({ error: 'Error al obtener gastos por categoría' });
          }

          // Ingresos por categoría
          db.all(
            `SELECT c.name, c.icon, c.color, SUM(t.amount) as total
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = ? AND t.type = 'income' ${dateFilter}
             GROUP BY t.category_id
             ORDER BY total DESC`,
            params,
            (err, incomeByCategory) => {
              if (err) {
                return res
                  .status(500)
                  .json({ error: 'Error al obtener ingresos por categoría' });
              }

              // Transacciones recientes
              db.all(
                `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
                 FROM transactions t
                 JOIN categories c ON t.category_id = c.id
                 WHERE t.user_id = ?
                 ORDER BY t.date DESC, t.created_at DESC
                 LIMIT 5`,
                [req.userId],
                (err, recentTransactions) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({
                        error: 'Error al obtener transacciones recientes',
                      });
                  }

                  res.json({
                    balance: {
                      totalIncome,
                      totalExpense,
                      currentBalance,
                    },
                    expensesByCategory,
                    incomeByCategory,
                    recentTransactions,
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};
