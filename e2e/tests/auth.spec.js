import { test, expect } from '@playwright/test';

test.describe('Financial Sec - Auth Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar la página de login', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();
    await expect(
      page.getByText('Bienvenido de nuevo a Financial Sec')
    ).toBeVisible();
  });

  test('debe registrar un nuevo usuario', async ({ page }) => {
    // Navegar a registro
    await page.goto('/register');
    await expect(page.getByText('Crear Cuenta')).toBeVisible();

    // Llenar formulario con email único
    const uniqueEmail = `test${Date.now()}@example.com`;
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Nombre completo').fill('Test User E2E');
    await page.getByLabel('Contraseña').fill('TestPassword123');

    // Enviar formulario
    await page.getByRole('button', { name: /Registrarse/i }).click();

    // Verificar redirección al dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('debe hacer login con usuario existente', async ({ page }) => {
    // Primero registrar un usuario
    await page.goto('/register');
    const uniqueEmail = `user${Date.now()}@example.com`;
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Nombre completo').fill('Login Test User');
    await page.getByLabel('Contraseña').fill('TestPassword123');
    await page.getByRole('button', { name: /Registrarse/i }).click();

    // Esperar a que se complete el registro
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    // Hacer logout
    await page.getByRole('button', { name: /Cerrar sesión/i }).click();
    await expect(page).toHaveURL(/.*login/);

    // Hacer login
    await page.getByLabel('Email').fill(uniqueEmail);
    await page.getByLabel('Contraseña').fill('TestPassword123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    // Verificar login exitoso
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Contraseña').fill('WrongPassword123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    // Verificar mensaje de error
    await expect(page.getByText(/Credenciales inválidas/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('debe validar formato de email en registro', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Nombre completo').fill('Test User');
    await page.getByLabel('Contraseña').fill('TestPassword123');
    await page.getByRole('button', { name: /Registrarse/i }).click();

    // El navegador mostrará validación HTML5
    const emailInput = page.getByLabel('Email');
    const validationMessage = await emailInput.evaluate(
      (el) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });
});
