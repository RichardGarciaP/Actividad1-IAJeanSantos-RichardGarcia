import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Transactions from './Transactions';
import { transactionService, categoryService } from '../services/api';

jest.mock('../services/api');

const mockCategories = [
  { id: 1, name: 'Alimentación', type: 'expense' },
];

const mockTransactions = [
  {
    id: 1,
    amount: 50.0,
    date: '2024-01-15',
    description: 'Supermercado',
    type: 'expense',
    category_name: 'Alimentación',
  },
];

describe('Transactions Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    categoryService.getAll.mockResolvedValue(mockCategories);
    transactionService.getAll.mockResolvedValue(mockTransactions);
  });

  it('debe renderizar el componente', async () => {
    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(transactionService.getAll).toHaveBeenCalled();
    });
  });

  it('debe cargar transacciones', async () => {
    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Supermercado')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje cuando no hay transacciones', async () => {
    transactionService.getAll.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no hay transacciones/i)).toBeInTheDocument();
    });
  });

  it('debe manejar errores', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    transactionService.getAll.mockRejectedValue(new Error('Error'));

    render(
      <BrowserRouter>
        <Transactions />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
