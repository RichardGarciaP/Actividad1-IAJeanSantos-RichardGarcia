const request = require('supertest');
const { db, createTables } = require('../../config/database');
const app = require('../../server');

describe('Transaction Routes - Integration Tests', () => {
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
      email: 'transaction@example.com',
      password: 'Password123!',
      fullName: 'Transaction User',
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

  describe('GET /api/transactions', () => {
    it('debe obtener lista vacía de transacciones', async () => {
      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('debe obtener transacciones del usuario', async () => {
      // Crear una transacción
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, categoryId, 50.0, 'expense', 'Supermercado', '2024-01-15'],
          resolve
        );
      });

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('amount', 50.0);
      expect(response.body[0]).toHaveProperty('description', 'Supermercado');
    });

    it('debe rechazar request sin autenticación', async () => {
      const response = await request(app).get('/api/transactions').expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('debe filtrar transacciones por tipo', async () => {
      // Crear transacciones de diferentes tipos
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, categoryId, 50.0, 'expense', 'Gasto', '2024-01-15'],
          () => {
            db.run(
              'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
              [userId, categoryId, 100.0, 'income', 'Ingreso', '2024-01-15'],
              resolve
            );
          }
        );
      });

      const response = await request(app)
        .get('/api/transactions?type=expense')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('type', 'expense');
    });
  });

  describe('POST /api/transactions', () => {
    const validTransaction = {
      categoryId: 1,
      amount: 75.5,
      type: 'expense',
      description: 'Compra de comida',
      date: '2024-01-15',
    };

    it('debe crear transacción exitosamente', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTransaction)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('amount', validTransaction.amount);
      expect(response.body).toHaveProperty(
        'description',
        validTransaction.description
      );
      expect(response.body).toHaveProperty('type', validTransaction.type);
    });

    it('debe rechazar monto negativo', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validTransaction, amount: -50 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar monto cero', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validTransaction, amount: 0 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar tipo inválido', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validTransaction, type: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar fecha inválida', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validTransaction, date: 'invalid-date' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar sin categoryId', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...validTransaction, categoryId: undefined })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      // Crear transacción para actualizar
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, categoryId, 50.0, 'expense', 'Original', '2024-01-15'],
          function () {
            transactionId = this.lastID;
            resolve();
          }
        );
      });
    });

    it('debe actualizar transacción exitosamente', async () => {
      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          amount: 100.0,
          type: 'expense',
          description: 'Actualizada',
          date: '2024-01-20',
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', transactionId);
      expect(response.body).toHaveProperty('amount', 100.0);
      expect(response.body).toHaveProperty('description', 'Actualizada');
    });

    it('debe rechazar actualización de transacción inexistente', async () => {
      const response = await request(app)
        .put('/api/transactions/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          amount: 100.0,
          type: 'expense',
          description: 'Test',
          date: '2024-01-20',
        })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('debe rechazar monto negativo en actualización', async () => {
      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          amount: -50,
          type: 'expense',
          description: 'Test',
          date: '2024-01-20',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    let transactionId;

    beforeEach(async () => {
      // Crear transacción para eliminar
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO transactions (user_id, category_id, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, categoryId, 50.0, 'expense', 'Para eliminar', '2024-01-15'],
          function () {
            transactionId = this.lastID;
            resolve();
          }
        );
      });
    });

    it('debe eliminar transacción exitosamente', async () => {
      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Transacción eliminada exitosamente'
      );
    });

    it('debe rechazar eliminación de transacción inexistente', async () => {
      const response = await request(app)
        .delete('/api/transactions/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Validación de datos', () => {
    it('debe validar que amount sea un número', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId,
          amount: 'not-a-number',
          type: 'expense',
          description: 'Test',
          date: '2024-01-15',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe validar que categoryId sea un número', async () => {
      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId: 'not-a-number',
          amount: 100,
          type: 'expense',
          description: 'Test',
          date: '2024-01-15',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });
});
