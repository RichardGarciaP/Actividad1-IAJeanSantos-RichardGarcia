const request = require('supertest');
const { db, createTables } = require('../../config/database');
const app = require('../../server');

describe('Auth Routes - Integration Tests', () => {
  beforeAll(async () => {
    // Crear tablas en la base de datos de prueba
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
  });

  beforeEach(async () => {
    // Limpiar tabla de usuarios antes de cada test
    await new Promise((resolve) => {
      db.run('DELETE FROM users', () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      db.close(() => resolve());
    });
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'Test User',
    };

    it('debe registrar un nuevo usuario con datos válidos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: validUserData.email,
        fullName: validUserData.fullName,
      });
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('debe rechazar registro sin email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, email: undefined })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('debe rechazar email inválido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar contraseña débil (menos de 8 caracteres)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: 'Weak1!' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar contraseña sin mayúsculas', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: 'password123!' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar contraseña sin minúsculas', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: 'PASSWORD123!' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar contraseña sin números', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: 'Password!' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar email duplicado', async () => {
      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Segundo registro con mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ya está registrado');
    });

    it('debe rechazar fullName vacío', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, fullName: '' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    const userCredentials = {
      email: 'login@example.com',
      password: 'Password123!',
      fullName: 'Login User',
    };

    beforeEach(async () => {
      // Registrar un usuario para las pruebas de login
      await request(app).post('/api/auth/register').send(userCredentials);
    });

    it('debe permitir login con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: userCredentials.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userCredentials.email);
    });

    it('debe rechazar login con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userCredentials.password,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    it('debe rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Credenciales inválidas');
    });

    it('debe rechazar login sin email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: userCredentials.password,
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('debe rechazar login sin contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userCredentials.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Registrar y obtener token
      const response = await request(app).post('/api/auth/register').send({
        email: 'profile@example.com',
        password: 'Password123!',
        fullName: 'Profile User',
      });

      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('debe obtener perfil de usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        email: 'profile@example.com',
        fullName: 'Profile User',
      });
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('debe rechazar acceso sin token', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token no proporcionado');
    });

    it('debe rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Token inválido');
    });
  });
});
