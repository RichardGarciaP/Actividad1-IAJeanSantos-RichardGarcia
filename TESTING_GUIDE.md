# 🧪 Guía Completa de Testing - Financial Sec

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Tests Backend](#tests-backend)
5. [Tests Frontend](#tests-frontend)
6. [Tests E2E](#tests-e2e)
7. [Comandos Principales](#comandos-principales)
8. [Cobertura de Código](#cobertura-de-código)
9. [CI/CD Integration](#cicd-integration)

---

## 🎯 Introducción

Este proyecto cuenta con una suite completa de tests automatizados:

- ✅ **Tests Unitarios Backend**: Middleware, validaciones
- ✅ **Tests de Integración Backend**: Endpoints API completos
- ✅ **Tests Unitarios Frontend**: Componentes React y servicios
- ✅ **Tests E2E (Opcional)**: Flujos completos de usuario con Playwright

**Stack de Testing:**

- Backend: Jest + Supertest + SQLite en memoria
- Frontend: Jest + React Testing Library + Axios Mock Adapter
- E2E: Playwright

---

## 📁 Estructura del Proyecto

```
proyecto-psuia/
├── backend/
│   ├── tests/
│   │   ├── unit/                          # Tests unitarios
│   │   │   └── auth.middleware.test.js
│   │   ├── integration/                   # Tests de integración
│   │   │   ├── auth.routes.test.js
│   │   │   ├── transaction.routes.test.js
│   │   │   └── budget.routes.test.js
│   │   └── helpers/                       # Utilidades de testing
│   │       ├── testDatabase.js
│   │       └── testHelpers.js
│   └── package.json                       # Configuración Jest
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Login.test.js              # Tests de componentes
│   │   ├── services/
│   │   │   └── api.test.js                # Tests de servicios
│   │   └── setupTests.js                  # Configuración global
│   └── package.json                       # Configuración Jest
│
└── e2e/
    ├── tests/
    │   ├── auth.spec.js                   # Tests E2E autenticación
    │   └── transactions.spec.js           # Tests E2E transacciones
    ├── playwright.config.js
    └── package.json
```

---

## ⚙️ Configuración del Entorno

### 1️⃣ Instalar Dependencias Backend

```bash
cd backend
npm install
```

**Dependencias de testing instaladas:**

- `jest`: Framework de testing
- `supertest`: Testing de APIs HTTP
- `@types/jest`: Tipos TypeScript para Jest

### 2️⃣ Instalar Dependencias Frontend

```bash
cd ../frontend
npm install
```

**Dependencias de testing instaladas:**

- `@testing-library/react`: Testing de componentes React
- `@testing-library/jest-dom`: Matchers personalizados
- `@testing-library/user-event`: Simulación de eventos de usuario
- `axios-mock-adapter`: Mock de peticiones HTTP

### 3️⃣ Instalar Playwright (E2E - Opcional)

```bash
cd ../e2e
npm install
npx playwright install
```

Esto instalará los navegadores necesarios (Chromium, Firefox, WebKit).

---

## 🔧 Tests Backend

### Ubicación de Tests

- **Unit tests**: `backend/tests/unit/`
- **Integration tests**: `backend/tests/integration/`
- **Helpers**: `backend/tests/helpers/`

### Cobertura de Tests Backend

#### Tests Unitarios

- ✅ **Middleware de autenticación** (`auth.middleware.test.js`)
  - Validación de tokens JWT
  - Manejo de errores de autenticación
  - Extracción de userId

#### Tests de Integración

- ✅ **Rutas de autenticación** (`auth.routes.test.js`)

  - Registro de usuario
  - Login
  - Obtención de perfil
  - Validaciones de entrada

- ✅ **Rutas de transacciones** (`transaction.routes.test.js`)

  - Listado de transacciones
  - Creación de transacciones
  - Actualización de transacciones
  - Eliminación de transacciones
  - Validaciones de datos

- ✅ **Rutas de presupuestos** (`budget.routes.test.js`)
  - Listado de presupuestos
  - Creación/actualización de presupuestos
  - Eliminación de presupuestos
  - Análisis de presupuesto

### Comandos Backend

```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration

# Ver cobertura de código
npm test -- --coverage
```

### Ejemplo de Salida

```
PASS  tests/unit/auth.middleware.test.js
PASS  tests/integration/auth.routes.test.js
PASS  tests/integration/transaction.routes.test.js
PASS  tests/integration/budget.routes.test.js

Test Suites: 4 passed, 4 total
Tests:       54 passed, 54 total
Snapshots:   0 total
Time:        5.234 s

Coverage:
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.2  |   78.5   |   82.1  |   86.3  |
 controllers/       |   88.4  |   82.3   |   85.7  |   89.1  |
 middleware/        |   100   |   100    |   100   |   100   |
 routes/            |   92.1  |   88.9   |   90.5  |   93.2  |
--------------------|---------|----------|---------|---------|
```

---

## ⚛️ Tests Frontend

### Ubicación de Tests

- Tests junto a componentes: `frontend/src/components/*.test.js`
- Tests de servicios: `frontend/src/services/*.test.js`
- Setup global: `frontend/src/setupTests.js`

### Cobertura de Tests Frontend

- ✅ **Componente Login** (`Login.test.js`)

  - Renderizado del formulario
  - Actualización de campos
  - Validación de errores
  - Login exitoso y redirección
  - Estados de loading

- ✅ **Servicios API** (`api.test.js`)
  - authService: register, login, logout, getProfile
  - transactionService: getAll, create, update, delete
  - budgetService: getAll, create, getAnalysis
  - Manejo de errores HTTP

### Comandos Frontend

```bash
cd frontend

# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch (interactivo)
npm run test:watch

# Ejecutar test específico
npm test -- Login.test.js
```

### Ejemplo de Test Frontend

```javascript
test('debe hacer login exitosamente', async () => {
  render(<Login />);

  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(screen.getByLabelText('Contraseña'), {
    target: { value: 'TestPass123' },
  });

  fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
```

---

## 🎭 Tests E2E (End-to-End)

### ¿Cuándo usar E2E?

Los tests E2E son **opcionales** pero recomendados para:

- Validar flujos críticos de usuario
- Testing de regresión visual
- Validación cross-browser
- Tests de aceptación

### Ubicación de Tests E2E

- Tests E2E: `e2e/tests/*.spec.js`
- Configuración: `e2e/playwright.config.js`

### Cobertura de Tests E2E

- ✅ **Flujo de autenticación** (`auth.spec.js`)

  - Página de login
  - Registro de usuario
  - Login con usuario existente
  - Validación de errores
  - Logout

- ✅ **Flujo de transacciones** (`transactions.spec.js`)
  - Navegación a transacciones
  - Creación de gastos e ingresos
  - Edición de transacciones
  - Eliminación de transacciones
  - Filtros

### Comandos E2E

```bash
cd e2e

# Instalar navegadores (solo primera vez)
npm run playwright:install

# Ejecutar tests E2E (headless)
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ejecutar viendo el navegador
npm run test:e2e:headed

# Debug de tests
npm run test:e2e:debug
```

### Requisitos Previos para E2E

Antes de ejecutar tests E2E, asegúrate de:

1. **Backend corriendo** en `http://localhost:5000`

   ```bash
   cd backend
   npm start
   ```

2. **Frontend corriendo** en `http://localhost:3000`

   ```bash
   cd frontend
   npm start
   ```

   O dejar que Playwright lo inicie automáticamente (configurado en `playwright.config.js`)

### Ejemplo de Test E2E

```javascript
test('debe crear una transacción', async ({ page }) => {
  await page.goto('/transactions');
  await page.getByRole('button', { name: /Nueva Transacción/i }).click();

  await page.getByLabel('Monto').fill('150.50');
  await page.getByLabel('Descripción').fill('Compra de supermercado');
  await page.getByLabel('Tipo').selectOption('expense');

  await page.getByRole('button', { name: /Guardar/i }).click();

  await expect(page.getByText('Compra de supermercado')).toBeVisible();
});
```

---

## 🚀 Comandos Principales

### Flujo Completo de Testing

```bash
# 1. Tests Backend
cd backend
npm test

# 2. Tests Frontend
cd ../frontend
npm test

# 3. Tests E2E (opcional)
cd ../e2e
npm run test:e2e
```

### Tests Rápidos (Sin Coverage)

```bash
# Backend
cd backend
npm test -- --coverage=false

# Frontend
cd frontend
npm test -- --watchAll=false --coverage=false
```

### CI/CD Simulation

```bash
# Simular pipeline completo
cd backend && npm test && \
cd ../frontend && npm test -- --watchAll=false && \
echo "✅ Todos los tests pasaron"
```

---

## 📊 Cobertura de Código

### Configuración de Cobertura

#### Backend (`backend/package.json`)

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "collectCoverageFrom": [
      "controllers/**/*.js",
      "middleware/**/*.js",
      "routes/**/*.js",
      "!**/node_modules/**"
    ]
  }
}
```

#### Frontend (`frontend/package.json`)

```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 60,
        "functions": 60,
        "lines": 60,
        "statements": 60
      }
    },
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/**/*.test.{js,jsx}"
    ]
  }
}
```

### Ver Reporte de Cobertura

```bash
# Backend
cd backend
npm test -- --coverage
# Reporte HTML: backend/coverage/lcov-report/index.html

