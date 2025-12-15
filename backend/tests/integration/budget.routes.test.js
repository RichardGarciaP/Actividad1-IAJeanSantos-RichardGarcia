const request = require('supertest');
const { db, createTables } = require('../../config/database');
const app = require('../../server');

describe('Budget Routes - Integration Tests', () => {
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
      email: 'budget@example.com',
      password: 'Password123!',
      fullName: 'Budget User',
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
    // Limpiar presupuestos y transacciones antes de cada test
    await new Promise((resolve) => {
      db.run('DELETE FROM budgets', () => {
        db.run('DELETE FROM transactions', () => resolve());
      });
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      db.close(() => resolve());
    });
  });

  describe('GET /api/budgets', () => {
    it('debe obtener lista vacía de presupuestos', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('debe obtener presupuestos del usuario', async () => {
      // Crear un presupuesto
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?)',
          [userId, categoryId, 500.0, 1, 2024],
          resolve
        );
      });

      const response = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('amount', 500.0);
    });

    it('debe rechazar request sin autenticación', async () => {
      const response = await request(app).get('/api/budgets').expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/budgets', () => {
    const validBudget = {
      categoryId: 1,
      amount: 500.0,
      month: 1,
      year: 2024,
    };

    it('debe crear presupuesto exitosamente', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBudget)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('amount', validBudget.amount);
      expect(response.body).toHaveProperty('month', validBudget.month);
      expect(response.body).toHaveProperty('year', validBudget.year);
    });

    it('debe rechazar mes inválido (0)', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validBudget, month: 0 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar mes inválido (13)', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validBudget, month: 13 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar año menor a 2000', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validBudget, year: 1999 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar monto negativo', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validBudget, amount: -100 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar monto cero', async () => {
      const response = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validBudget, amount: 0 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe actualizar presupuesto existente si ya existe', async () => {
      // Crear primer presupuesto
      const firstResponse = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBudget)
        .expect(201);

      const firstId = firstResponse.body.id;

      // Crear otro con misma categoría y mes (debería actualizar)
      const secondResponse = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validBudget, amount: 1000.0 })
        .expect(201);

      // El ID debería ser el mismo porque se actualizó
      expect(secondResponse.body.id).toBe(firstId);
      expect(secondResponse.body.amount).toBe(1000.0);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    let budgetId;

    beforeEach(async () => {
      // Crear presupuesto para eliminar
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?)',
          [userId, categoryId, 500.0, 1, 2024],
          function () {
            budgetId = this.lastID;
            resolve();
          }
        );
      });
    });

    it('debe eliminar presupuesto exitosamente', async () => {
      const response = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Presupuesto eliminado exitosamente'
      );
    });

    it('debe rechazar eliminación de presupuesto inexistente', async () => {
      const response = await request(app)
        .delete('/api/budgets/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/budgets/analysis', () => {
    it('debe obtener análisis de presupuesto con month y year', async () => {
      // Crear un presupuesto
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO budgets (user_id, category_id, amount, month, year) VALUES (?, ?, ?, ?, ?)',
          [userId, categoryId, 500.0, 1, 2024],
          () => {
            // Crear algunas transacciones
            db.run(
              'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
              [userId, categoryId, 200.0, 'expense', 'Compra', '2024-01-15'],
              resolve
            );
          }
        );
      });

      const response = await request(app)
        .get('/api/budgets/analysis?month=1&year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('budgets');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.budgets)).toBe(true);
    });

    it('debe rechazar request sin month', async () => {
      const response = await request(app)
        .get('/api/budgets/analysis?year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('debe rechazar request sin year', async () => {
      const response = await request(app)
        .get('/api/budgets/analysis?month=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('debe rechazar request sin autenticación', async () => {
      const response = await request(app)
        .get('/api/budgets/analysis?month=1&year=2024')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });
});
