import React, { useState, useEffect } from 'react';
import { transactionService, categoryService } from '../services/api';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const CategoryStats = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [stats, setStats] = useState({
    expensesByCategory: [],
    incomeByCategory: [],
    topExpenses: [],
    topIncomes: [],
  });

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = getDateFilters();
      const [transData, catData] = await Promise.all([
        transactionService.getAll(filters),
        categoryService.getAll(),
      ]);

      setTransactions(transData);
      setCategories(catData);
      calculateStats(transData, catData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateFilters = () => {
    const now = new Date();
    const filters = {};

    if (dateRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filters.startDate = startOfMonth.toISOString().split('T')[0];
    } else if (dateRange === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      filters.startDate = startOfWeek.toISOString().split('T')[0];
    } else if (dateRange === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filters.startDate = startOfYear.toISOString().split('T')[0];
    }

    return filters;
  };

  const calculateStats = (transData, catData) => {
    // Agrupar por categoría
    const categoryMap = {};

    transData.forEach((trans) => {
      if (!categoryMap[trans.category_id]) {
        categoryMap[trans.category_id] = {
          id: trans.category_id,
          name: trans.category_name,
          icon: trans.category_icon,
          color: trans.category_color,
          type: trans.type,
          total: 0,
          count: 0,
          transactions: [],
        };
      }
      categoryMap[trans.category_id].total += trans.amount;
      categoryMap[trans.category_id].count += 1;
      categoryMap[trans.category_id].transactions.push(trans);
    });

    const expensesByCategory = Object.values(categoryMap)
      .filter((cat) => cat.type === 'expense')
      .sort((a, b) => b.total - a.total);

    const incomeByCategory = Object.values(categoryMap)
      .filter((cat) => cat.type === 'income')
      .sort((a, b) => b.total - a.total);

    // Top 5 transacciones
    const topExpenses = transData
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const topIncomes = transData
      .filter((t) => t.type === 'income')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    setStats({
      expensesByCategory,
      incomeByCategory,
      topExpenses,
      topIncomes,
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const COLORS = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#ff6b6b',
    '#4ecdc4',
  ];

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h2>📊 Estadísticas por Categoría</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }}
        >
          <option value="all">Todo el tiempo</option>
          <option value="year">Este año</option>
          <option value="month">Este mes</option>
          <option value="week">Última semana</option>
        </select>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-2">
        <div className="card">
          <h3>
            <TrendingDown
              size={20}
              style={{
                display: 'inline',
                marginRight: '0.5rem',
                color: '#ef4444',
              }}
            />
            Gastos por Categoría
          </h3>
          {stats.expensesByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.expensesByCategory}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.icon} ${entry.name}`}
                  >
                    {stats.expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ marginTop: '1rem' }}>
                {stats.expensesByCategory.map((cat, index) => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <span>
                      {cat.icon} {cat.name} ({cat.count} transacciones)
                    </span>
                    <strong style={{ color: '#ef4444' }}>
                      {formatCurrency(cat.total)}
                    </strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p
              style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}
            >
              No hay gastos registrados
            </p>
          )}
        </div>

        <div className="card">
          <h3>
            <TrendingUp
              size={20}
              style={{
                display: 'inline',
                marginRight: '0.5rem',
                color: '#10b981',
              }}
            />
            Ingresos por Categoría
          </h3>
          {stats.incomeByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.incomeByCategory}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.icon} ${entry.name}`}
                  >
                    {stats.incomeByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ marginTop: '1rem' }}>
                {stats.incomeByCategory.map((cat, index) => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <span>
                      {cat.icon} {cat.name} ({cat.count} transacciones)
                    </span>
                    <strong style={{ color: '#10b981' }}>
                      {formatCurrency(cat.total)}
                    </strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p
              style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}
            >
              No hay ingresos registrados
            </p>
          )}
        </div>
      </div>

      {/* Comparación de categorías */}
      <div className="card">
        <h3>Comparación de Categorías de Gastos</h3>
        {stats.expensesByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.expensesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="total" fill="#667eea" name="Total Gastado" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            No hay datos para mostrar
          </p>
        )}
      </div>

      {/* Top transacciones */}
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ color: '#ef4444' }}>🔻 Top 5 Gastos Más Altos</h3>
          {stats.topExpenses.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {stats.topExpenses.map((trans, index) => (
                <div
                  key={trans.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: index === 0 ? '#fef2f2' : 'white',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
                    >
                      {trans.category_icon} {trans.description}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {trans.category_name} •{' '}
                      {new Date(trans.date).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#ef4444',
                    }}
                  >
                    {formatCurrency(trans.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}
            >
              No hay gastos registrados
            </p>
          )}
        </div>

        <div className="card">
          <h3 style={{ color: '#10b981' }}>🔺 Top 5 Ingresos Más Altos</h3>
          {stats.topIncomes.length > 0 ? (
            <div style={{ marginTop: '1rem' }}>
              {stats.topIncomes.map((trans, index) => (
                <div
                  key={trans.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: index === 0 ? '#f0fdf4' : 'white',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}
                    >
                      {trans.category_icon} {trans.description}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {trans.category_name} •{' '}
                      {new Date(trans.date).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                    }}
                  >
                    {formatCurrency(trans.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}
            >
              No hay ingresos registrados
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryStats;