# Frontend
cd frontend
npm run test:coverage
# Reporte HTML: frontend/coverage/lcov-report/index.html
```

Abre los archivos HTML en tu navegador para ver reportes detallados.

---

## 🔄 CI/CD Integration

### GitHub Actions

Crea `.github/workflows/test.yml`:

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test -- --watchAll=false

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
          cd ../e2e && npm install
      - name: Install Playwright
        run: cd e2e && npx playwright install --with-deps
      - name: Start backend
        run: cd backend && npm start &
      - name: Run E2E tests
        run: cd e2e && npm run test:e2e
```

---

## 📝 Mejores Prácticas

### 1. Escribir Tests

- ✅ **Usa nombres descriptivos**: `debe crear transacción con datos válidos`
- ✅ **Sigue AAA pattern**: Arrange, Act, Assert
- ✅ **Un concepto por test**: No pruebes múltiples cosas en un test
- ✅ **Tests independientes**: No dependas del orden de ejecución

### 2. Mocking

- ✅ **Mock dependencias externas**: APIs, BD, servicios
- ✅ **Usa BD en memoria para tests**: SQLite `:memory:`
- ✅ **Limpia mocks**: `beforeEach` y `afterEach`

### 3. Cobertura

- ✅ **No persigas 100%**: 70-80% es bueno
- ✅ **Enfócate en lógica crítica**: Auth, transacciones, presupuestos
- ✅ **Ignora código trivial**: Getters/setters simples

