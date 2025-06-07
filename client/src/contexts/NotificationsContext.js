import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Sample notification data
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    type: 'agent',
    title: 'New AI agent available in your industry',
    description: 'Check out the latest Customer Support agent that matches your business needs.',
    icon: 'robot',
    read: false,
    link: '/agents?category=customer_support',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: '2',
    type: 'billing',
    title: 'Your subscription will renew in 3 days',
    description: 'Your premium plan will automatically renew on June 6th, 2025.',
    icon: 'creditCard',
    read: false,
    link: '/billing/subscription',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: '3',
    type: 'system',
    title: 'System maintenance scheduled',
    description: 'A scheduled maintenance will occur on June 10th, 2025, from 2AM to 4AM UTC.',
    icon: 'server',
    read: true,
    link: '/system-status',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: '4',
    type: 'promotion',
    title: 'Limited time offer: 20% discount',
    description: 'Upgrade to the Enterprise plan and get 20% off for the first 3 months.',
    icon: 'tag',
    read: true,
    link: '/pricing',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: '5',
    type: 'feature',
    title: 'New feature: Custom agent training',
    description: 'You can now train agents with your own data for better results.',
    icon: 'lightbulb',
    read: true,
    link: '/features/custom-training',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  }
];

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from localStorage or use sample data
  useEffect(() => {
    if (user) {
      setLoading(true);
      
      // In a real app, this would be an API call
      // For now, we'll use localStorage to persist read status
      const storedNotifications = localStorage.getItem(`notifications_${user.id}`);
      
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        setNotifications(SAMPLE_NOTIFICATIONS);
      }
      
      setLoading(false);
    }
  }, [user]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user && notifications.length > 0) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(notifications));
    }
  }, [notifications, user]);

  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  // Delete a notification
  const deleteNotification = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    };
    
    setNotifications(prevNotifications => 
      [newNotification, ...prevNotifications]
    );
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  const value = {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getUnreadCount,
    formatRelativeTime
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
