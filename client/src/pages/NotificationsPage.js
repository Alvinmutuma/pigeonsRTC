import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaRobot, 
  FaCreditCard, 
  FaServer, 
  FaTag, 
  FaLightbulb, 
  FaTrash, 
  FaCheck, 
  FaArrowLeft, 
  FaCheckDouble 
} from 'react-icons/fa';
import { useNotifications } from '../contexts/NotificationsContext';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    formatRelativeTime 
  } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  // Get icon based on notification type
  const getIcon = (type) => {
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
        <h1>Notifications</h1>
        {notifications.length > 0 && (
          <div className="notification-actions">
            <button 
              className="mark-all-read" 
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <FaCheckDouble /> Mark all as read
            </button>
          </div>
        )}
      </div>

      <div className="notification-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread
        </button>
        <button 
          className={`filter-button ${filter === 'agent' ? 'active' : ''}`}
          onClick={() => setFilter('agent')}
        >
          Agents
        </button>
        <button 
          className={`filter-button ${filter === 'billing' ? 'active' : ''}`}
          onClick={() => setFilter('billing')}
        >
          Billing
        </button>
        <button 
          className={`filter-button ${filter === 'system' ? 'active' : ''}`}
          onClick={() => setFilter('system')}
        >
          System
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <p>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? '' : 'unread'}`}
            >
              <div className="notification-icon">
                {getIcon(notification.type)}
              </div>
              <div className="notification-content">
                <Link 
                  to={notification.link} 
                  className="notification-title"
                  onClick={() => markAsRead(notification.id)}
                >
                  {notification.title}
                </Link>
                <p className="notification-description">{notification.description}</p>
                <p className="notification-time">{formatRelativeTime(notification.createdAt)}</p>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button 
                    className="mark-read-button"
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <FaCheck />
                  </button>
                )}
                <button 
                  className="delete-button"
                  onClick={() => deleteNotification(notification.id)}
                  title="Delete notification"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
