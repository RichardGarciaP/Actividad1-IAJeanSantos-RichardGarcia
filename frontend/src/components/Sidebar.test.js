import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../services/api';

jest.mock('../services/api');

describe('Sidebar Component', () => {
  beforeEach(() => {
    authService.getCurrentUser.mockReturnValue({ fullName: 'Test User' });
  });

  it('debe renderizar el componente', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('Financial Sec')).toBeInTheDocument();
    expect(screen.getByText('Gestión Financiera')).toBeInTheDocument();
  });

  it('debe mostrar todos los items del menú', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transacciones')).toBeInTheDocument();
    expect(screen.getByText('Presupuestos')).toBeInTheDocument();
    expect(screen.getByText('Estadísticas')).toBeInTheDocument();
  });

  it('debe tener enlaces correctos', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const transactionsLink = screen.getByText('Transacciones').closest('a');

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(transactionsLink).toHaveAttribute('href', '/transactions');
  });
});
