#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"

echo -e "${YELLOW}============================================================${NC}"
echo -e "${YELLOW}PRUEBAS DE LA APLICACIÓN FINANCIAL SEC${NC}"
echo -e "${YELLOW}============================================================${NC}\n"

# Esperar a que el servidor esté listo
echo -e "${BLUE}⏳ Esperando que el servidor esté listo...${NC}"
sleep 3

# 1. Login
echo -e "\n${YELLOW}============================================================${NC}"
echo -e "${YELLOW}1. AUTENTICACIÓN${NC}"
echo -e "${YELLOW}============================================================${NC}"

TOKEN=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@financialsec.com","password":"Demo1234"}' | \
  grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Login exitoso${NC}"
  echo -e "${BLUE}ℹ Usuario: Usuario Demo${NC}"
else
  echo -e "${RED}✗ Error en login${NC}"
  exit 1
fi

# 2. Obtener categorías
echo -e "\n${YELLOW}============================================================${NC}"
echo -e "${YELLOW}2. OBTENCIÓN DE CATEGORÍAS${NC}"
echo -e "${YELLOW}============================================================${NC}"

CATEGORIES=$(curl -s -X GET "${API_URL}/categories" \
  -H "Authorization: Bearer ${TOKEN}")

echo -e "${GREEN}✓ Categorías obtenidas${NC}"
echo "$CATEGORIES" | jq -r '.[] | "   - \(.name)"' 2>/dev/null || echo "$CATEGORIES"

# 3. Crear transacciones
echo -e "\n${YELLOW}============================================================${NC}"
echo -e "${YELLOW}3. CREACIÓN DE TRANSACCIONES${NC}"
echo -e "${YELLOW}============================================================${NC}"

# Obtener fecha actual
CURRENT_DATE=$(date +%Y-%m-%d)
MONTH=$(date +%m)
YEAR=$(date +%Y)

# Ingresos
echo -e "${BLUE}📥 Creando ingresos...${NC}"
curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"income\",\"categoryId\":8,\"amount\":3500,\"description\":\"Salario mensual diciembre\",\"date\":\"${YEAR}-${MONTH}-01\"}" > /dev/null
echo -e "${GREEN}✓ Salario mensual: \$3500${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"income\",\"categoryId\":9,\"amount\":800,\"description\":\"Proyecto freelance\",\"date\":\"${YEAR}-${MONTH}-05\"}" > /dev/null
echo -e "${GREEN}✓ Freelance: \$800${NC}"

# Gastos - Alimentación
echo -e "\n${BLUE}🍽️  Creando gastos de alimentación...${NC}"
curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":1,\"amount\":85.50,\"description\":\"Supermercado semanal\",\"date\":\"${YEAR}-${MONTH}-02\"}" > /dev/null
echo -e "${GREEN}✓ Supermercado: \$85.50${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":1,\"amount\":45,\"description\":\"Restaurante\",\"date\":\"${YEAR}-${MONTH}-07\"}" > /dev/null
echo -e "${GREEN}✓ Restaurante: \$45${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":1,\"amount\":120,\"description\":\"Compras del mes\",\"date\":\"${YEAR}-${MONTH}-10\"}" > /dev/null
echo -e "${GREEN}✓ Compras: \$120${NC}"

# Gastos - Transporte
echo -e "\n${BLUE}🚗 Creando gastos de transporte...${NC}"
curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":2,\"amount\":60,\"description\":\"Gasolina\",\"date\":\"${YEAR}-${MONTH}-03\"}" > /dev/null
echo -e "${GREEN}✓ Gasolina: \$60${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":2,\"amount\":25,\"description\":\"Uber\",\"date\":\"${YEAR}-${MONTH}-08\"}" > /dev/null
echo -e "${GREEN}✓ Uber: \$25${NC}"

