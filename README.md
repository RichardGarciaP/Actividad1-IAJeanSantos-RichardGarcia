# Financial Sec - Sistema de Gestión Financiera Personal

Aplicación web moderna para la gestión de finanzas personales con seguimiento de transacciones, presupuestos y estadísticas detalladas.

## 🚀 Tecnologías Utilizadas

### Backend

- **Node.js** v14+
- **Express** 4.18.2 - Framework web
- **SQLite3** 5.1.6 - Base de datos
- **JWT** 9.0.2 - Autenticación
- **bcryptjs** 2.4.3 - Encriptación de contraseñas
- **CORS** - Manejo de peticiones cross-origin

### Frontend

- **React** 18.2.0 - Biblioteca UI
- **React Router DOM** 6.16.0 - Navegación
- **Axios** 1.5.0 - Cliente HTTP
- **Recharts** 2.8.0 - Gráficos
- **Lucide React** 0.284.0 - Iconos

## 📋 Requisitos Previos

- Node.js versión 14.0 o superior
- npm versión 6.0 o superior
- Puerto 5000 disponible para el backend
- Puerto 3000 disponible para el frontend

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto-psuia
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Configuración

### Backend

El archivo `.env` ya está configurado en `/backend/.env`:

```env
PORT=5000
JWT_SECRET=your-secret-key-here-change-in-production
```

### Base de Datos

La base de datos SQLite se inicializa automáticamente. Para crear la base de datos con datos de prueba:

```bash
cd backend
npm run init-db
```

Esto creará:

- 11 categorías predefinidas (ingresos y gastos)
- Usuario demo con credenciales de prueba

## 🚀 Ejecución

### Opción 1: Ejecutar Backend y Frontend por separado

#### Iniciar Backend

```bash
cd backend
npm start
```

El servidor backend estará disponible en: `http://localhost:5000`

#### Iniciar Frontend (en otra terminal)

```bash
cd frontend
npm start
```

La aplicación frontend estará disponible en: `http://localhost:3000`

### Opción 2: Script de pruebas completo

Desde la raíz del proyecto:

```bash
# Limpiar y reinicializar base de datos
cd backend
rm -f database/financialsec.db
node config/initDatabase.js

# Iniciar backend (en segundo plano)
node server.js &

# Iniciar frontend (en otra terminal)
cd ../frontend
npm start
```

## 👤 Credenciales de Prueba

**Email:** demo@financialsec.com  
**Contraseña:** Demo1234

## 📁 Estructura del Proyecto

```
proyecto-psuia/
├── backend/
│   ├── config/
│   │   ├── database.js          # Configuración SQLite
│   │   └── initDatabase.js      # Inicialización de datos
│   ├── controllers/
│   │   ├── authController.js    # Autenticación
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   ├── dashboardController.js
│   │   └── budgetController.js
│   ├── middleware/
│   │   └── auth.js              # Middleware JWT
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── budgetRoutes.js
│   ├── database/
│   │   └── financialsec.db      # Base de datos SQLite
│   ├── .env                     # Variables de entorno
│   ├── package.json
│   └── server.js                # Punto de entrada
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Transactions.js
│   │   │   ├── Budgets.js
│   │   │   ├── CategoryStats.js
│   │   │   ├── Sidebar.js
│   │   │   └── TopBar.js
│   │   ├── services/
│   │   │   └── api.js           # Servicios API
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── test-manual.sh               # Script de pruebas automatizado
└── README.md
```

## 🎯 Funcionalidades

### ✅ Autenticación

- Registro de usuarios
- Login con JWT
- Protección de rutas

### 💰 Gestión de Transacciones

- Crear, editar y eliminar transacciones
- Filtrar por fecha, tipo y categoría
- Visualización en tabla responsiva

### 📊 Dashboard

- Resumen financiero (balance, ingresos, gastos)
- Gráficos de gastos por categoría
- Últimas transacciones
- Tendencias mensuales

### 💳 Presupuestos

- Crear presupuestos mensuales por categoría
- Seguimiento del gasto vs presupuesto
- Alertas visuales (verde, amarillo, rojo)
- Análisis de cumplimiento

### 📈 Estadísticas

- Estadísticas detalladas por categoría
- Top 5 transacciones por categoría
- Visualización de patrones de gasto

### 🎨 Diseño

- Interfaz minimalista y moderna
- Sidebar de navegación
- Paleta de colores púrpura armoniosa
- Totalmente responsivo

## 🔌 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Transacciones

- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

### Categorías

- `GET /api/categories` - Listar categorías

### Dashboard

- `GET /api/dashboard/summary` - Resumen financiero

### Presupuestos

- `GET /api/budgets` - Listar presupuestos
- `GET /api/budgets/analysis` - Análisis de presupuestos
- `POST /api/budgets` - Crear/actualizar presupuesto
- `DELETE /api/budgets/:id` - Eliminar presupuesto

## 🧪 Pruebas

Para ejecutar el script de pruebas automatizado que agrega datos de ejemplo:

```bash
./test-manual.sh
```

Este script:

- Realiza login con el usuario demo
- Crea 16 transacciones de ejemplo
- Configura 6 presupuestos mensuales
- Verifica la consistencia de datos
- Muestra un resumen completo

## 🛠️ Comandos Útiles

### Backend

```bash
npm start              # Iniciar servidor
npm run init-db        # Inicializar base de datos
```

### Frontend

```bash
npm start              # Iniciar en modo desarrollo
npm run build          # Compilar para producción
```

## 🐛 Solución de Problemas

### Error: Puerto en uso

```bash
# Liberar puerto 5000
lsof -ti:5000 | xargs kill -9

# Liberar puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Error: Base de datos bloqueada

```bash
cd backend
rm -f database/financialsec.db
node config/initDatabase.js
```

### Error: Módulos no encontrados

```bash
# Reinstalar dependencias backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Reinstalar dependencias frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## 📝 Notas Importantes

- La base de datos SQLite se encuentra en `/backend/database/financialsec.db`
- Los tokens JWT expiran después de 24 horas
- Las contraseñas se encriptan con bcrypt (10 rounds)
- El servidor backend usa CORS para permitir peticiones del frontend

## 🔐 Seguridad

- ⚠️ Cambiar `JWT_SECRET` en producción
- ⚠️ No usar el usuario demo en producción
- ⚠️ Implementar HTTPS en producción
- ⚠️ Validar y sanitizar todas las entradas

## 📄 Licencia

Este proyecto es de uso educativo.

## 👥 Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ usando React y Node.js**
