const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) =>
    console.log(
      `\n${colors.yellow}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${
        colors.reset
      }`
    ),
};

// Función para hacer login
async function login() {
  try {
    log.section('1. AUTENTICACIÓN');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'juan@example.com',
      password: 'password123',
    });
    authToken = response.data.token;
    log.success('Login exitoso');
    log.info(`Usuario: ${response.data.user.name}`);
    log.info(`Email: ${response.data.user.email}`);
    return response.data.user;
  } catch (error) {
    log.error('Error en login: ' + error.message);
    throw error;
  }
}

// Función para obtener categorías
async function getCategories() {
  try {
    const response = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    log.success(`Categorías disponibles: ${response.data.length}`);
    return response.data;
  } catch (error) {
    log.error('Error obteniendo categorías: ' + error.message);
    throw error;
  }
}

// Función para crear transacciones de prueba
async function createTransactions(categories) {
  log.section('2. CREACIÓN DE TRANSACCIONES');

  const currentDate = new Date();
  const transactions = [
    // Ingresos
    {
      type: 'income',
      category_id: categories.find((c) => c.name === 'Salario').id,
      amount: 3500.0,
      description: 'Salario mensual diciembre',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'income',
      category_id: categories.find((c) => c.name === 'Freelance').id,
      amount: 800.0,
      description: 'Proyecto web freelance',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5)
        .toISOString()
        .split('T')[0],
    },
    // Gastos - Alimentación
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Alimentación').id,
      amount: 85.5,
      description: 'Supermercado semanal',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Alimentación').id,
      amount: 45.0,
      description: 'Restaurante con familia',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Alimentación').id,
      amount: 120.0,
      description: 'Compras del mes',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10)
        .toISOString()
        .split('T')[0],
    },
    // Gastos - Transporte
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Transporte').id,
      amount: 60.0,
      description: 'Gasolina',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Transporte').id,
      amount: 25.0,
      description: 'Uber al aeropuerto',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8)
        .toISOString()
        .split('T')[0],
    },
    // Gastos - Entretenimiento
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Entretenimiento').id,
      amount: 15.99,
      description: 'Netflix - suscripción mensual',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Entretenimiento').id,
      amount: 45.0,
      description: 'Cine con amigos',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Entretenimiento').id,
      amount: 80.0,
      description: 'Concierto',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 11)
        .toISOString()
        .split('T')[0],
    },
    // Gastos - Servicios
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Servicios').id,
      amount: 95.0,
      description: 'Internet y cable',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Servicios').id,
      amount: 65.0,
      description: 'Electricidad',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5)
        .toISOString()
        .split('T')[0],
    },
    // Gastos - Salud
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Salud').id,
      amount: 120.0,
      description: 'Consulta médica',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Salud').id,
      amount: 45.5,
      description: 'Farmacia - medicamentos',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9)
        .toISOString()
        .split('T')[0],
    },
    // Gastos - Educación
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Educación').id,
      amount: 199.0,
      description: 'Curso online programación',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2)
        .toISOString()
        .split('T')[0],
    },
    {
      type: 'expense',
      category_id: categories.find((c) => c.name === 'Educación').id,
      amount: 35.0,
      description: 'Libros técnicos',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 7)
        .toISOString()
        .split('T')[0],
    },
  ];

  let createdCount = 0;
  for (const transaction of transactions) {
    try {
      await axios.post(`${API_URL}/transactions`, transaction, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      createdCount++;
      log.success(
        `Transacción creada: ${transaction.description} - $${transaction.amount}`
      );
    } catch (error) {
      log.error(`Error creando transacción: ${transaction.description}`);
    }
  }

  log.info(
    `\nTotal transacciones creadas: ${createdCount}/${transactions.length}`
  );
  return createdCount;
}

