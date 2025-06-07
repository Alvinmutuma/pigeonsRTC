import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_AGENT_DETAILS } from '../graphql/queries';
import { useAuth } from '../contexts/AuthContext'; // Updated path to match directory structure
import TryBeforeBuy from '../components/TryBeforeBuy';
import AgentRatings from '../components/AgentRatings';
import './AgentDetailPage.css'; // We'll create this for styling
import SEO from '../components/SEO';

const AgentDetailPage = () => {
  const { id: agentId } = useParams(); // Get agentId from URL parameter 'id'
  const { user } = useAuth(); // Get current user
  const [showTryBeforeBuy, setShowTryBeforeBuy] = useState(false);
  const { loading, error, data } = useQuery(GET_AGENT_DETAILS, {
    variables: { agentId },
  });

  if (loading) return <p>Loading agent details...</p>;
  if (error) return <p>Error fetching agent details: {error.message}</p>;

  const agent = data?.agent;

  if (!agent) return <p>Agent not found.</p>;

  // Helper to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(parseInt(dateString, 10)).toLocaleDateString(); // Assuming timestamp
  };

  // Prepare SEO data once agent data is available
  const seoTitle = agent ? `${agent.name} | PigeonRTC AI Agent` : 'AI Agent Details | PigeonRTC';
  const seoDescription = agent ? (agent.description?.substring(0, 160) || `Explore the details and capabilities of ${agent.name}, an AI agent on the PigeonRTC marketplace.`) : 'Discover AI agents on PigeonRTC.';
  const seoKeywords = agent ? [
    agent.name,
    agent.category,
    ...(agent.tags || []),
    'AI agent',
    'PigeonRTC',
    'automation',
  ].join(', ') : 'AI, agent, marketplace, automation';
  const seoUrl = agent ? `https://pigeonrtc.com/agent/${agentId}` : 'https://pigeonrtc.com/agents';
  // Assuming a default OG image, or you might have agent.imageUrl
  const seoImage = agent?.imageUrl || 'https://pigeonrtc.com/images/og-agent-default.png'; 

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={seoUrl}
        image={seoImage}
        type="article" // Individual agents can be treated as articles or products
      />
      <div className="agent-detail-page">
      <Link to="/agents" className="back-link"> Back to Listings</Link>
      
      <div className="agent-header">
        <h1>{agent.name}</h1>
        <p className="agent-category-detail">Category: {agent.category}</p>
        <p className={`agent-status-detail status-${agent.status?.toLowerCase()}`}>
          Status: {agent.status?.replace('_', ' ')}
        </p>
        {user && agent.developer && user.id === agent.developer.id && (
          <Link to={`/agent/${agentId}/edit`} className="edit-agent-button">
            Edit Agent
          </Link>
        )}
      </div>

      <div className="agent-content-grid">
        <div className="agent-main-details">
          <h2>Description</h2>
          <p>{agent.description}</p>

          {agent.useCases && agent.useCases.length > 0 && (
            <>
              <h2>Use Cases</h2>
              <ul>
                {agent.useCases.map((useCase, index) => (
                  <li key={index}>{useCase}</li>
                ))}
              </ul>
            </>
          )}

          {agent.customizationGuide && (
            <>
              <h2>Customization Guide</h2>
              <p>{agent.customizationGuide}</p>
            </>
          )}
        </div>

        <div className="agent-sidebar-details">
          <div className="sidebar-section pricing-section-detail">
            <h3>Pricing</h3>
            {agent.pricing ? (
              <>
                <p className="pricing-type-detail">Type: {agent.pricing.type?.replace('_', ' ') || 'N/A'}</p>
                {agent.pricing.type !== 'FREE' && agent.pricing.type !== 'CONTACT_SALES' && agent.pricing.amount !== null && (
                  <p className="pricing-amount-detail">
                    Amount: {agent.pricing.amount.toFixed(2)} {agent.pricing.currency}
                    {agent.pricing.type === 'SUBSCRIPTION' && ' / month'}
                    {agent.pricing.type === 'PAY_PER_USE' && ' / use'}
                  </p>
                )}
                {agent.pricing.details && (
                  <p className="pricing-details-info"><em>{agent.pricing.details}</em></p>
                )}
                {agent.pricing.type === 'CONTACT_SALES' && !agent.pricing.details && (
                    <p>Please contact the developer for pricing information.</p>
                )}
              </>
            ) : (
              <p>Pricing information not available.</p>
            )}
          </div>

          {agent.developer && (
            <div className="sidebar-section">
              <h3>Developer</h3>
              <p>Username: {agent.developer.username}</p>
              <p>Email: {agent.developer.email}</p> {/* Consider if email should be public */}
            </div>
          )}

          {agent.tags && agent.tags.length > 0 && (
            <div className="sidebar-section">
              <h3>Tags</h3>
              <div className="tags-container">
                {agent.tags.map((tag, index) => (
                  <span key={index} className="tag-badge">{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="sidebar-section">
            <h3>Dates</h3>
            <p>Created: {formatDate(agent.createdAt)}</p>
            <p>Last Updated: {formatDate(agent.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Try Before Buy Feature */}
      {user && user.role === 'business_user' && (
        <div className="try-before-buy-section">
          {showTryBeforeBuy ? (
            <TryBeforeBuy agent={agent} />
          ) : (
            <div className="try-before-buy-banner">
              <div>
                <h2>Want to test this agent before subscribing?</h2>
                <p>Try our interactive sandbox to see how this agent works with your data.</p>
              </div>
              <button 
                className="try-button" 
                onClick={() => setShowTryBeforeBuy(true)}
              >
                Try Now
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Ratings & Reviews Feature */}
      {user && (user.role === 'business_user' || user.role === 'developer') && (
        <AgentRatings agent={agent} />
      )}

      <div className="agent-technical-details">
        <h2>Technical Details</h2>
        {agent.integrationDetails && (
          <div className="integration-details-section">
            <h3>Integration Details</h3>
            <p><strong>Type:</strong> {agent.integrationDetails.type?.replace('_', ' ')}</p>
            {agent.integrationDetails.apiUrl && <p><strong>API URL:</strong> <code>{agent.integrationDetails.apiUrl}</code></p>}
            {agent.integrationDetails.externalDocumentationLink && (
              <p>
                <strong>Documentation:</strong> 
                <a href={agent.integrationDetails.externalDocumentationLink} target="_blank" rel="noopener noreferrer">
                  {agent.integrationDetails.externalDocumentationLink}
                </a>
              </p>
            )}
            {agent.integrationDetails.instructions && <p><strong>Instructions:</strong> {agent.integrationDetails.instructions}</p>}
            
            {agent.integrationDetails.authentication && (
              <div className="authentication-details-subsection">
                <h4>Authentication</h4>
                <p><strong>Method:</strong> {agent.integrationDetails.authentication.type?.replace('_', ' ')}</p>
                {agent.integrationDetails.authentication.type === 'API_KEY' && agent.integrationDetails.authentication.apiKeyDetails && (
                  <p>
                    <strong>API Key Info:</strong> Send as {agent.integrationDetails.authentication.apiKeyDetails.in?.toLowerCase()} 
                    with name/header <code>{agent.integrationDetails.authentication.apiKeyDetails.name}</code>.
                  </p>
                )}
                {agent.integrationDetails.authentication.type === 'BEARER_TOKEN' && (
                  <p><strong>Token Info:</strong> A Bearer Token is required in the Authorization header.</p>
                )}
              </div>
            )}
          </div>
        )}

        {agent.defaultConfig && (
          <div className="default-config-section">
            <h3>Default Configuration</h3>
            {(() => {
              try {
                const parsedConfig = JSON.parse(agent.defaultConfig);
                return <pre><code>{JSON.stringify(parsedConfig, null, 2)}</code></pre>;
              } catch (e) {
                return <p>Could not parse default configuration. Raw value: <pre><code>{agent.defaultConfig}</code></pre></p>;
              }
            })()}
          </div>
        )}

        {agent.sandbox && (
          <div className="sandbox-details-section">
            <h3>Sandbox</h3>
            <p>Enabled: {agent.sandbox.isEnabled ? 'Yes' : 'No'}</p>
            {agent.sandbox.testInstructions && <p>Test Instructions: {agent.sandbox.testInstructions}</p>}
            {agent.sandbox.isEnabled && (
              <Link to={`/agent/${agentId}/sandbox`} className="sandbox-test-button">
                Test in Sandbox
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default AgentDetailPage;
