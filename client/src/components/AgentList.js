import React from 'react';
import { gql, useQuery } from '@apollo/client';

// Define the GraphQL query
const GET_AGENTS = gql`
  query GetAgents {
    agents {
      id
      name
      description
      category
      status
      pricing {
        type
        amount
        currency
        details
      }
    }
  }
`;

function AgentList() {
  const { loading, error, data } = useQuery(GET_AGENTS);

  if (loading) return <p>Loading agents...</p>;
  if (error) return <p>Error fetching agents: {error.message}</p>;

  const formatPricing = (pricing) => {
    if (!pricing) return 'Not available';
    switch (pricing.type) {
      case 'FREE':
        return 'Free';
      case 'SUBSCRIPTION':
        return `${pricing.amount ? `$${pricing.amount.toFixed(2)}` : ''} ${pricing.currency || ''}/month`.trim();
      case 'PAY_PER_USE':
        return `${pricing.amount ? `$${pricing.amount.toFixed(2)}` : ''} ${pricing.currency || ''}/use`.trim();
      case 'CONTACT_SALES':
        return 'Contact for Pricing';
      default:
        return 'Pricing not specified';
    }
  };

  return (
    <div>
      <h2>Available AI Agents</h2>
      {data.agents.length === 0 ? (
        <p>No agents available yet. Stay tuned!</p>
      ) : (
        <ul>
          {data.agents.map((agent) => (
            <li key={agent.id} style={{ border: '1px solid #eee', margin: '10px', padding: '10px' }}>
              <h3>{agent.name}</h3>
              <p><strong>Category:</strong> {agent.category}</p>
              <p><strong>Status:</strong> {agent.status}</p>
              <p><strong>Pricing:</strong> {formatPricing(agent.pricing)}</p>
              {agent.pricing && agent.pricing.details && (
                <p style={{ fontSize: '0.9em', color: '#555' }}><em>{agent.pricing.details}</em></p>
              )}
              <p>{agent.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AgentList;