// Función para crear presupuestos
async function createBudgets(categories) {
  log.section('3. CREACIÓN DE PRESUPUESTOS');

  const currentDate = new Date();
  const budgets = [
    {
      category_id: categories.find((c) => c.name === 'Alimentación').id,
      amount: 300.0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
    {
      category_id: categories.find((c) => c.name === 'Transporte').id,
      amount: 150.0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
    {
      category_id: categories.find((c) => c.name === 'Entretenimiento').id,
      amount: 100.0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
    {
      category_id: categories.find((c) => c.name === 'Servicios').id,
      amount: 200.0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
    {
      category_id: categories.find((c) => c.name === 'Salud').id,
      amount: 200.0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
    {
      category_id: categories.find((c) => c.name === 'Educación').id,
      amount: 250.0,
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    },
  ];

  let createdCount = 0;
  for (const budget of budgets) {
    try {
      const category = categories.find((c) => c.id === budget.category_id);
      await axios.post(`${API_URL}/budgets`, budget, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      createdCount++;
      log.success(`Presupuesto creado: ${category.name} - $${budget.amount}`);
    } catch (error) {
      log.error(
        `Error creando presupuesto: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  log.info(`\nTotal presupuestos creados: ${createdCount}/${budgets.length}`);
  return createdCount;
}

// Función para verificar el dashboard
async function verifyDashboard() {
  log.section('4. VERIFICACIÓN DEL DASHBOARD');

  try {
    const response = await axios.get(`${API_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = response.data;
    log.success('Dashboard cargado correctamente');
    log.info(`\n📊 RESUMEN FINANCIERO:`);
    log.info(`   Balance Total: $${data.balance.toFixed(2)}`);
    log.info(`   Ingresos: $${data.totalIncome.toFixed(2)}`);
    log.info(`   Gastos: $${data.totalExpenses.toFixed(2)}`);
    log.info(`   Total Transacciones: ${data.transactionCount}`);

    if (data.recentTransactions && data.recentTransactions.length > 0) {
      log.info(`\n📝 ÚLTIMAS 5 TRANSACCIONES:`);
      data.recentTransactions.forEach((t, i) => {
        const type = t.type === 'income' ? '💰' : '💸';
        log.info(
          `   ${i + 1}. ${type} ${t.description} - $${t.amount} (${
            t.category_name
          })`
        );
      });
    }

    if (data.expensesByCategory && data.expensesByCategory.length > 0) {
      log.info(`\n💳 GASTOS POR CATEGORÍA:`);
      data.expensesByCategory.forEach((cat) => {
        log.info(
          `   ${cat.category_name}: $${cat.total} (${cat.count} transacciones)`
        );
      });
    }

    return data;
  } catch (error) {
    log.error('Error verificando dashboard: ' + error.message);
    throw error;
  }
}

// Función para verificar análisis de presupuestos
async function verifyBudgetAnalysis() {
  log.section('5. VERIFICACIÓN DE ANÁLISIS DE PRESUPUESTOS');

  try {
    const currentDate = new Date();
    const response = await axios.get(
      `${API_URL}/budgets/analysis?month=${
        currentDate.getMonth() + 1
      }&year=${currentDate.getFullYear()}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const budgets = response.data;
    log.success(
      `Análisis de presupuestos obtenido: ${budgets.length} categorías`
    );

    log.info(`\n💰 ANÁLISIS DE PRESUPUESTOS:`);
    budgets.forEach((budget) => {
      const percentage = ((budget.spent / budget.amount) * 100).toFixed(1);
      const remaining = budget.amount - budget.spent;
      const status = percentage > 100 ? '🔴' : percentage > 70 ? '🟡' : '🟢';

      log.info(`\n   ${status} ${budget.category_name}:`);
      log.info(`      Presupuesto: $${budget.amount.toFixed(2)}`);
      log.info(`      Gastado: $${budget.spent.toFixed(2)} (${percentage}%)`);
      log.info(`      Restante: $${remaining.toFixed(2)}`);
    });

    return budgets;
  } catch (error) {
    log.error('Error verificando presupuestos: ' + error.message);
    throw error;
  }
}

// Función para verificar estadísticas por categoría
async function verifyCategoryStats() {
  log.section('6. VERIFICACIÓN DE ESTADÍSTICAS POR CATEGORÍA');

  try {
    const response = await axios.get(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const transactions = response.data;
    log.success(`Total de transacciones: ${transactions.length}`);

    // Agrupar por categoría
    const statsByCategory = {};
    transactions.forEach((t) => {
      if (!statsByCategory[t.category_name]) {
        statsByCategory[t.category_name] = {
          income: 0,
          expense: 0,
          count: 0,
          transactions: [],
        };
      }

      if (t.type === 'income') {
        statsByCategory[t.category_name].income += parseFloat(t.amount);
      } else {
        statsByCategory[t.category_name].expense += parseFloat(t.amount);
      }
      statsByCategory[t.category_name].count++;
      statsByCategory[t.category_name].transactions.push(t);
    });

    log.info(`\n📈 ESTADÍSTICAS POR CATEGORÍA:`);
    Object.keys(statsByCategory).forEach((categoryName) => {
      const stats = statsByCategory[categoryName];
      log.info(`\n   📁 ${categoryName}:`);
      if (stats.income > 0) {
        log.info(`      💰 Ingresos: $${stats.income.toFixed(2)}`);
      }
      if (stats.expense > 0) {
        log.info(`      💸 Gastos: $${stats.expense.toFixed(2)}`);
      }
      log.info(`      📊 Transacciones: ${stats.count}`);
    });

    return statsByCategory;
  } catch (error) {
    log.error('Error verificando estadísticas: ' + error.message);
    throw error;
  }
}

// Función para validar consistencia de datos
async function validateConsistency(
  dashboardData,
  budgetAnalysis,
  categoryStats
) {
  log.section('7. VALIDACIÓN DE CONSISTENCIA DE DATOS');

  let errors = 0;

  // Validar que el balance = ingresos - gastos
  const expectedBalance =
    dashboardData.totalIncome - dashboardData.totalExpenses;
  if (Math.abs(expectedBalance - dashboardData.balance) < 0.01) {
    log.success('Balance correcto: Ingresos - Gastos = Balance');
  } else {
    log.error(
      `Balance inconsistente: esperado $${expectedBalance}, obtenido $${dashboardData.balance}`
    );
    errors++;
  }

  // Validar que la suma de gastos por categoría coincida con el total de gastos
  const totalExpensesByCategory = dashboardData.expensesByCategory.reduce(
    (sum, cat) => sum + parseFloat(cat.total),
    0
  );
  if (Math.abs(totalExpensesByCategory - dashboardData.totalExpenses) < 0.01) {
    log.success('Total de gastos por categoría coincide con gastos totales');
  } else {
    log.error(
      `Gastos por categoría inconsistentes: suma $${totalExpensesByCategory}, total $${dashboardData.totalExpenses}`
    );
    errors++;
  }

  // Validar presupuestos
  budgetAnalysis.forEach((budget) => {
    const categoryExpenses = dashboardData.expensesByCategory.find(
      (c) => c.category_name === budget.category_name
    );
    if (categoryExpenses) {
      if (Math.abs(parseFloat(categoryExpenses.total) - budget.spent) < 0.01) {
        log.success(
          `Presupuesto ${budget.category_name}: gastos coinciden ($${budget.spent})`
        );
      } else {
        log.error(
          `Presupuesto ${budget.category_name}: gastos no coinciden (esperado $${categoryExpenses.total}, obtenido $${budget.spent})`
        );
        errors++;
      }
    }
  });

  log.info(`\n\n${'='.repeat(60)}`);
  if (errors === 0) {
    log.success(`✅ TODAS LAS VALIDACIONES PASARON CORRECTAMENTE`);
  } else {
    log.error(`❌ SE ENCONTRARON ${errors} ERRORES DE CONSISTENCIA`);
  }
  log.info(`${'='.repeat(60)}\n`);

  return errors === 0;
}

// Función principal
async function runTests() {
  try {
    const user = await login();
    const categories = await getCategories();

    await createTransactions(categories);
    await createBudgets(categories);

    const dashboardData = await verifyDashboard();
    const budgetAnalysis = await verifyBudgetAnalysis();
    const categoryStats = await verifyCategoryStats();

    await validateConsistency(dashboardData, budgetAnalysis, categoryStats);

    log.section('PRUEBAS COMPLETADAS');
    log.info('Puedes revisar la aplicación en: http://localhost:3000');
    log.info('Usuario de prueba: juan@example.com / password123');
  } catch (error) {
    log.error('Error en las pruebas: ' + error.message);
    process.exit(1);
  }
}

// Ejecutar pruebas
runTests();
