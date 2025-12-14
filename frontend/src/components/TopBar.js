import React from 'react';
import { authService } from '../services/api';
import { User } from 'lucide-react';

const TopBar = () => {
  const user = authService.getCurrentUser();
  const currentDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="topbar">
      <div className="topbar-left">
        <p className="topbar-date">{currentDate}</p>
      </div>
      <div className="topbar-right">
        {user && (
          <div className="topbar-user">
            <User size={20} />
            <span>{user.fullName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
