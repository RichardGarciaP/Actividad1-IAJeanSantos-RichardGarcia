import React from 'react';
import { render, screen } from '@testing-library/react';
import TopBar from './TopBar';
import { authService } from '../services/api';

jest.mock('../services/api');

describe('TopBar Component', () => {
  it('debe renderizar el componente', () => {
    authService.getCurrentUser.mockReturnValue({
      fullName: 'Test User',
      email: 'test@test.com',
    });

    render(<TopBar />);

    expect(screen.getByText(/test user/i)).toBeInTheDocument();
  });

  it('debe mostrar la fecha actual', () => {
    authService.getCurrentUser.mockReturnValue({
      fullName: 'Test User',
    });

    render(<TopBar />);

    const dateElement = document.querySelector('.topbar-date');
    expect(dateElement).toBeInTheDocument();
  });

  it('debe renderizar sin usuario', () => {
    authService.getCurrentUser.mockReturnValue(null);

    render(<TopBar />);

    const topbar = document.querySelector('.topbar');
    expect(topbar).toBeInTheDocument();
  });
});
