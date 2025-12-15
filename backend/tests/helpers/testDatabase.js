const sqlite3 = require('sqlite3').verbose();

let testDb;

/**
 * Crea una base de datos SQLite en memoria para testing
 */
const setupTestDatabase = () => {
  return new Promise((resolve, reject) => {
    testDb = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        reject(err);
      } else {
        createTestTables().then(resolve).catch(reject);
      }
    });
  });
};

/**
 * Crea las tablas necesarias para testing
 */
const createTestTables = () => {
  return new Promise((resolve, reject) => {
    testDb.serialize(() => {
      // Tabla de usuarios
      testDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de categorías
      testDb.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          icon TEXT,
          color TEXT,
          is_default INTEGER DEFAULT 1,
          UNIQUE(name, type)
        )
      `);

      // Tabla de transacciones
      testDb.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
          description TEXT NOT NULL,
          date DATE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
      `);

      // Tabla de presupuestos
      testDb.run(
        `
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
          UNIQUE(user_id, category_id, month, year)
        )
      `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  });
};

/**
 * Inserta datos de prueba en las categorías
 */
const seedCategories = () => {
  return new Promise((resolve, reject) => {
    const categories = [
      {
        name: 'Salario',
        type: 'income',
        icon: 'dollar-sign',
        color: '#10b981',
      },
      {
        name: 'Freelance',
        type: 'income',
        icon: 'briefcase',
        color: '#3b82f6',
      },
      { name: 'Comida', type: 'expense', icon: 'utensils', color: '#ef4444' },
      { name: 'Transporte', type: 'expense', icon: 'car', color: '#f59e0b' },
      {
        name: 'Entretenimiento',
        type: 'expense',
        icon: 'film',
        color: '#8b5cf6',
      },
    ];

    const stmt = testDb.prepare(
      'INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)'
    );

    categories.forEach((cat) => {
      stmt.run(cat.name, cat.type, cat.icon, cat.color);
    });

    stmt.finalize((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Limpia todas las tablas
 */
const cleanDatabase = () => {
  return new Promise((resolve, reject) => {
    testDb.serialize(() => {
      testDb.run('DELETE FROM transactions');
      testDb.run('DELETE FROM budgets');
      testDb.run('DELETE FROM users');
      testDb.run('DELETE FROM categories', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

/**
 * Cierra la conexión de la base de datos
 */
const closeTestDatabase = () => {
  return new Promise((resolve, reject) => {
    if (testDb) {
      testDb.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * Obtiene la instancia de la base de datos de prueba
 */
const getTestDb = () => testDb;

module.exports = {
  setupTestDatabase,
  cleanDatabase,
  closeTestDatabase,
  seedCategories,
  getTestDb,
};