### 4. E2E

- ✅ **Solo flujos críticos**: No todo necesita E2E
- ✅ **Usa selectores estables**: `data-testid`, roles, labels
- ✅ **Tests rápidos**: Minimiza navegación innecesaria

---

## 🐛 Troubleshooting

### Error: `Cannot find module`

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Error: Tests de E2E fallan

1. Verifica que backend y frontend estén corriendo
2. Instala navegadores: `cd e2e && npx playwright install`
3. Revisa puertos en `playwright.config.js`

### Error: `JWT_SECRET is not defined`

Crea archivo `.env` en backend:

```env
JWT_SECRET=test-secret-key
PORT=5000
```

### Coverage bajo

Revisa archivos no cubiertos:

```bash
npm test -- --coverage --verbose
```

---

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest GitHub](https://github.com/ladjs/supertest)

---

## ✅ Checklist de Testing

- [ ] Tests backend pasan: `cd backend && npm test`
- [ ] Tests frontend pasan: `cd frontend && npm test`
- [ ] Cobertura backend > 70%
- [ ] Cobertura frontend > 60%
- [ ] Tests E2E críticos pasan (opcional)
- [ ] CI/CD configurado
- [ ] Documentación actualizada

---

**¡Todo listo para ejecutar tests automatizados! 🎉**

Para cualquier duda, revisa los archivos de test como ejemplos o consulta la documentación de las herramientas.
