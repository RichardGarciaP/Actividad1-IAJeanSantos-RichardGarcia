const request = require('supertest');
const { db, createTables } = require('../../config/database');
const app = require('../../server');

describe('Dashboard Routes - Integration Tests', () => {
  let authToken;
  let userId;
  let categoryId;

  beforeAll(async () => {
    await createTables();

    // Insertar categorías por defecto
    await new Promise((resolve, reject) => {
      const categories = [
        { name: 'Salario', type: 'income', icon: 'money', color: '#4CAF50' },
        {
          name: 'Alimentación',
          type: 'expense',
          icon: 'food',
          color: '#FF9800',
        },
        { name: 'Transporte', type: 'expense', icon: 'car', color: '#2196F3' },
        {
          name: 'Entretenimiento',
          type: 'expense',
          icon: 'movie',
          color: '#9C27B0',
        },
        { name: 'Otros', type: 'expense', icon: 'more', color: '#607D8B' },
      ];

      const stmt = db.prepare(
        'INSERT OR IGNORE INTO categories (name, type, icon, color, is_default) VALUES (?, ?, ?, ?, 1)'
      );
      categories.forEach((cat) => {
        stmt.run(cat.name, cat.type, cat.icon, cat.color);
      });
      stmt.finalize((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Registrar usuario de prueba
    const response = await request(app).post('/api/auth/register').send({
      email: 'dashboard@example.com',
      password: 'Password123!',
      fullName: 'Dashboard User',
    });

    authToken = response.body.token;
    userId = response.body.user.id;

    // Obtener ID de categoría
    await new Promise((resolve) => {
      db.get(
        'SELECT id FROM categories WHERE name = ?',
        ['Alimentación'],
        (err, row) => {
          if (row) categoryId = row.id;
          resolve();
        }
      );
    });
  });

  beforeEach(async () => {
    // Limpiar transacciones antes de cada test
    await new Promise((resolve) => {
      db.run('DELETE FROM transactions', () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      db.close(() => resolve());
    });
  });

  describe('GET /api/dashboard/summary', () => {
    it('debe obtener resumen del dashboard sin transacciones', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body.balance).toHaveProperty('totalIncome', 0);
      expect(response.body.balance).toHaveProperty('totalExpense', 0);
      expect(response.body.balance).toHaveProperty('currentBalance', 0);
      expect(response.body).toHaveProperty('recentTransactions');
      expect(Array.isArray(response.body.recentTransactions)).toBe(true);
    });

    it('debe calcular correctamente totales con transacciones', async () => {
      // Crear transacciones de prueba
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, categoryId, 1000.0, 'income', 'Salario', '2024-01-15'],
          () => {
            db.run(
              'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
              [userId, categoryId, 300.0, 'expense', 'Compras', '2024-01-16'],
              () => {
                db.run(
                  'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
                  [
                    userId,
                    categoryId,
                    200.0,
                    'expense',
                    'Transporte',
                    '2024-01-17',
                  ],
                  resolve
                );
              }
            );
          }
        );
      });

      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.balance).toHaveProperty('totalIncome', 1000.0);
      expect(response.body.balance).toHaveProperty('totalExpense', 500.0);
      expect(response.body.balance).toHaveProperty('currentBalance', 500.0);
      expect(response.body.recentTransactions.length).toBeLessThanOrEqual(10);
    });

    it('debe incluir transacciones recientes ordenadas por fecha', async () => {
      // Crear múltiples transacciones
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, categoryId, 100.0, 'expense', 'Antigua', '2024-01-01'],
          () => {
            db.run(
              'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
              [userId, categoryId, 200.0, 'expense', 'Reciente', '2024-01-20'],
              resolve
            );
          }
        );
      });

      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recentTransactions).toHaveLength(2);
      // La más reciente debe estar primero
      expect(response.body.recentTransactions[0]).toHaveProperty(
        'description',
        'Reciente'
      );
    });

    it('debe rechazar request sin autenticación', async () => {
      const response = await request(app)
        .get('/api/dashboard/summary')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('debe incluir estadísticas por categoría', async () => {
      // Crear transacciones en diferentes categorías
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, categoryId, 500.0, 'expense', 'Compra 1', '2024-01-15'],
          () => {
            db.run(
              'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
              [userId, categoryId, 300.0, 'expense', 'Compra 2', '2024-01-16'],
              resolve
            );
          }
        );
      });

      const response = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('expensesByCategory');
      expect(Array.isArray(response.body.expensesByCategory)).toBe(true);
      expect(response.body).toHaveProperty('incomeByCategory');
      expect(Array.isArray(response.body.incomeByCategory)).toBe(true);
    });
  });
});
