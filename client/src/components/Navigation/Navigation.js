import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../utils/auth';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '' },
    { path: '/medications', label: 'Medications', icon: '' },
    { path: '/calendar', label: 'Calendar', icon: '' },
  ];

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">MediReminder</span>
        </Link>
        
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <button onClick={handleLogout} className="logout-btn" aria-label="Log out">
          <span aria-hidden="true">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
