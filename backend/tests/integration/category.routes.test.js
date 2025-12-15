const request = require('supertest');
const { db, createTables } = require('../../config/database');
const app = require('../../server');

describe('Category Routes - Integration Tests', () => {
  let authToken;

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
      email: 'category@example.com',
      password: 'Password123!',
      fullName: 'Category User',
    });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      db.close(() => resolve());
    });
  });

  describe('GET /api/categories', () => {
    it('debe obtener todas las categorías', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('debe incluir categorías con nombre, tipo, icono y color', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const category = response.body[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('type');
      expect(category).toHaveProperty('icon');
      expect(category).toHaveProperty('color');
    });

    it('debe rechazar request sin autenticación', async () => {
      const response = await request(app).get('/api/categories').expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('debe incluir categorías de ingresos y gastos', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const incomeCategories = response.body.filter(
        (cat) => cat.type === 'income'
      );
      const expenseCategories = response.body.filter(
        (cat) => cat.type === 'expense'
      );

      expect(incomeCategories.length).toBeGreaterThan(0);
      expect(expenseCategories.length).toBeGreaterThan(0);
    });
  });
});
