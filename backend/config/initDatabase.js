const { db, createTables } = require('./database');
const bcrypt = require('bcryptjs');

// Categorías predefinidas
const defaultCategories = [
  // Categorías de Gastos
  { name: 'Alimentación', type: 'expense', icon: '🍔', color: '#FF6B6B' },
  { name: 'Transporte', type: 'expense', icon: '🚗', color: '#4ECDC4' },
  { name: 'Entretenimiento', type: 'expense', icon: '🎮', color: '#FFE66D' },
  { name: 'Servicios', type: 'expense', icon: '💡', color: '#95E1D3' },
  { name: 'Salud', type: 'expense', icon: '🏥', color: '#F38181' },
  { name: 'Educación', type: 'expense', icon: '📚', color: '#AA96DA' },
  { name: 'Otros Gastos', type: 'expense', icon: '📦', color: '#FCBAD3' },

  // Categorías de Ingresos
  { name: 'Salario', type: 'income', icon: '💰', color: '#6BCF7F' },
  { name: 'Freelance', type: 'income', icon: '💼', color: '#4D96FF' },
  { name: 'Inversiones', type: 'income', icon: '📈', color: '#FFA726' },
  { name: 'Otros Ingresos', type: 'income', icon: '💵', color: '#26C6DA' },
];

const initDatabase = async () => {
  console.log('🔄 Inicializando base de datos...');

  // Crear tablas
  createTables();

  // Esperar a que las tablas se creen
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Insertar categorías predefinidas solo si no existen
  await new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
      if (err || !row || row.count === 0) {
        const stmt = db.prepare(`
          INSERT INTO categories (name, type, icon, color, is_default)
          VALUES (?, ?, ?, ?, 1)
        `);

        defaultCategories.forEach((category) => {
          stmt.run(category.name, category.type, category.icon, category.color);
        });

        stmt.finalize(() => {
          console.log('✅ Categorías predefinidas insertadas');
          resolve();
        });
      } else {
        console.log('ℹ️  Las categorías ya existen, omitiendo inserción');
        resolve();
      }
    });
  });

  // Crear usuario de prueba (opcional)
  const demoPassword = await bcrypt.hash('Demo1234', 10);
  db.run(
    `
    INSERT OR IGNORE INTO users (email, password_hash, full_name)
    VALUES (?, ?, ?)
  `,
    ['demo@financialsec.com', demoPassword, 'Usuario Demo'],
    (err) => {
      if (err) {
        console.log('ℹ️  Usuario demo ya existe o error:', err.message);
      } else {
        console.log(
          '✅ Usuario demo creado (email: demo@financialsec.com, password: Demo1234)'
        );
      }
    }
  );

  console.log('✅ Base de datos inicializada correctamente');

  // Cerrar conexión después de un delay
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      } else {
        console.log('Conexión a la base de datos cerrada');
      }
      process.exit(0);
    });
  }, 2000);
};

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };
