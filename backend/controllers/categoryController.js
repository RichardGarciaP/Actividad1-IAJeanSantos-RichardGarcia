const { db } = require('../config/database');

// Obtener todas las categorías o filtradas por tipo
exports.getCategories = (req, res) => {
  const { type } = req.query;

  let query = 'SELECT * FROM categories WHERE 1=1';
  const params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY name';

  db.all(query, params, (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener categorías' });
    }
    res.json(categories);
  });
};
