// client/src/pages/MyIntegrationsPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Can reuse some dashboard styling

function MyIntegrationsPage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Agent Integrations</h1>
        <p className="subtitle">Manage your active agent integrations and subscriptions.</p>
      </div>
      
      <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2>Feature Coming Soon!</h2>
        <p style={{ fontSize: '1.2em', color: '#555', marginBottom: '30px' }}>
          We're working hard to bring you a comprehensive way to manage your agent integrations.
          Stay tuned for updates.
        </p>
        <Link to="/business-dashboard" className="btn primary">Back to Dashboard</Link>
        <span style={{ margin: '0 10px' }}></span>
        <Link to="/agents" className="btn outline">Browse Agents</Link>
      </div>
    </div>
  );
}

export default MyIntegrationsPage;
