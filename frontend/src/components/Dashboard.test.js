import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { dashboardService } from '../services/api';

jest.mock('../services/api');

const mockDashboardData = {
  balance: { totalIncome: 5000, totalExpense: 3500, currentBalance: 1500 },
  recentTransactions: [
    {
      id: 1,
      amount: 50,
      date: '2024-01-15',
      description: 'Supermercado',
      type: 'expense',
    },
  ],
  expensesByCategory: [{ name: 'Alimentación', total: 500 }],
  incomeByCategory: [{ name: 'Salario', total: 5000 }],
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    dashboardService.getSummary = jest
      .fn()
      .mockResolvedValue(mockDashboardData);
  });

  it('debe renderizar el dashboard', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    await waitFor(() => expect(dashboardService.getSummary).toHaveBeenCalled());
  });

  it('debe mostrar estado de carga', () => {
    dashboardService.getSummary.mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('debe cargar datos del dashboard', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(dashboardService.getSummary).toHaveBeenCalledTimes(1);
    });
  });

  it('debe manejar errores correctamente', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    dashboardService.getSummary.mockRejectedValue(new Error('Error'));
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    consoleError.mockRestore();
  });
});
