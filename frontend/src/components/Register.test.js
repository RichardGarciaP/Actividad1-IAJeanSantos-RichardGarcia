import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { authService } from '../services/api';

jest.mock('../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.register = jest.fn();
  });

  it('debe renderizar el formulario de registro', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    expect(
      screen.getByRole('heading', { name: /crear cuenta/i })
    ).toBeInTheDocument();
  });

  it('debe tener campos de formulario', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('debe registrar usuario exitosamente', async () => {
    authService.register.mockResolvedValue({
      token: 'test-token',
      user: { id: 1, email: 'test@test.com' },
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getAllByLabelText(/contraseña/i)[0], {
      target: { value: 'Pass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar/i), {
      target: { value: 'Pass123!' },
    });

    const submitButton = screen.getByRole('button', { name: /registrarse/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('debe manejar errores de registro', async () => {
    authService.register.mockRejectedValue(new Error('Email ya existe'));

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getAllByLabelText(/contraseña/i)[0], {
      target: { value: 'Pass123!' },
    });
    fireEvent.change(screen.getByLabelText(/confirmar/i), {
      target: { value: 'Pass123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }));

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
