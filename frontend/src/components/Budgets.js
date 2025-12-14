import React, { useState, useEffect } from 'react';
import { budgetService, categoryService } from '../services/api';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBudgets();
    loadAnalysis();
  }, [selectedMonth, selectedYear]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll('expense');
      setCategories(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getAll(selectedMonth, selectedYear);
      setBudgets(data);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async () => {
    try {
      const data = await budgetService.getAnalysis(selectedMonth, selectedYear);
      setAnalysis(data);
    } catch (error) {
      console.error('Error al cargar análisis:', error);
    }
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        categoryId: budget.category_id,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        categoryId: '',
        amount: '',
        month: selectedMonth,
        year: selectedYear,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetService.upsert(formData);
      handleCloseModal();
      loadBudgets();
      loadAnalysis();
    } catch (error) {
      alert('Error al guardar presupuesto');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      try {
        await budgetService.delete(id);
        loadBudgets();
        loadAnalysis();
      } catch (error) {
        alert('Error al eliminar presupuesto');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const getMonthName = (month) => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[month - 1];
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return '#10b981';
    if (percentage < 90) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIcon = (budget) => {
    if (budget.isOverBudget) {
      return <AlertTriangle size={20} color="#ef4444" />;
    } else if (budget.percentage > 90) {
      return <AlertTriangle size={20} color="#f59e0b" />;
    }
    return <CheckCircle size={20} color="#10b981" />;
  };

  if (loading) {
    return <div className="loading">Cargando presupuestos...</div>;
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
        <h2>
          <Target
            size={28}
            style={{ display: 'inline', marginRight: '0.5rem' }}
          />
          Gestión de Presupuestos
        </h2>
        <button onClick={() => handleOpenModal()} className="btn btn-success">
          <Plus size={20} />
          Nuevo Presupuesto
        </button>
      </div>

      {/* Selector de mes/año */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from(
                { length: 5 },
                (_, i) => currentDate.getFullYear() - 2 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen general */}
      {analysis && analysis.budgets.length > 0 && (
        <div className="grid grid-3">
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Target size={48} />
              <div>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  Presupuesto Total
                </p>
                <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                  {formatCurrency(analysis.summary.totalBudget)}
                </h2>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <TrendingUp size={48} />
              <div>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  Total Gastado
                </p>
                <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                  {formatCurrency(analysis.summary.totalSpent)}
                </h2>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              background:
                analysis.summary.totalRemaining >= 0
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {analysis.summary.totalRemaining >= 0 ? (
                <CheckCircle size={48} />
              ) : (
                <AlertTriangle size={48} />
              )}
              <div>
                <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  {analysis.summary.totalRemaining >= 0
                    ? 'Disponible'
                    : 'Excedido'}
                </p>
                <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0' }}>
                  {formatCurrency(Math.abs(analysis.summary.totalRemaining))}
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de presupuesto */}
      {analysis && analysis.budgets.length > 0 && (
        <div className="grid grid-2">
          <div className="card">
            <h3>Distribución de Presupuesto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysis.budgets}
                  dataKey="amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) =>
                    `${entry.category_name}: ${formatCurrency(entry.amount)}`
                  }
                >
                  {analysis.budgets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.category_color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>Gasto Real vs Presupuesto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Gastado', value: analysis.summary.totalSpent },
                    {
                      name: 'Disponible',
                      value: Math.max(0, analysis.summary.totalRemaining),
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) =>
                    `${entry.name}: ${formatCurrency(entry.value)}`
                  }
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Lista de presupuestos con progreso */}
      <div className="card">
        <h3>Presupuestos Detallados</h3>
        {analysis && analysis.budgets.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            {analysis.budgets.map((budget) => (
              <div
                key={budget.id}
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '1rem',
                  background: budget.isOverBudget ? '#fef2f2' : 'white',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {budget.category_icon}
                    </span>
                    <div>
                      <h4 style={{ margin: 0 }}>{budget.category_name}</h4>
                      <p
                        style={{
                          margin: '0.25rem 0',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                        }}
                      >
                        {formatCurrency(budget.spent)} de{' '}
                        {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                    }}
                  >
                    {getStatusIcon(budget)}
                    <button
                      onClick={() => handleOpenModal(budget)}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div
                  style={{
                    background: '#e5e7eb',
                    borderRadius: '8px',
                    height: '24px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      background: getProgressColor(budget.percentage),
                      width: `${Math.min(budget.percentage, 100)}%`,
                      height: '100%',
                      transition: 'width 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <span
                    style={{
                      color: budget.remaining >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold',
                    }}
                  >
                    {budget.remaining >= 0 ? 'Disponible: ' : 'Excedido: '}
                    {formatCurrency(Math.abs(budget.remaining))}
                  </span>
                  {budget.isOverBudget && (
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>
                      ⚠️ Sobre presupuesto
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            No hay presupuestos configurados para {getMonthName(selectedMonth)}{' '}
            {selectedYear}.
            <br />
            Haz clic en "Nuevo Presupuesto" para comenzar.
          </p>
        )}
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
            }}
          >
            <h3>
              {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  required
                  disabled={!!editingBudget}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Monto del Presupuesto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Mes</label>
                  <select
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        month: parseInt(e.target.value),
                      })
                    }
                    required
                    disabled={!!editingBudget}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label>Año</label>
                  <select
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                    required
                    disabled={!!editingBudget}
                  >
                    {Array.from(
                      { length: 5 },
                      (_, i) => currentDate.getFullYear() - 2 + i
                    ).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}
              >
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ flex: 1 }}
                >
                  {editingBudget ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
