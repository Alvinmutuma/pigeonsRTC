import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const commonLinks = (
    <>
      <li><NavLink to="/agents" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsMobileMenuOpen(false)}>Browse Agents</NavLink></li>
      <li><NavLink to="/pricing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsMobileMenuOpen(false)}>Pricing</NavLink></li>
      <li><NavLink to="/community" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsMobileMenuOpen(false)}>Community</NavLink></li>
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
            PigeonRTC
          </Link>
        </div>

        <div className="navbar-center hidden-mobile">
          <ul className="nav-menu">
            {commonLinks}
          </ul>
        </div>

        <div className="navbar-right">
          <ul className="nav-menu hidden-mobile">
            {user ? (
              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle">{user.username || 'Profile'}</span>
                <ul className="dropdown-menu">
                  <li><NavLink to="/my-agents" className={({ isActive }) => isActive ? 'dropdown-item active' : 'dropdown-item'} onClick={() => setIsMobileMenuOpen(false)}>My Agents</NavLink></li>
                  <li><NavLink to="/business-dashboard" className={({ isActive }) => isActive ? 'dropdown-item active' : 'dropdown-item'} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink></li>
                  {user.role === 'admin' && (
                    <li><NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'dropdown-item active' : 'dropdown-item'} onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</NavLink></li>
                  )}
                  <li><button onClick={handleLogout} className="dropdown-item-button">Logout</button></li>
                </ul>
              </li>
            ) : (
              <>
                <li><NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink></li>
                <li><NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link cta' : 'nav-link cta'} onClick={() => setIsMobileMenuOpen(false)}>Sign Up</NavLink></li>
              </>
            )}
          </ul>
          <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-nav-menu">
          <ul className="nav-menu-mobile">
            {commonLinks}
            <hr className="mobile-menu-divider" />
            {user ? (
              <>
                <li><span className="nav-link-mobile-header">{user.username || 'Profile'}</span></li>
                <li><NavLink to="/my-agents" className={({ isActive }) => isActive ? 'nav-link-mobile active' : 'nav-link-mobile'} onClick={() => setIsMobileMenuOpen(false)}>My Agents</NavLink></li>
                <li><NavLink to="/business-dashboard" className={({ isActive }) => isActive ? 'nav-link-mobile active' : 'nav-link-mobile'} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink></li>
                {user.role === 'admin' && (
                  <li><NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link-mobile active' : 'nav-link-mobile'} onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</NavLink></li>
                )}
                <li><button onClick={handleLogout} className="nav-link-mobile-button">Logout</button></li>
              </>
            ) : (
              <>
                <li><NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link-mobile active' : 'nav-link-mobile'} onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink></li>
                <li><NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link-mobile cta' : 'nav-link-mobile cta'} onClick={() => setIsMobileMenuOpen(false)}>Sign Up</NavLink></li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
