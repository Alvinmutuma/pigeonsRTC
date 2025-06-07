import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PENDING_AGENTS } from '../graphql/queries';
import { UPDATE_AGENT_STATUS } from '../graphql/mutations';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const { loading, error, data } = useQuery(GET_PENDING_AGENTS);
  const [updateAgentStatus, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_AGENT_STATUS);

  const handleUpdateStatus = async (agentId, status) => {
    try {
      await updateAgentStatus({
        variables: { agentId, status },
        // Refetch pending agents to update the list
        refetchQueries: [{ query: GET_PENDING_AGENTS }],
      });
      // Optionally, add a success message here
    } catch (err) {
      console.error(`Failed to update agent ${agentId} to status ${status}:`, err);
      // Optionally, add an error message for the user here
    }
  };

  if (loading) return <p>Loading pending agents...</p>;
  if (error) return <p>Error loading pending agents: {error.message}</p>;

  const pendingAgents = data?.pendingAgents || [];

  return (
    <div className="admin-dashboard-page">
      <h2>Admin Dashboard - Pending Agent Approvals</h2>
      {updateLoading && <p>Updating status...</p>}
      {updateError && <p>Error updating status: {updateError.message}</p>}
      {pendingAgents.length === 0 ? (
        <p>No agents are currently pending approval.</p>
      ) : (
        <table className="pending-agents-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Developer</th>
              <th>Category</th>
              <th>Price</th>
              <th>Submitted</th>
              <th>API URL Check</th>
              <th>Doc URL Check</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingAgents.map((agent) => {
              const apiUrlCheck = agent.automatedVettingInfo?.apiUrlCheck;
              let apiUrlCheckDisplay = 'N/A';
              if (apiUrlCheck) {
                const status = apiUrlCheck.status || 'PENDING';
                const details = apiUrlCheck.details || '';
                const httpCode = apiUrlCheck.httpStatusCode ? ` (${apiUrlCheck.httpStatusCode})` : '';
                const lastChecked = apiUrlCheck.lastChecked ? new Date(parseInt(apiUrlCheck.lastChecked, 10)).toLocaleString() : 'Never';
                
                apiUrlCheckDisplay = (
                  <div className={`api-check-status api-check-${status.toLowerCase()}`}>
                    <strong title={status === 'QUEUED' ? 'Check in progress...' : ''}>
                      {status}
                      {status === 'QUEUED' && <span className="queued-dots">...</span>}
                      {httpCode}
                    </strong>
                    {details && <p style={{ fontSize: '0.8em', margin: '2px 0 0 0' }}>{details}</p>}
                    <small>Last Checked: {lastChecked}</small>
                  </div>
                );
              }

              const docUrlCheck = agent.automatedVettingInfo?.docUrlCheck;
              let docUrlCheckDisplay = 'N/A';
              if (docUrlCheck) {
                const status = docUrlCheck.status || 'PENDING';
                const details = docUrlCheck.details || '';
                const httpCode = docUrlCheck.httpStatusCode ? ` (${docUrlCheck.httpStatusCode})` : '';
                const lastChecked = docUrlCheck.lastChecked ? new Date(parseInt(docUrlCheck.lastChecked, 10)).toLocaleString() : 'Never';
                
                docUrlCheckDisplay = (
                  <div className={`api-check-status api-check-${status.toLowerCase()}`}>
                    <strong title={status === 'QUEUED' ? 'Check in progress...' : ''}>
                      {status}
                      {status === 'QUEUED' && <span className="queued-dots">...</span>}
                      {httpCode}
                    </strong>
                    {details && <p style={{ fontSize: '0.8em', margin: '2px 0 0 0' }}>{details}</p>}
                    <small>Last Checked: {lastChecked}</small>
                  </div>
                );
              }

              return (
                <tr key={agent.id}>
                  <td>{agent.name}</td>
                  <td>{agent.developer?.username || 'N/A'}</td>
                  <td>{agent.category}</td>
                  <td>${agent.price?.toFixed(2) || 'N/A'}</td>
                  <td>{new Date(parseInt(agent.createdAt, 10)).toLocaleDateString()}</td>
                  <td>{apiUrlCheckDisplay}</td>
                  <td>{docUrlCheckDisplay}</td>
                  <td>
                    <button 
                      className="approve-button"
                      onClick={() => handleUpdateStatus(agent.id, 'active')}
                      disabled={updateLoading}
                    >
                      Approve
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleUpdateStatus(agent.id, 'rejected')}
                      disabled={updateLoading}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboardPage;
