import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_AGENTS_FOR_DISPLAY } from '../graphql/queries';
import { FaSearch, FaRobot, FaStar, FaChartBar, FaUser, FaCreditCard, FaUserCircle, FaBell, FaCog, FaChartLine, FaServer, FaTag, FaLightbulb } from 'react-icons/fa';
import ProfileForm from '../components/ProfileForm';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import './Dashboard.css';


// Helper function to get time-based greeting
const getGreetingTime = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

function BusinessOwnerDashboardPage() {
  const { loading, data } = useQuery(GET_AGENTS_FOR_DISPLAY, {
    variables: { status: 'active' }
  });
  
  const agents = data?.agents || [];
  const { user } = useAuth();
  const { notifications, getUnreadCount, formatRelativeTime, markAsRead } = useNotifications();
  
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'agent':
        return <FaRobot />;
      case 'billing':
        return <FaCreditCard />;
      case 'system':
        return <FaServer />;
      case 'promotion':
        return <FaTag />;
      case 'feature':
        return <FaLightbulb />;
      default:
        return <FaRobot />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-bar">
        <div className="dashboard-logo">
          <h2>PigeonRTC</h2>
        </div>
        <div className="dashboard-user-actions">
          <button className="icon-button" onClick={() => setShowNotifications(!showNotifications)}>
            <FaBell />
            {getUnreadCount() > 0 && (
              <span className="notification-badge">{getUnreadCount()}</span>
            )}
          </button>
          <div className="user-profile-menu">
            <div className="user-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username || 'User'} />
              ) : (
                <FaUserCircle size={32} />
              )}
            </div>
            <div className="user-menu-container">
              <span className="user-name">{user?.username || 'User'}</span>
              <div className="user-menu-dropdown">
                <Link to="/profile" className="user-menu-item">
                  <FaUser className="menu-icon" /> Profile
                </Link>
                <Link to="/settings" className="user-menu-item">
                  <FaCog className="menu-icon" /> Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showNotifications && (
        <div className="notifications-dropdown">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <p>No notifications</p>
            </div>
          ) : (
            <>
              {notifications.slice(0, 5).map(notification => (
                <Link 
                  to={notification.link} 
                  key={notification.id}
                  className={`notification-item ${notification.read ? '' : 'unread'}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    setShowNotifications(false);
                  }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">{notification.title}</p>
                    <p className="notification-time">{formatRelativeTime(notification.createdAt)}</p>
                  </div>
                </Link>
              ))}
              <Link to="/notifications" className="view-all-notifications" onClick={() => setShowNotifications(false)}>
                View all notifications
              </Link>
            </>
          )}
        </div>
      )}
      
      <div className="dashboard-layout">
        <div className="dashboard-sidebar">
          <div className="sidebar-menu">
            <button 
              className={`sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <FaChartBar /> <span>Dashboard</span>
            </button>
            <button 
              className={`sidebar-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <FaUser /> <span>Profile</span>
            </button>
            <Link to="/billing/usage" className="sidebar-item">
              <FaCreditCard /> <span>Billing & Usage</span>
            </Link>
            <Link to="/agents" className="sidebar-item">
              <FaSearch /> <span>Browse Agents</span>
            </Link>
            <Link to="/settings" className="sidebar-item">
              <FaCog /> <span>Settings</span>
            </Link>
          </div>
        </div>
        
        <div className="dashboard-main-content">
          <div className="dashboard-header">
            <div>
              <h1>Business Owner Dashboard</h1>
              <p className="subtitle">Manage your AI agents and integrations</p>
            </div>
          </div>
      
      {activeSection === 'dashboard' && (
        <>
          <div className="welcome-section">
            <div className="welcome-header">
              <div>
                <h1 className="greeting">
                  {getGreetingTime()}, {user?.username?.split(' ')[0] || 'there'}!
                  <span className="welcome-emoji">👋</span>
                </h1>
                <p className="welcome-subtitle">Here's what's happening with your AI agents today</p>
              </div>
              <div className="quick-actions">
                <Link to="/agents" className="btn primary with-icon">
                  <FaSearch /> <span>Browse Agents</span>
                </Link>
              </div>
            </div>
            
            <div className="usage-overview">
              <div className="usage-card">
                <div className="usage-icon">
                  <FaChartLine />
                </div>
                <div className="usage-details">
                  <span className="usage-label">Monthly API Usage</span>
                  <div className="usage-progress">
                    <div className="progress-bar" style={{ width: '45%' }}></div>
                    <span className="usage-percent">45%</span>
                  </div>
                  <span className="usage-stats">450/1000 requests used</span>
                </div>
              </div>
              
              <div className="usage-card">
                <div className="usage-icon">
                  <FaRobot />
                </div>
                <div className="usage-details">
                  <span className="usage-label">Active Agents</span>
                  <div className="usage-progress">
                    <div className="progress-bar" style={{ width: '30%' }}></div>
                    <span className="usage-percent">3/10</span>
                  </div>
                  <span className="usage-stats">3 agents running</span>
                </div>
              </div>
              
              <div className="usage-card highlight">
                <div className="usage-icon">
                  <FaBell />
                </div>
                <div className="usage-details">
                  <span className="usage-label">Recent Activity</span>
                  <h3>{getUnreadCount()} New {getUnreadCount() === 1 ? 'Update' : 'Updates'}</h3>
                  <p className="usage-stats">Check your notifications</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon"><FaRobot /></div>
              <h3>Available Agents</h3>
              <p className="stat-number">{loading ? '...' : agents.length}</p>
              <div className="stat-progress">
                <div className="progress-bar" style={{width: '75%'}}></div>
              </div>
              <Link to="/agents" className="btn outline">Explore</Link>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><FaStar /></div>
              <h3>My Integrations</h3>
              <p className="stat-number">0</p>
              <div className="stat-progress">
                <div className="progress-bar" style={{width: '0%'}}></div>
              </div>
              <Link to="/my-integrations" className="btn outline">View All</Link>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><FaChartBar /></div>
              <h3>API Usage</h3>
              <p className="stat-number">0/1000</p>
              <div className="stat-progress">
                <div className="progress-bar" style={{width: '0%'}}></div>
              </div>
              <Link to="/billing/usage" className="btn outline">View Usage</Link>
            </div>
          </div>
          
          <div className="featured-section">
            <div className="section-header">
              <h2>Recommended Agents</h2>
              <Link to="/agents" className="view-all">View All →</Link>
            </div>
            
            {loading ? (
              <p>Loading recommended agents...</p>
            ) : agents.length > 0 ? (
              <div className="agent-grid">
                {agents.map(agent => (
                  <div key={agent.id} className="agent-card">
                    <div className="agent-image">
                      {agent.imageUrl ? (
                        <img src={agent.imageUrl} alt={agent.name} />
                      ) : (
                        <div className="agent-image-placeholder">
                          <FaRobot />
                        </div>
                      )}
                    </div>
                    <div className="agent-details">
                      <h4>{agent.name}</h4>
                      <p className="agent-description">
                        {agent.description.length > 100 
                          ? `${agent.description.substring(0, 100)}...` 
                          : agent.description}
                      </p>
                      <div className="agent-actions">
                        <Link to={`/agent/${agent.id}`} className="btn small primary">View Details</Link>
                        <Link to={`/agent/sandbox/${agent.id}`} className="btn small outline">Try Demo</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No agents available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="quick-links">
            <h2>Quick Links</h2>
            <div className="link-cards">
              <Link to="/agents?category=productivity" className="link-card">
                <h4>Productivity Tools</h4>
                <p>Boost your team's efficiency</p>
              </Link>
              <Link to="/agents?category=marketing" className="link-card">
                <h4>Marketing Automation</h4>
                <p>Grow your business</p>
              </Link>
              <Link to="/integrations" className="link-card">
                <h4>Integrations</h4>
                <p>Connect with your tools</p>
              </Link>
            </div>
          </div>
        </>
      )}
      
      {activeSection === 'profile' && (
        <div className="profile-section">
          <h2>Your Profile</h2>
          <p className="section-description">Update your profile information and manage your account settings</p>
          <ProfileForm />
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default BusinessOwnerDashboardPage;