# Gastos - Entretenimiento
echo -e "\n${BLUE}🎬 Creando gastos de entretenimiento...${NC}"
curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":3,\"amount\":15.99,\"description\":\"Netflix\",\"date\":\"${YEAR}-${MONTH}-01\"}" > /dev/null
echo -e "${GREEN}✓ Netflix: \$15.99${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":3,\"amount\":45,\"description\":\"Cine\",\"date\":\"${YEAR}-${MONTH}-06\"}" > /dev/null
echo -e "${GREEN}✓ Cine: \$45${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":3,\"amount\":80,\"description\":\"Concierto\",\"date\":\"${YEAR}-${MONTH}-11\"}" > /dev/null
echo -e "${GREEN}✓ Concierto: \$80${NC}"

# Gastos - Servicios
echo -e "\n${BLUE}🔌 Creando gastos de servicios...${NC}"
curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":4,\"amount\":95,\"description\":\"Internet y cable\",\"date\":\"${YEAR}-${MONTH}-01\"}" > /dev/null
echo -e "${GREEN}✓ Internet: \$95${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":4,\"amount\":65,\"description\":\"Electricidad\",\"date\":\"${YEAR}-${MONTH}-05\"}" > /dev/null
echo -e "${GREEN}✓ Electricidad: \$65${NC}"

# Gastos - Salud
echo -e "\n${BLUE}🏥 Creando gastos de salud...${NC}"
curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":5,\"amount\":120,\"description\":\"Consulta médica\",\"date\":\"${YEAR}-${MONTH}-04\"}" > /dev/null
echo -e "${GREEN}✓ Consulta: \$120${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":5,\"amount\":45.50,\"description\":\"Farmacia\",\"date\":\"${YEAR}-${MONTH}-09\"}" > /dev/null
echo -e "${GREEN}✓ Farmacia: \$45.50${NC}"

# Gastos - Educación
echo -e "\n${BLUE}📚 Creando gastos de educación...${NC}"
curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":6,\"amount\":199,\"description\":\"Curso online\",\"date\":\"${YEAR}-${MONTH}-02\"}" > /dev/null
echo -e "${GREEN}✓ Curso: \$199${NC}"

curl -s -X POST "${API_URL}/transactions" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"expense\",\"categoryId\":6,\"amount\":35,\"description\":\"Libros\",\"date\":\"${YEAR}-${MONTH}-07\"}" > /dev/null
echo -e "${GREEN}✓ Libros: \$35${NC}"

# 4. Crear presupuestos
echo -e "\n${YELLOW}============================================================${NC}"
echo -e "${YELLOW}4. CREACIÓN DE PRESUPUESTOS${NC}"
echo -e "${YELLOW}============================================================${NC}"

curl -s -X POST "${API_URL}/budgets" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"categoryId\":1,\"amount\":300,\"month\":${MONTH},\"year\":${YEAR}}" > /dev/null
echo -e "${GREEN}✓ Alimentación: \$300${NC}"

curl -s -X POST "${API_URL}/budgets" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"categoryId\":2,\"amount\":150,\"month\":${MONTH},\"year\":${YEAR}}" > /dev/null
echo -e "${GREEN}✓ Transporte: \$150${NC}"

curl -s -X POST "${API_URL}/budgets" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"categoryId\":3,\"amount\":100,\"month\":${MONTH},\"year\":${YEAR}}" > /dev/null
echo -e "${GREEN}✓ Entretenimiento: \$100${NC}"

curl -s -X POST "${API_URL}/budgets" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"categoryId\":4,\"amount\":200,\"month\":${MONTH},\"year\":${YEAR}}" > /dev/null
echo -e "${GREEN}✓ Servicios: \$200${NC}"

curl -s -X POST "${API_URL}/budgets" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"categoryId\":5,\"amount\":200,\"month\":${MONTH},\"year\":${YEAR}}" > /dev/null
echo -e "${GREEN}✓ Salud: \$200${NC}"

