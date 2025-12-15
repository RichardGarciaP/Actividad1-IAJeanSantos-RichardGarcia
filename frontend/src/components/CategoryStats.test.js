import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CategoryStats from './CategoryStats';
import { categoryService, transactionService } from '../services/api';

jest.mock('../services/api');

const mockCategories = [
  { id: 1, name: 'Alimentación', type: 'expense' },
  { id: 2, name: 'Salario', type: 'income' },
];

const mockTransactions = [
  { id: 1, amount: 500, category_id: 1, type: 'expense' },
  { id: 2, amount: 5000, category_id: 2, type: 'income' },
];

describe('CategoryStats Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    categoryService.getAll = jest.fn().mockResolvedValue(mockCategories);
    transactionService.getAll = jest.fn().mockResolvedValue(mockTransactions);
  });

  it('debe renderizar el componente', async () => {
    render(
      <BrowserRouter>
        <CategoryStats />
      </BrowserRouter>
    );
    await waitFor(() => expect(categoryService.getAll).toHaveBeenCalled());
  });

  it('debe mostrar estado de carga', () => {
    categoryService.getAll.mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <CategoryStats />
      </BrowserRouter>
    );
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('debe manejar errores', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    categoryService.getAll.mockRejectedValue(new Error('Error'));
    render(
      <BrowserRouter>
        <CategoryStats />
      </BrowserRouter>
    );
    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    consoleError.mockRestore();
  });
});
