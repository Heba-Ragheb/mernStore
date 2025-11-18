import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <button className="menu-icon" onClick={toggleMenu} aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>

            <Link to="/" className="navbar-logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3h18v18H3V3z" fill="url(#gradient1)"/>
                  <path d="M7 7h10v10H7V7z" fill="white" opacity="0.3"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#667eea"/>
                      <stop offset="100%" stopColor="#764ba2"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">LUXE</span>
            </Link>
          </div>

          <div className="navbar-right">
            {user && (
              <div className="user-badge">
                <div className="user-avatar-small">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-small">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon-sidebar">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3h18v18H3V3z" fill="white"/>
                <path d="M7 7h10v10H7V7z" fill="rgba(255,255,255,0.3)"/>
                <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>
            <span>LUXE</span>
          </div>
          <button className="close-btn" onClick={closeMenu} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <ul className="sidebar-menu">
          <li>
            <Link to="/" onClick={closeMenu}>
              <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/products" onClick={closeMenu}>
              <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Products</span>
            </Link>
          </li>
          <li>
            <Link to="/categories" onClick={closeMenu}>
              <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Categories</span>
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/cart" onClick={closeMenu}>
                <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Cart</span>
              </Link>
            </li>
          )}
          {isAdmin && (
            <li>
              <Link to="/admin" onClick={closeMenu}>
                <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 1v6m0 6v6M1 12h6m6 0h6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Admin Dashboard</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="sidebar-auth">
          {user ? (
            <>
              <div className="user-info">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <p className="user-name">{user.name}</p>
                  <p className="user-email">{user.email}</p>
                  {user.role && <span className="user-role">{user.role}</span>}
                </div>
              </div>
              <button onClick={handleLogout} className="btn-logout-sidebar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login-sidebar" onClick={closeMenu}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Login
              </Link>
              <Link to="/register" className="btn-register-sidebar" onClick={closeMenu}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12.5 7a4 4 0 11-8 0 4 4 0 018 0zM20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;