#!/bin/bash

# 🧪 Script de Instalación Completa de Testing - Financial Sec
# Este script instala todas las dependencias de testing automáticamente

set -e  # Detener en caso de error

echo "🚀 Iniciando instalación de entorno de testing..."
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "TESTING_GUIDE.md" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# 1. Instalar dependencias de testing del backend
print_step "Instalando dependencias de testing del backend..."
cd backend

if [ ! -d "node_modules" ]; then
    npm install
else
    npm install jest supertest @types/jest --save-dev
fi

print_success "Dependencias de backend instaladas"
cd ..

# 2. Instalar dependencias de testing del frontend
print_step "Instalando dependencias de testing del frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    npm install
else
    npm install @testing-library/react @testing-library/jest-dom @testing-library/user-event axios-mock-adapter --save-dev
fi

print_success "Dependencias de frontend instaladas"
cd ..

# 3. Preguntar si instalar E2E (opcional)
echo ""
read -p "¿Deseas instalar Playwright para tests E2E? (s/n): " install_e2e

if [ "$install_e2e" = "s" ] || [ "$install_e2e" = "S" ]; then
    print_step "Instalando Playwright para tests E2E..."
    cd e2e
    npm install
    
    print_warning "Se instalarán los navegadores de Playwright (puede tomar varios minutos)..."
    npx playwright install
    
    print_success "Playwright instalado correctamente"
    cd ..
else
    print_warning "Tests E2E omitidos. Puedes instalarlos más tarde con:"
    echo "  cd e2e && npm install && npx playwright install"
fi

echo ""
echo "🎉 ${GREEN}¡Instalación completada!${NC}"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1️⃣  Ejecutar tests del backend:"
echo "   ${BLUE}cd backend && npm test${NC}"
echo ""
echo "2️⃣  Ejecutar tests del frontend:"
echo "   ${BLUE}cd frontend && npm test${NC}"
echo ""

if [ "$install_e2e" = "s" ] || [ "$install_e2e" = "S" ]; then
    echo "3️⃣  Ejecutar tests E2E:"
    echo "   ${BLUE}cd e2e && npm run test:e2e${NC}"
    echo ""
fi

echo "📚 Para más información, lee: ${BLUE}TESTING_GUIDE.md${NC}"
echo ""
