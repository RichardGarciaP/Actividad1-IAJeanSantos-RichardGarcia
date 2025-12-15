import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

const TestComponent = () => <div>Protected Content</div>;
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => {
    mockNavigate(to);
    return <div>Redirecting to {to}</div>;
  },
}));

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Con usuario autenticado', () => {
    it('debe renderizar el componente hijo cuando hay token', () => {
      localStorage.setItem('token', 'valid-token');

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('no debe redirigir cuando el usuario está autenticado', () => {
      localStorage.setItem('token', 'valid-token');

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Sin usuario autenticado', () => {
    it('debe redirigir a login cuando no hay token', () => {
      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('no debe renderizar el componente hijo cuando no hay token', () => {
      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('debe redirigir cuando el token está vacío', () => {
      localStorage.setItem('token', '');

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
    });
  });

  describe('Manejo del localStorage', () => {
    it('debe verificar el token cada vez que se renderiza', () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(getItemSpy).toHaveBeenCalledWith('token');
      getItemSpy.mockRestore();
    });
  });

  describe('Múltiples hijos', () => {
    it('debe renderizar múltiples componentes hijos cuando está autenticado', () => {
      localStorage.setItem('token', 'valid-token');

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <div>Component 1</div>
                  <div>Component 2</div>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.getByText('Component 1')).toBeInTheDocument();
      expect(screen.getByText('Component 2')).toBeInTheDocument();
    });
  });
});
