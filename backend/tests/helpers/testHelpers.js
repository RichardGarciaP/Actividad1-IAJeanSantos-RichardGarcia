const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Genera un token JWT válido para testing
 */
const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret-key', {
    expiresIn: '24h',
  });
};

/**
 * Crea un usuario de prueba
 */
const createTestUser = (db, userData = {}) => {
  return new Promise(async (resolve, reject) => {
    const defaultUser = {
      email: 'test@example.com',
      password: 'TestPassword123',
      fullName: 'Test User',
    };

    const user = { ...defaultUser, ...userData };
    const passwordHash = await bcrypt.hash(user.password, 10);

    db.run(
      'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
      [user.email, passwordHash, user.fullName],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            email: user.email,
            fullName: user.fullName,
            password: user.password, // Guardamos la contraseña sin hash para testing
          });
        }
      }
    );
  });
};

/**
 * Crea una transacción de prueba
 */
const createTestTransaction = (db, transactionData) => {
  return new Promise((resolve, reject) => {
    const defaults = {
      userId: 1,
      categoryId: 1,
      amount: 100.0,
      type: 'expense',
      description: 'Test transaction',
      date: new Date().toISOString().split('T')[0],
    };

    const transaction = { ...defaults, ...transactionData };

    db.run(
      `INSERT INTO transactions (user_id, category_id, amount, type, description, date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        transaction.userId,
        transaction.categoryId,
        transaction.amount,
        transaction.type,
        transaction.description,
        transaction.date,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...transaction,
          });
        }
      }
    );
  });
};

/**
 * Crea un presupuesto de prueba
 */
const createTestBudget = (db, budgetData) => {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const defaults = {
      userId: 1,
      categoryId: 1,
      amount: 500.0,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    const budget = { ...defaults, ...budgetData };

    db.run(
      `INSERT INTO budgets (user_id, category_id, amount, month, year) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        budget.userId,
        budget.categoryId,
        budget.amount,
        budget.month,
        budget.year,
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...budget,
          });
        }
      }
    );
  });
};

/**
 * Valida la estructura de un error de validación
 */
const expectValidationError = (response, field) => {
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('errors');
  if (field) {
    const fieldError = response.body.errors.find((err) => err.path === field);
    expect(fieldError).toBeDefined();
  }
};

/**
 * Valida una respuesta exitosa
 */
const expectSuccessResponse = (response, statusCode = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toBeDefined();
};

module.exports = {
  generateTestToken,
  createTestUser,
  createTestTransaction,
  createTestBudget,
  expectValidationError,
  expectSuccessResponse,
};
