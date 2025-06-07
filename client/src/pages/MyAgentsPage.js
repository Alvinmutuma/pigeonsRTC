import React from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_MY_AGENTS } from '../graphql/queries';
import './MyAgentsPage.css'; // For styling

// Optional: A dedicated card for 'My Agents' page if different from general AgentCard
const MyAgentCard = ({ agent }) => {
  const formatPricing = (pricing) => {
    if (!pricing) return 'N/A';
    switch (pricing.type) {
      case 'FREE':
        return 'Free';
      case 'SUBSCRIPTION':
        return pricing.amount !== null && pricing.amount !== undefined ? `$${pricing.amount.toFixed(2)} ${pricing.currency || ''}/month`.trim() : 'Subscription (Contact Sales)';
      case 'PAY_PER_USE':
        return pricing.amount !== null && pricing.amount !== undefined ? `$${pricing.amount.toFixed(2)} ${pricing.currency || ''}/use`.trim() : 'Pay-per-use (Contact Sales)';
      case 'CONTACT_SALES':
        return 'Contact for Pricing';
      default:
        return 'Pricing not specified';
    }
  };

  return (
    <div className="my-agent-card">
      <h3>{agent.name}</h3>
      <p className={`status status-${agent.status?.toLowerCase()}`}>{agent.status?.replace('_', ' ') || 'N/A'}</p>
      <p>Category: {agent.category}</p>
      <p>Pricing: {formatPricing(agent.pricing)}</p>
      {agent.pricing?.details && <p className="pricing-details-summary"><em>{agent.pricing.details}</em></p>}
      <p>{agent.description?.substring(0, 100)}{agent.description?.length > 100 ? '...' : ''}</p>
      {agent.tags && agent.tags.length > 0 && (
        <div className="tags-container">
          {agent.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}
      <div className="card-actions">
        <Link to={`/agent/${agent.id}`} className="action-link view-link">View Details</Link>
      </div>
    </div>
  );
};

const MyAgentsPage = () => {
  const { loading, error, data } = useQuery(GET_MY_AGENTS);

  if (loading) return <p>Loading your agents...</p>;
  if (error) return <p>Error loading your agents: {error.message}</p>;

  const agents = data?.myAgents || [];

  return (
    <div className="my-agents-page">
      <h2>My Created Agents</h2>
      {agents.length === 0 ? (
        <p>You haven't created any agents yet. <Link to="/create-agent">Create one now!</Link></p>
      ) : (
        <div className="my-agents-list">
          {agents.map(agent => (
            <MyAgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAgentsPage;
