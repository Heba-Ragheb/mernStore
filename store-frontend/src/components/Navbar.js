import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef(null);
  
  // Categories state
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categorys/`);
      console.log('Fetched categories:', res.data);
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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
    setExpandedCategories([]);
  };

  const toggleCategoryExpansion = (categoryId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleCategoryClick = (category) => {
    // If category has subcategories, expand them instead of navigating
    if (category.subcategories && category.subcategories.length > 0) {
      toggleCategoryExpansion(category._id, { preventDefault: () => {}, stopPropagation: () => {} });
    } else {
      // If no subcategories, navigate to category products page
      navigate(`/categories/${category._id}`);
      closeMenu();
    }
  };

  const handleSubcategoryClick = (categoryId, subcategoryId) => {
    navigate(`/categories/${categoryId}/subcategory/${subcategoryId}`);
    closeMenu();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchActive(false);
      setIsOpen(false);
    }
  };

  const openSearch = () => {
    setSearchActive(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const closeSearch = () => {
    if (!searchQuery) {
      setSearchActive(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.querySelector('.navbar-search-expanded');
      const searchIcon = document.querySelector('.search-icon-btn');
      
      if (searchContainer && !searchContainer.contains(event.target) && 
          searchIcon && !searchIcon.contains(event.target)) {
        if (!searchQuery) {
          setSearchActive(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]);

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

          {searchActive && (
            <div className="navbar-search-expanded">
              <form onSubmit={handleSearch} className="navbar-search-form">
                <svg className="search-form-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-field"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="search-clear-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeSearch}
                  className="search-close-btn"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </form>
            </div>
          )}

          <div className="navbar-right">
            {!searchActive && (
              <button 
                className="search-icon-btn"
                onClick={openSearch}
                aria-label="Search"
              >
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}

            <Link to="/cart" className="cart-icon-navbar">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" 
                  stroke="currentColor" strokeWidth="2"/>
              </svg>

              {user?.cart?.length > 0 && (
                <span className="cart-count">{user.cart.length}</span>
              )}
            </Link>

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

      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      ></div>

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

        <div className="sidebar-search">
          <form onSubmit={handleSearch}>
            <div className="sidebar-search-wrapper">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sidebar-search-input"
              />
            </div>
          </form>
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

          {/* Categories with Dropdown */}
          <li className="categorie-section">
            <div className="categories-header">
              <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Categories</span>
            </div>
            
            {categories.length > 0 ? (
              <div className="categories-list-sidebar">
                {categories.map((category) => {
                  const hasSubcategories = category.subcategories && 
                                          Array.isArray(category.subcategories) && 
                                          category.subcategories.length > 0;
                  
                  return (
                    <div key={category._id} className="category-item-sidebar">
                      <div className="category-header-sidebar">
                        <button
                          onClick={() => handleCategoryClick(category)}
                          className="category-name-btn"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          {category.name}
                        </button>
                        
                        {hasSubcategories && (
                          <button
                            onClick={(e) => toggleCategoryExpansion(category._id, e)}
                            className="category-toggle-btn"
                            aria-label={expandedCategories.includes(category._id) ? 'Collapse' : 'Expand'}
                          >
                            <svg 
                              width="18" 
                              height="18" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              style={{
                                transform: expandedCategories.includes(category._id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                              }}
                            >
                              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Subcategories Dropdown */}
                      {expandedCategories.includes(category._id) && hasSubcategories && (
                        <div className="subcategories-dropdown">
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub._id}
                              onClick={() => handleSubcategoryClick(category._id, sub._id)}
                              className="subcategory-item-btn"
                            >
                              <span className="subcategory-dot">•</span>
                              {sub.name}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2"/>
                              </svg>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-categories-message">
                <p>No categories available</p>
              </div>
            )}
          </li>

          {user && (
            <>
              <li>
                <Link to="/cart" onClick={closeMenu}>
                  <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Cart</span>
                  {user?.cart?.length > 0 && (
                    <span className="sidebar-cart-badge">{user.cart.length}</span>
                  )}
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={closeMenu}>
                  <svg className="menu-icon-svg" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>My Orders</span>
                </Link>
              </li>
            </>
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