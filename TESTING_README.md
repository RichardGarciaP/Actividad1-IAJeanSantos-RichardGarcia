# 🧪 Quick Start - Testing Suite

## 🚀 Instalación Rápida

```bash
# Ejecutar script de instalación automática
./setup-testing.sh
```

Este script instalará todas las dependencias de testing para backend y frontend, y opcionalmente Playwright para E2E.

## ⚡ Ejecutar Tests

### Opción 1: Script Automatizado (Recomendado)

```bash
# Ejecutar TODOS los tests
./run-all-tests.sh
```

### Opción 2: Manual

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E (opcional)
cd e2e && npm run test:e2e
```

## 📊 Comandos Útiles

```bash
# Backend con cobertura
cd backend && npm test -- --coverage

# Frontend modo watch
cd frontend && npm run test:watch

# E2E con UI
cd e2e && npm run test:e2e:ui
```

## 📚 Documentación Completa

Para guía detallada, ver: **[TESTING_GUIDE.md](TESTING_GUIDE.md)**

## 🎯 Tests Disponibles

### Backend (Jest + Supertest)

- ✅ 10+ tests unitarios (middleware auth)
- ✅ 44+ tests de integración (API endpoints)
- ✅ BD SQLite en memoria
- ✅ Cobertura > 70%

### Frontend (Jest + React Testing Library)

- ✅ Tests de componentes React
- ✅ Tests de servicios API
- ✅ Mocking de axios
- ✅ Cobertura > 60%

### E2E (Playwright) - Opcional

- ✅ Flujos de autenticación
- ✅ Flujos de transacciones
- ✅ Cross-browser (Chrome, Firefox, Safari)

## 🔧 Estructura de Testing

```
proyecto-psuia/
├── backend/tests/          # Tests backend
│   ├── unit/              # Tests unitarios
│   ├── integration/       # Tests de integración
│   └── helpers/           # Utilidades
├── frontend/src/
│   ├── components/*.test.js
│   └── services/*.test.js
└── e2e/tests/             # Tests E2E
```

## ✅ Verificación Rápida

```bash
# Ver si tests pasan
./run-all-tests.sh

# Si falla, verificar:
cd backend && npm test     # Debe pasar
cd frontend && npm test    # Debe pasar
```

## 🐛 Troubleshooting

**Error: `Cannot find module`**

```bash
cd backend && npm install
cd frontend && npm install
```

**Tests E2E fallan**

```bash
# Instalar navegadores
cd e2e && npx playwright install

# Verificar servicios corriendo
cd backend && npm start  # Puerto 5000
cd frontend && npm start # Puerto 3000
```

## 📞 Soporte

Para más detalles y troubleshooting completo, consulta [TESTING_GUIDE.md](TESTING_GUIDE.md)
