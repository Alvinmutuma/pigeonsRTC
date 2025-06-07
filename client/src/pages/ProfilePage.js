import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaEdit, FaIdCard, FaEnvelope, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Not Logged In</h2>
          <p>Please <Link to="/login">log in</Link> to view your profile.</p>
        </div>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const registrationDate = user.createdAt ? formatDate(user.createdAt) : 'Not available';

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUserCircle size={80} />
        </div>
        <div className="profile-title">
          <h1>{user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'User')}</h1>
          <p className="profile-role">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        {user.role === 'business' && (
          <button 
            className={`profile-tab ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </button>
        )}
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-details">
            <div className="profile-info">
              <div className="info-item">
                <FaIdCard className="info-icon" />
                <div>
                  <h3>Full Name</h3>
                  <p>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}</p>
                </div>
                <Link to="#" className="edit-link"><FaEdit /></Link>
              </div>
              
              <div className="info-item">
                <FaEnvelope className="info-icon" />
                <div>
                  <h3>Email</h3>
                  <p>{user.email}</p>
                </div>
              </div>
              
              {user.company && (
                <div className="info-item">
                  <FaBuilding className="info-icon" />
                  <div>
                    <h3>Company</h3>
                    <p>{user.company}</p>
                  </div>
                  <Link to="#" className="edit-link"><FaEdit /></Link>
                </div>
              )}
              
              <div className="info-item">
                <FaCalendarAlt className="info-icon" />
                <div>
                  <h3>Member Since</h3>
                  <p>{registrationDate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-settings">
            <h2>Security Settings</h2>
            <div className="security-option">
              <h3>Change Password</h3>
              <p>Update your password regularly to keep your account secure</p>
              <button className="btn-primary">Change Password</button>
            </div>
            
            <div className="security-option">
              <h3>Logout</h3>
              <p>End your current session</p>
              <button className="btn-danger" onClick={logout}>Logout</button>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="billing-preview">
            <h2>Billing Preview</h2>
            <p>Your billing details will be managed in the Billing & Usage page.</p>
            <Link to="/billing/usage" className="btn-primary">Go to Billing & Usage</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
