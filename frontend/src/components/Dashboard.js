import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month');

  useEffect(() => {
    loadDashboard();
  }, [dateFilter]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const filters = getDateFilters();
      const data = await dashboardService.getSummary(filters);
      setSummary(data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateFilters = () => {
    const now = new Date();
    const filters = {};

    if (dateFilter === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filters.startDate = startOfMonth.toISOString().split('T')[0];
    } else if (dateFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      filters.startDate = startOfWeek.toISOString().split('T')[0];
    }

    return filters;
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
  ];

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (!summary) {
    return <div className="container">Error al cargar datos</div>;
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
        <h2>Dashboard Financiero</h2>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
          }}
        >
          <option value="all">Todo el tiempo</option>
          <option value="month">Este mes</option>
          <option value="week">Última semana</option>
        </select>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-3">
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <DollarSign size={48} />
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                Balance Actual
              </p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
                {formatCurrency(summary.balance.currentBalance)}
              </h2>
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TrendingUp size={48} />
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Ingresos</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
                {formatCurrency(summary.balance.totalIncome)}
              </h2>
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <TrendingDown size={48} />
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Gastos</p>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>
                {formatCurrency(summary.balance.totalExpense)}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-2" style={{ marginTop: '2rem' }}>
        {/* Gráfico de gastos por categoría */}
        <div className="card">
          <h3>Gastos por Categoría</h3>
          {summary.expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary.expensesByCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) =>
                    `${entry.name}: ${formatCurrency(entry.total)}`
                  }
                >
                  {summary.expensesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p
              style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}
            >
              No hay gastos registrados
            </p>
          )}
        </div>

        {/* Gráfico de comparación ingresos vs gastos */}
        <div className="card">
          <h3>Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Ingresos', value: summary.balance.totalIncome },
                { name: 'Gastos', value: summary.balance.totalExpense },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="value" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transacciones recientes */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>
          <Activity
            size={20}
            style={{ display: 'inline', marginRight: '0.5rem' }}
          />
          Transacciones Recientes
        </h3>
        {summary.recentTransactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {new Date(transaction.date).toLocaleDateString('es-MX')}
                    </td>
                    <td>{transaction.description}</td>
                    <td>
                      <span>
                        {transaction.category_icon} {transaction.category_name}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${transaction.type}`}>
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td
                      style={{
                        textAlign: 'right',
                        color:
                          transaction.type === 'income' ? '#10b981' : '#ef4444',
                        fontWeight: 'bold',
                      }}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            No hay transacciones registradas
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
