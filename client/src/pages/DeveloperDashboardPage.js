import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_MY_AGENTS } from '../graphql/queries';
import { FaPlus, FaChartBar, FaRobot, FaCode, FaUser } from 'react-icons/fa';
import ProfileForm from '../components/ProfileForm';
import './Dashboard.css';

function DeveloperDashboardPage() {
  const { loading, data } = useQuery(GET_MY_AGENTS);
  const myAgents = data?.myAgents || [];
  
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Developer Dashboard</h1>
          <p className="subtitle">Manage your AI agents and track performance</p>
        </div>
        <div className="dashboard-actions">
          <Link to="/create-agent" className="btn primary">
            <FaPlus /> Create New Agent
          </Link>
        </div>
      </div>
      
      <div className="dashboard-nav">
        <button 
          className={`nav-tab ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          <FaChartBar /> Dashboard
        </button>
        <button 
          className={`nav-tab ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FaUser /> Profile
        </button>
        <Link to="/api-documentation" className="nav-tab">
          <FaCode /> API Documentation
        </Link>
      </div>
      
      {activeSection === 'dashboard' && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon"><FaRobot /></div>
              <h3>Total Agents</h3>
              <p className="stat-number">{loading ? '...' : myAgents.length}</p>
              <Link to="/my-agents" className="btn outline">View All</Link>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><FaChartBar /></div>
              <h3>Active Agents</h3>
              <p className="stat-number">
                {loading ? '...' : myAgents.filter(a => a.status === 'ACTIVE').length}
              </p>
              <Link to="/my-agents?status=ACTIVE" className="btn outline">View Active</Link>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon"><FaCode /></div>
              <h3>In Development</h3>
              <p className="stat-number">
                {loading ? '...' : myAgents.filter(a => a.status === 'DRAFT').length}
              </p>
              <Link to="/my-agents?status=DRAFT" className="btn outline">Continue Work</Link>
            </div>
          </div>
          
          <div className="featured-section">
            <div className="section-header">
              <h2>Recent Agents</h2>
              <Link to="/my-agents" className="view-all">View All →</Link>
            </div>
            
            {loading ? (
              <p>Loading your agents...</p>
            ) : myAgents.length > 0 ? (
              <div className="agent-grid">
                {myAgents.slice(0, 3).map(agent => (
                  <div key={agent.id} className="agent-card">
                    <h4>{agent.name}</h4>
                    <p className="agent-status">Status: {agent.status}</p>
                    <div className="agent-actions">
                      <Link to={`/agent/${agent.id}`} className="btn small">View Details</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't created any agents yet.</p>
                <Link to="/create-agent" className="btn primary">
                  <FaPlus /> Create Your First Agent
                </Link>
              </div>
            )}
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
  );
}

export default DeveloperDashboardPage;
