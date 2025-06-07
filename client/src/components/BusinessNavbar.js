import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaSignOutAlt, 
  FaChartLine, 
  FaCog, 
  FaBell, 
  FaChevronDown,
  FaHome,
  FaBox,
  FaUsers,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import './BusinessNavbar.css';

const BusinessNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Dashboard navigation items
  const navItems = [
    { to: '/business/dashboard', icon: <FaHome />, text: 'Overview' },
    { to: '/business/products', icon: <FaBox />, text: 'Products' },
    { to: '/business/customers', icon: <FaUsers />, text: 'Customers' },
    { to: '/business/orders', icon: <FaFileInvoiceDollar />, text: 'Orders' },
    { to: '/business/analytics', icon: <FaChartLine />, text: 'Analytics' },
  ];

  return (
    <nav className="business-navbar">
      {/* Logo */}
      <div className="business-navbar-logo">
        <Link to="/business/dashboard">
          <span>Business Dashboard</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className={`business-nav-menu ${isOpen ? 'active' : ''}`}>
        <ul className="business-nav-items">
          {navItems.map((item) => (
            <li key={item.to} className="business-nav-item">
              <Link
                to={item.to}
                className={`business-nav-link ${location.pathname === item.to ? 'active' : ''}`}
              >
                <span className="business-nav-icon">{item.icon}</span>
                <span className="business-nav-text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side Controls */}
      <div className="business-nav-controls">
        {/* Notifications */}
        <div className="business-notification">
          <button className="business-notification-btn">
            <FaBell />
            <span className="business-notification-badge">3</span>
          </button>
        </div>

        {/* User Profile */}
        <div 
          className="business-profile" 
          onMouseEnter={() => setIsProfileOpen(true)}
          onMouseLeave={() => setIsProfileOpen(false)}
        >
          <button className="business-profile-btn">
            <div className="business-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} />
              ) : (
                <span>{getUserInitials()}</span>
              )}
            </div>
            <span className="business-username">{user?.username}</span>
            <FaChevronDown className="business-dropdown-arrow" />
          </button>
          
          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="business-profile-dropdown">
              <Link to="/business/profile" className="business-dropdown-item">
                <FaUser className="business-dropdown-icon" />
                <span>Profile</span>
              </Link>
              <Link to="/business/settings" className="business-dropdown-item">
                <FaCog className="business-dropdown-icon" />
                <span>Settings</span>
              </Link>
              <div className="business-dropdown-divider"></div>
              <button onClick={handleLogout} className="business-dropdown-item business-logout">
                <FaSignOutAlt className="business-dropdown-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button className="business-menu-btn" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
    </nav>
  );
};

export default BusinessNavbar;
