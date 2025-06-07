import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_SETTINGS } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { 
  FaCog, 
  FaBell, 
  FaShieldAlt, 
  FaPalette, 
  FaArrowLeft, 
  FaSave,
  FaMoon,
  FaSun,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  // Initialize settings with default values or saved preferences
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    
    // Appearance Settings
    theme: 'light',
    reducedAnimations: false,
    compactView: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 60, // minutes
    
    // Saved for future use
    language: 'en',
    timezone: 'UTC',
  });
  
  const [activeTab, setActiveTab] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Get stored settings from localStorage
  useEffect(() => {
    if (user) {
      try {
        const savedSettings = localStorage.getItem(`settings_${user.id}`);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, [user]);
  
  // Mock mutation for settings update (to be replaced with real GraphQL mutation)
  // Using a dummy useMutation that will be implemented later when backend supports it
  useMutation(UPDATE_USER_SETTINGS, {
    onCompleted: (data) => {
      // This is mocked for now
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
    },
  });
  
  const handleToggle = (settingName) => {
    setSettings({
      ...settings,
      [settingName]: !settings[settingName]
    });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };
  
  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // In a real app, we would call the API here
      // await updateUserSettings({ variables: { input: settings } });
      
      // For now, just save to localStorage
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(settings));
      
      // Show success message
      setSaveSuccess(true);
      
      // Add notification
      addNotification({
        type: 'system',
        title: 'Settings saved successfully',
        description: 'Your preferences have been updated.',
        icon: 'cog'
      });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleReset = () => {
    // Confirm reset with user
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      // Default settings
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        theme: 'light',
        reducedAnimations: false,
        compactView: false,
        twoFactorAuth: false,
        sessionTimeout: 60,
        language: 'en',
        timezone: 'UTC',
      };
      
      setSettings(defaultSettings);
      localStorage.setItem(`settings_${user.id}`, JSON.stringify(defaultSettings));
      
      // Add notification
      addNotification({
        type: 'system',
        title: 'Settings reset to default',
        description: 'All your preferences have been reset to default values.',
        icon: 'cog'
      });
    }
  };
  
  // Apply theme based on settings
  useEffect(() => {
    document.body.className = settings.theme === 'dark' ? 'dark-theme' : '';
  }, [settings.theme]);
  
  if (!user) {
    return navigate('/login');
  }
  
  return (
    <div className="settings-page">
      <div className="settings-header">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FaArrowLeft /> Back
        </button>
        <h1><FaCog /> Settings</h1>
        <div className="settings-actions">
          <button 
            className={`save-button ${saveSuccess ? 'success' : ''}`}
            onClick={saveSettings}
            disabled={isSaving}
          >
            <FaSave /> {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      <div className="settings-container">
        <div className="settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <FaBell /> Notifications
          </button>
          <button 
            className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <FaPalette /> Appearance
          </button>
          <button 
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FaShieldAlt /> Security
          </button>
        </div>
        
        <div className="settings-content">
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="settings-description">
                Control how and when you receive notifications from PigeonRTC.
              </p>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Email Notifications</h3>
                  <p>Receive important updates via email</p>
                </div>
                <button 
                  className={`toggle-button ${settings.emailNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('emailNotifications')}
                  aria-label={settings.emailNotifications ? 'Disable email notifications' : 'Enable email notifications'}
                  aria-pressed={settings.emailNotifications}
                >
                  {settings.emailNotifications ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Push Notifications</h3>
                  <p>Receive real-time notifications in your browser</p>
                </div>
                <button 
                  className={`toggle-button ${settings.pushNotifications ? 'active' : ''}`}
                  onClick={() => handleToggle('pushNotifications')}
                  aria-label={settings.pushNotifications ? 'Disable push notifications' : 'Enable push notifications'}
                  aria-pressed={settings.pushNotifications}
                >
                  {settings.pushNotifications ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Marketing Emails</h3>
                  <p>Receive promotional offers and newsletters</p>
                </div>
                <button 
                  className={`toggle-button ${settings.marketingEmails ? 'active' : ''}`}
                  onClick={() => handleToggle('marketingEmails')}
                  aria-label={settings.marketingEmails ? 'Disable marketing emails' : 'Enable marketing emails'}
                  aria-pressed={settings.marketingEmails}
                >
                  {settings.marketingEmails ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance Settings</h2>
              <p className="settings-description">
                Customize how PigeonRTC looks and feels.
              </p>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Theme</h3>
                  <p>Choose between light and dark mode</p>
                </div>
                <div className="theme-selector">
                  <button 
                    className={`theme-option ${settings.theme === 'light' ? 'selected' : ''}`}
                    onClick={() => setSettings({...settings, theme: 'light'})}
                    aria-label="Light theme"
                    aria-pressed={settings.theme === 'light'}
                  >
                    <FaSun /> Light
                  </button>
                  <button 
                    className={`theme-option ${settings.theme === 'dark' ? 'selected' : ''}`}
                    onClick={() => setSettings({...settings, theme: 'dark'})}
                    aria-label="Dark theme"
                    aria-pressed={settings.theme === 'dark'}
                  >
                    <FaMoon /> Dark
                  </button>
                </div>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Reduced Animations</h3>
                  <p>Disable animations for improved performance</p>
                </div>
                <button 
                  className={`toggle-button ${settings.reducedAnimations ? 'active' : ''}`}
                  onClick={() => handleToggle('reducedAnimations')}
                  aria-label={settings.reducedAnimations ? 'Enable animations' : 'Reduce animations'}
                  aria-pressed={settings.reducedAnimations}
                >
                  {settings.reducedAnimations ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Compact View</h3>
                  <p>Show more content with less spacing</p>
                </div>
                <button 
                  className={`toggle-button ${settings.compactView ? 'active' : ''}`}
                  onClick={() => handleToggle('compactView')}
                  aria-label={settings.compactView ? 'Use standard view' : 'Use compact view'}
                  aria-pressed={settings.compactView}
                >
                  {settings.compactView ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="settings-description">
                Manage your account security and authentication options.
              </p>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button 
                  className={`toggle-button ${settings.twoFactorAuth ? 'active' : ''}`}
                  onClick={() => handleToggle('twoFactorAuth')}
                  aria-label={settings.twoFactorAuth ? 'Disable two-factor authentication' : 'Enable two-factor authentication'}
                  aria-pressed={settings.twoFactorAuth}
                >
                  {settings.twoFactorAuth ? <FaToggleOn /> : <FaToggleOff />}
                </button>
              </div>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Session Timeout</h3>
                  <p>Automatically log out after inactivity</p>
                </div>
                <select 
                  name="sessionTimeout" 
                  value={settings.sessionTimeout} 
                  onChange={handleChange}
                  className="select-input"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="240">4 hours</option>
                  <option value="480">8 hours</option>
                </select>
              </div>
              
              <div className="setting-action">
                <button 
                  className="reset-button"
                  onClick={handleReset}
                >
                  Reset to Default Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
