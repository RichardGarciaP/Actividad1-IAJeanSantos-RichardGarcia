import { test, expect } from '@playwright/test';

test.describe('Financial Sec - Transactions Flow E2E', () => {
  let testEmail;

  test.beforeEach(async ({ page }) => {
    // Registrar un usuario para cada test
    testEmail = `testuser${Date.now()}@example.com`;
    await page.goto('/register');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Nombre completo').fill('Transaction Test User');
    await page.getByLabel('Contraseña').fill('TestPassword123');
    await page.getByRole('button', { name: /Registrarse/i }).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('debe navegar a la sección de transacciones', async ({ page }) => {
    // Navegar a transacciones
    await page.getByText('Transacciones').click();
    await expect(page).toHaveURL(/.*transactions/);
    await expect(page.getByText('Transacciones')).toBeVisible();
  });

  test('debe crear una nueva transacción de gasto', async ({ page }) => {
    // Navegar a transacciones
    await page.getByText('Transacciones').click();

    // Abrir modal de nueva transacción
    await page.getByRole('button', { name: /Nueva Transacción/i }).click();

    // Llenar formulario
    await page.getByLabel('Monto').fill('150.50');
    await page.getByLabel('Descripción').fill('Compra de supermercado');
    await page.getByLabel('Tipo').selectOption('expense');
    await page.getByLabel('Categoría').selectOption({ index: 1 });
    await page.getByLabel('Fecha').fill('2024-01-15');

    // Guardar transacción
    await page.getByRole('button', { name: /Guardar/i }).click();

    // Verificar que aparece en la lista
    await expect(page.getByText('Compra de supermercado')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('150.50')).toBeVisible();
  });

  test('debe crear una transacción de ingreso', async ({ page }) => {
    await page.getByText('Transacciones').click();
    await page.getByRole('button', { name: /Nueva Transacción/i }).click();

    await page.getByLabel('Monto').fill('2500.00');
    await page.getByLabel('Descripción').fill('Salario enero');
    await page.getByLabel('Tipo').selectOption('income');
    await page.getByLabel('Categoría').selectOption({ index: 1 });
    await page.getByLabel('Fecha').fill('2024-01-01');

    await page.getByRole('button', { name: /Guardar/i }).click();

    await expect(page.getByText('Salario enero')).toBeVisible({
      timeout: 5000,
    });
  });

  test('debe editar una transacción existente', async ({ page }) => {
    // Crear transacción primero
    await page.getByText('Transacciones').click();
    await page.getByRole('button', { name: /Nueva Transacción/i }).click();
    await page.getByLabel('Monto').fill('100.00');
    await page.getByLabel('Descripción').fill('Transacción original');
    await page.getByLabel('Tipo').selectOption('expense');
    await page.getByLabel('Categoría').selectOption({ index: 1 });
    await page.getByLabel('Fecha').fill('2024-01-10');
    await page.getByRole('button', { name: /Guardar/i }).click();

    await expect(page.getByText('Transacción original')).toBeVisible();

    // Editar
    await page
      .getByRole('button', { name: /Editar/i })
      .first()
      .click();
    await page.getByLabel('Descripción').fill('Transacción editada');
    await page.getByLabel('Monto').fill('200.00');
    await page.getByRole('button', { name: /Guardar/i }).click();

    // Verificar cambios
    await expect(page.getByText('Transacción editada')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('200.00')).toBeVisible();
  });

  test('debe eliminar una transacción', async ({ page }) => {
    // Crear transacción
    await page.getByText('Transacciones').click();
    await page.getByRole('button', { name: /Nueva Transacción/i }).click();
    await page.getByLabel('Monto').fill('50.00');
    await page.getByLabel('Descripción').fill('Para eliminar');
    await page.getByLabel('Tipo').selectOption('expense');
    await page.getByLabel('Categoría').selectOption({ index: 1 });
    await page.getByLabel('Fecha').fill('2024-01-05');
    await page.getByRole('button', { name: /Guardar/i }).click();

    await expect(page.getByText('Para eliminar')).toBeVisible();

    // Eliminar
    await page
      .getByRole('button', { name: /Eliminar/i })
      .first()
      .click();

    // Confirmar eliminación (si hay modal de confirmación)
    await page.getByRole('button', { name: /Confirmar/i }).click();

    // Verificar que ya no está
    await expect(page.getByText('Para eliminar')).not.toBeVisible({
      timeout: 5000,
    });
  });

  test('debe filtrar transacciones por tipo', async ({ page }) => {
    // Crear transacciones de diferentes tipos
    await page.getByText('Transacciones').click();

    // Crear gasto
    await page.getByRole('button', { name: /Nueva Transacción/i }).click();
    await page.getByLabel('Monto').fill('100.00');
    await page.getByLabel('Descripción').fill('Gasto 1');
    await page.getByLabel('Tipo').selectOption('expense');
    await page.getByLabel('Categoría').selectOption({ index: 1 });
    await page.getByLabel('Fecha').fill('2024-01-15');
    await page.getByRole('button', { name: /Guardar/i }).click();

    // Crear ingreso
    await page.getByRole('button', { name: /Nueva Transacción/i }).click();
    await page.getByLabel('Monto').fill('500.00');
    await page.getByLabel('Descripción').fill('Ingreso 1');
    await page.getByLabel('Tipo').selectOption('income');
    await page.getByLabel('Categoría').selectOption({ index: 1 });
    await page.getByLabel('Fecha').fill('2024-01-16');
    await page.getByRole('button', { name: /Guardar/i }).click();

    // Filtrar por gastos
    await page.getByLabel('Filtrar por tipo').selectOption('expense');

    await expect(page.getByText('Gasto 1')).toBeVisible();
    await expect(page.getByText('Ingreso 1')).not.toBeVisible();

    // Filtrar por ingresos
    await page.getByLabel('Filtrar por tipo').selectOption('income');

    await expect(page.getByText('Ingreso 1')).toBeVisible();
    await expect(page.getByText('Gasto 1')).not.toBeVisible();
  });

  test('debe mostrar dashboard con resumen de transacciones', async ({
    page,
  }) => {
    // Crear algunas transacciones
    await page.getByText('Transacciones').click();

    // Crear gasto
    await page.getByRole('button', { name: /Nueva Transacción/i }).click();
    await page.getByLabel('Monto').fill('100.00');
    await page.getByLabel('Descripción').fill('Gasto test');
    await page.getByLabel('Tipo').selectOption('expense');
    await page.getByLabel('Categoría').selectOption({ index: 1 });
    await page.getByLabel('Fecha').fill('2024-01-15');
    await page.getByRole('button', { name: /Guardar/i }).click();

    // Volver al dashboard
    await page.getByText('Dashboard').click();
    await expect(page).toHaveURL(/.*dashboard/);

    // Verificar que se muestra información
    await expect(page.getByText(/Total/i)).toBeVisible();
  });
});
