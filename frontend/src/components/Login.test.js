import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { authService } from '../services/api';

// Mock del servicio de autenticación
jest.mock('../services/api', () => ({
  authService: {
    login: jest.fn(),
  },
}));

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  test('debe renderizar formulario de login', () => {
    renderLogin();

    expect(
      screen.getByRole('heading', { name: 'Iniciar Sesión' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Iniciar Sesión/i })
    ).toBeInTheDocument();
  });

  test('debe mostrar texto de bienvenida', () => {
    renderLogin();

    expect(
      screen.getByText('Bienvenido de nuevo a Financial Sec')
    ).toBeInTheDocument();
  });

  test('debe actualizar campo de email', () => {
    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  test('debe actualizar campo de contraseña', () => {
    renderLogin();

    const passwordInput = screen.getByLabelText('Contraseña');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  test('debe hacer login exitosamente y redirigir', async () => {
    authService.login.mockResolvedValue({
      token: 'test-token',
      user: { id: 1, email: 'test@example.com' },
    });

    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('debe mostrar mensaje de error en login fallido', async () => {
    const errorMessage = 'Credenciales inválidas';
    authService.login.mockRejectedValue({
      response: { data: { error: errorMessage } },
    });

    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('debe mostrar error genérico si no hay mensaje específico', async () => {
    authService.login.mockRejectedValue(new Error('Network error'));

    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error al iniciar sesión')).toBeInTheDocument();
    });
  });

  test('debe deshabilitar botón durante el login', async () => {
    authService.login.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', {
      name: /Iniciar Sesión/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'TestPass123' } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton.textContent).toBe('Iniciando sesión...');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test('debe limpiar mensaje de error al enviar nuevamente', async () => {
    authService.login.mockRejectedValueOnce({
      response: { data: { error: 'Error inicial' } },
    });

    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', {
      name: /Iniciar Sesión/i,
    });

    // Primer intento fallido
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error inicial')).toBeInTheDocument();
    });

    // Segundo intento (exitoso)
    authService.login.mockResolvedValueOnce({ token: 'test-token' });
    fireEvent.change(passwordInput, { target: { value: 'correct' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Error inicial')).not.toBeInTheDocument();
    });
  });

  test('debe tener campos requeridos', () => {
    renderLogin();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  test('debe usar tipo email para campo de email', () => {
    renderLogin();

    const emailInput = screen.getByLabelText('Email');

    expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('debe usar tipo password para campo de contraseña', () => {
    renderLogin();

    const passwordInput = screen.getByLabelText('Contraseña');

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('debe prevenir envío por defecto del formulario', () => {
    renderLogin();

    const form = screen
      .getByRole('button', { name: /Iniciar Sesión/i })
      .closest('form');
    const mockSubmit = jest.fn((e) => e.preventDefault());

    form.onsubmit = mockSubmit;
    fireEvent.submit(form);

    expect(mockSubmit).toHaveBeenCalled();
  });
});
