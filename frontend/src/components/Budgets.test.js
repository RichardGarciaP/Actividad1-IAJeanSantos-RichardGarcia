import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Budgets from './Budgets';
import { budgetService, categoryService } from '../services/api';

jest.mock('../services/api');

const mockCategories = [{ id: 1, name: 'Alimentación', type: 'expense' }];

const mockBudgets = [
  {
    id: 1,
    amount: 500,
    month: 1,
    year: 2024,
    category_id: 1,
    category_name: 'Alimentación',
  },
];

const mockAnalysis = {
  budgets: [{ id: 1, amount: 500, spent: 200, remaining: 300, percentage: 40 }],
  summary: { totalBudget: 500, totalSpent: 200, totalRemaining: 300 },
};

describe('Budgets Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    categoryService.getAll = jest.fn().mockResolvedValue(mockCategories);
    budgetService.getAll = jest.fn().mockResolvedValue(mockBudgets);
    budgetService.getAnalysis = jest.fn().mockResolvedValue(mockAnalysis);
    budgetService.create = jest.fn();
    budgetService.delete = jest.fn();
  });

  it('debe renderizar el componente', async () => {
    render(
      <BrowserRouter>
        <Budgets />
      </BrowserRouter>
    );
    await waitFor(() => expect(budgetService.getAll).toHaveBeenCalled());
  });

  it('debe mostrar estado de carga', () => {
    budgetService.getAll.mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <Budgets />
      </BrowserRouter>
    );
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('debe cargar categorías y presupuestos', async () => {
    render(
      <BrowserRouter>
        <Budgets />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(categoryService.getAll).toHaveBeenCalled();
      expect(budgetService.getAll).toHaveBeenCalled();
    });
  });

  it('debe tener botón de nuevo presupuesto', async () => {
    render(
      <BrowserRouter>
        <Budgets />
      </BrowserRouter>
    );

    await waitFor(() => expect(budgetService.getAll).toHaveBeenCalled());

    const newButton = screen.getByRole('button', {
      name: /nuevo presupuesto/i,
    });
    expect(newButton).toBeInTheDocument();
  });

  it('debe manejar errores al cargar presupuestos', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    budgetService.getAll.mockRejectedValue(new Error('Error'));
    render(
      <BrowserRouter>
        <Budgets />
      </BrowserRouter>
    );
    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    consoleError.mockRestore();
  });
});
