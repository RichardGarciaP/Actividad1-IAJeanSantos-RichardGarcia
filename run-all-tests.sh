#!/bin/bash

# 🧪 Script para ejecutar TODOS los tests del proyecto Financial Sec

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variables para tracking
BACKEND_PASSED=false
FRONTEND_PASSED=false
E2E_PASSED=false

echo "🧪 =========================================="
echo "   EJECUTANDO SUITE COMPLETA DE TESTS"
echo "   Proyecto: Financial Sec"
echo "=========================================="
echo ""

# 1. Tests Backend
echo -e "${BLUE}1️⃣  BACKEND TESTS${NC}"
echo "-------------------------------------------"
cd backend

if npm test; then
    echo -e "${GREEN}✅ Backend tests PASSED${NC}"
    BACKEND_PASSED=true
else
    echo -e "${RED}❌ Backend tests FAILED${NC}"
    BACKEND_PASSED=false
fi

cd ..
echo ""

# 2. Tests Frontend
echo -e "${BLUE}2️⃣  FRONTEND TESTS${NC}"
echo "-------------------------------------------"
cd frontend

if npm test -- --watchAll=false; then
    echo -e "${GREEN}✅ Frontend tests PASSED${NC}"
    FRONTEND_PASSED=true
else
    echo -e "${RED}❌ Frontend tests FAILED${NC}"
    FRONTEND_PASSED=false
fi

cd ..
echo ""

# 3. Tests E2E (opcional)
if [ -d "e2e/node_modules" ]; then
    echo -e "${BLUE}3️⃣  E2E TESTS${NC}"
    echo "-------------------------------------------"
    
    # Verificar si backend y frontend están corriendo
    if ! curl -s http://localhost:5000/api > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Backend no está corriendo en http://localhost:5000${NC}"
        echo -e "${YELLOW}   Inicia el backend con: cd backend && npm start${NC}"
        E2E_PASSED="skipped"
    elif ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Frontend no está corriendo en http://localhost:3000${NC}"
        echo -e "${YELLOW}   Inicia el frontend con: cd frontend && npm start${NC}"
        E2E_PASSED="skipped"
    else
        cd e2e
        if npm run test:e2e; then
            echo -e "${GREEN}✅ E2E tests PASSED${NC}"
            E2E_PASSED=true
        else
            echo -e "${RED}❌ E2E tests FAILED${NC}"
            E2E_PASSED=false
        fi
        cd ..
    fi
else
    echo -e "${YELLOW}⚠️  E2E tests no instalados (opcional)${NC}"
    E2E_PASSED="not_installed"
fi

echo ""
echo "=========================================="
echo "   RESUMEN DE RESULTADOS"
echo "=========================================="
echo ""

# Mostrar resumen
if [ "$BACKEND_PASSED" = true ]; then
    echo -e "Backend:   ${GREEN}✅ PASSED${NC}"
else
    echo -e "Backend:   ${RED}❌ FAILED${NC}"
fi

if [ "$FRONTEND_PASSED" = true ]; then
    echo -e "Frontend:  ${GREEN}✅ PASSED${NC}"
else
    echo -e "Frontend:  ${RED}❌ FAILED${NC}"
fi

if [ "$E2E_PASSED" = true ]; then
    echo -e "E2E:       ${GREEN}✅ PASSED${NC}"
elif [ "$E2E_PASSED" = "skipped" ]; then
    echo -e "E2E:       ${YELLOW}⏭️  SKIPPED (servicios no corriendo)${NC}"
elif [ "$E2E_PASSED" = "not_installed" ]; then
    echo -e "E2E:       ${YELLOW}⏭️  NOT INSTALLED${NC}"
else
    echo -e "E2E:       ${RED}❌ FAILED${NC}"
fi

echo ""
echo "=========================================="

# Determinar resultado final
if [ "$BACKEND_PASSED" = true ] && [ "$FRONTEND_PASSED" = true ]; then
    echo -e "${GREEN}✅ TODOS LOS TESTS CRÍTICOS PASARON${NC}"
    exit 0
else
    echo -e "${RED}❌ ALGUNOS TESTS FALLARON${NC}"
    exit 1
fi