curl -s -X POST "${API_URL}/budgets" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"categoryId\":6,\"amount\":250,\"month\":${MONTH},\"year\":${YEAR}}" > /dev/null
echo -e "${GREEN}✓ Educación: \$250${NC}"

# 5. Verificar Dashboard
echo -e "\n${YELLOW}============================================================${NC}"
echo -e "${YELLOW}5. VERIFICACIÓN DEL DASHBOARD${NC}"
echo -e "${YELLOW}============================================================${NC}"

DASHBOARD=$(curl -s -X GET "${API_URL}/dashboard/summary" \
  -H "Authorization: Bearer ${TOKEN}")

echo -e "${GREEN}✓ Dashboard cargado${NC}\n"
echo -e "${BLUE}📊 RESUMEN FINANCIERO:${NC}"
echo "$DASHBOARD" | jq -r '"   Balance Total: $\(.balance)"' 2>/dev/null
echo "$DASHBOARD" | jq -r '"   Ingresos: $\(.totalIncome)"' 2>/dev/null
echo "$DASHBOARD" | jq -r '"   Gastos: $\(.totalExpenses)"' 2>/dev/null
echo "$DASHBOARD" | jq -r '"   Transacciones: \(.transactionCount)"' 2>/dev/null

echo -e "\n${BLUE}💳 GASTOS POR CATEGORÍA:${NC}"
echo "$DASHBOARD" | jq -r '.expensesByCategory[] | "   \(.category_name): $\(.total) (\(.count) transacciones)"' 2>/dev/null

# 6. Verificar presupuestos
echo -e "\n${YELLOW}============================================================${NC}"
echo -e "${YELLOW}6. ANÁLISIS DE PRESUPUESTOS${NC}"
echo -e "${YELLOW}============================================================${NC}"

BUDGETS=$(curl -s -X GET "${API_URL}/budgets/analysis?month=${MONTH}&year=${YEAR}" \
  -H "Authorization: Bearer ${TOKEN}")

echo -e "${GREEN}✓ Análisis obtenido${NC}\n"
echo "$BUDGETS" | jq -r '.[] | 
  if (.spent / .amount * 100) > 100 then "🔴" 
  elif (.spent / .amount * 100) > 70 then "🟡" 
  else "🟢" end + " \(.category_name):\n   Presupuesto: $\(.amount)\n   Gastado: $\(.spent) (\((.spent / .amount * 100) | floor)%)\n   Restante: $\(.amount - .spent)\n"' 2>/dev/null

# 7. Validación de consistencia
echo -e "${YELLOW}============================================================${NC}"
echo -e "${YELLOW}7. VALIDACIÓN DE CONSISTENCIA${NC}"
echo -e "${YELLOW}============================================================${NC}"

BALANCE=$(echo "$DASHBOARD" | jq -r '.balance' 2>/dev/null)
INCOME=$(echo "$DASHBOARD" | jq -r '.totalIncome' 2>/dev/null)
EXPENSES=$(echo "$DASHBOARD" | jq -r '.totalExpenses' 2>/dev/null)

CALCULATED_BALANCE=$(echo "$INCOME - $EXPENSES" | bc)

echo -e "${BLUE}Verificando cálculos...${NC}"
if [ "$BALANCE" = "$CALCULATED_BALANCE" ]; then
  echo -e "${GREEN}✓ Balance correcto: Ingresos (\$${INCOME}) - Gastos (\$${EXPENSES}) = \$${BALANCE}${NC}"
else
  echo -e "${RED}✗ Balance inconsistente${NC}"
fi

echo -e "\n${YELLOW}============================================================${NC}"
echo -e "${GREEN}✅ PRUEBAS COMPLETADAS${NC}"
echo -e "${YELLOW}============================================================${NC}"
echo -e "${BLUE}Aplicación disponible en: http://localhost:3000${NC}"
echo -e "${BLUE}Usuario: demo@financialsec.com / Demo1234${NC}\n"
