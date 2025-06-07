import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_PROFILE, CHANGE_PASSWORD } from '../graphql/mutations';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaBuilding, FaKey, FaCheck, FaTimes } from 'react-icons/fa';
import './ProfileForm.css';

const ProfileForm = () => {
  const { user, refetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    company: user?.company || '',
    avatarUrl: user?.avatarUrl || ''
  });
  
  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Feedback states
  const [profileFeedback, setProfileFeedback] = useState({ type: '', message: '' });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });
  
  // Mutations
  const [updateProfile, { loading: profileLoading }] = useMutation(UPDATE_USER_PROFILE);
  const [changePassword, { loading: passwordLoading }] = useMutation(CHANGE_PASSWORD);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileFeedback({ type: '', message: '' });
    
    try {
      const { data } = await updateProfile({
        variables: {
          input: {
            username: profileForm.username,
            bio: profileForm.bio,
            company: profileForm.company,
            avatarUrl: profileForm.avatarUrl
          }
        }
      });
      
      if (data?.updateUserProfile) {
        setProfileFeedback({
          type: 'success',
          message: 'Profile updated successfully!'
        });
        // Refetch user data to update the UI
        refetchUser();
      }
    } catch (error) {
      setProfileFeedback({
        type: 'error',
        message: error.message || 'Failed to update profile. Please try again.'
      });
    }
  };
  
  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: '', message: '' });
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'New passwords do not match.'
      });
      return;
    }
    
    try {
      const { data } = await changePassword({
        variables: {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }
      });
      
      if (data?.changePassword) {
        setPasswordFeedback({
          type: 'success',
          message: 'Password changed successfully!'
        });
        // Clear password fields
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        message: error.message || 'Failed to change password. Please try again.'
      });
    }
  };
  
  return (
    <div className="profile-form-container">
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FaKey /> Security
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === 'profile' && (
          <form className="profile-update-form" onSubmit={handleProfileSubmit}>
            <h2>Update Profile</h2>
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
                placeholder="Username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <div className="input-with-icon">
                <FaBuilding className="input-icon" />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={profileForm.company}
                  onChange={handleProfileChange}
                  placeholder="Your company name"
                />
              </div>
            </div>
            
            {profileFeedback.message && (
              <div className={`feedback ${profileFeedback.type}`}>
                {profileFeedback.type === 'success' ? <FaCheck /> : <FaTimes />}
                <span>{profileFeedback.message}</span>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={profileLoading}
            >
              {profileLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        )}
        
        {activeTab === 'security' && (
          <form className="password-change-form" onSubmit={handlePasswordSubmit}>
            <h2>Change Password</h2>
            
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
                minLength="8"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
                minLength="8"
              />
            </div>
            
            {passwordFeedback.message && (
              <div className={`feedback ${passwordFeedback.type}`}>
                {passwordFeedback.type === 'success' ? <FaCheck /> : <FaTimes />}
                <span>{passwordFeedback.message}</span>
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileForm;
