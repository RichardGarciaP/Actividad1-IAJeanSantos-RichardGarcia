import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/api';
import {
  LogOut,
  LayoutDashboard,
  Receipt,
  Target,
  BarChart3,
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          💰 Financial Sec
        </h1>

        {user && (
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flex: 1,
              marginLeft: '3rem',
            }}
          >
            <Link
              to="/dashboard"
              className="btn btn-outline"
              style={{
                background: isActive('/dashboard') ? 'white' : 'transparent',
                color: isActive('/dashboard') ? '#667eea' : 'white',
              }}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className="btn btn-outline"
              style={{
                background: isActive('/transactions') ? 'white' : 'transparent',
                color: isActive('/transactions') ? '#667eea' : 'white',
              }}
            >
              <Receipt size={18} />
              Transacciones
            </Link>
            <Link
              to="/budgets"
              className="btn btn-outline"
              style={{
                background: isActive('/budgets') ? 'white' : 'transparent',
                color: isActive('/budgets') ? '#667eea' : 'white',
              }}
            >
              <Target size={18} />
              Presupuestos
            </Link>
            <Link
              to="/stats"
              className="btn btn-outline"
              style={{
                background: isActive('/stats') ? 'white' : 'transparent',
                color: isActive('/stats') ? '#667eea' : 'white',
              }}
            >
              <BarChart3 size={18} />
              Estadísticas
            </Link>
          </div>
        )}

        <div className="navbar-actions">
          {user && (
            <>
              <span className="user-info">👤 {user.fullName}</span>
              <button onClick={handleLogout} className="btn btn-outline">
                <LogOut size={18} />
                Salir
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
