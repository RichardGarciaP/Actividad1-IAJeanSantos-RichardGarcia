import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { authService } from '../services/api';

jest.mock('../services/api');

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/dashboard' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    authService.getCurrentUser.mockReturnValue({
      id: 1,
      email: 'test@test.com',
    });
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar la barra de navegación', () => {
      renderWithRouter(<Navbar />);

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('debe mostrar el nombre de la aplicación', () => {
      renderWithRouter(<Navbar />);

      expect(screen.getByText(/Financial Sec/i)).toBeInTheDocument();
    });

    it('debe mostrar enlaces cuando hay usuario autenticado', () => {
      renderWithRouter(<Navbar />);

      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Enlaces de navegación', () => {
    it('debe tener enlaces a las secciones principales', () => {
      renderWithRouter(<Navbar />);

      const links = screen.getAllByRole('link');
      const hrefs = links.map((link) => link.getAttribute('href'));

      expect(hrefs).toContain('/dashboard');
      expect(hrefs).toContain('/transactions');
      expect(hrefs).toContain('/budgets');
    });
  });

  describe('Botón de cerrar sesión', () => {
    it('debe tener botón de logout', () => {
      renderWithRouter(<Navbar />);

      const logoutButton = screen.getByRole('button');
      expect(logoutButton).toBeInTheDocument();
    });

    it('debe llamar a logout al hacer clic', () => {
      authService.logout = jest.fn();
      renderWithRouter(<Navbar />);

      const logoutButton = screen.getByRole('button');
      fireEvent.click(logoutButton);

      expect(authService.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Sin usuario autenticado', () => {
    it('no debe mostrar enlaces si no hay usuario', () => {
      authService.getCurrentUser.mockReturnValue(null);
      renderWithRouter(<Navbar />);

      const links = screen.queryAllByRole('link');
      expect(links.length).toBe(0);
    });
  });
});
