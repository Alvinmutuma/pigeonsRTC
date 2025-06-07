import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AGENT_DETAILS } from '../graphql/queries';
import { UPDATE_AGENT } from '../graphql/mutations';
import './EditAgentPage.css'; // We'll create this for styling

const EditAgentPage = () => {
  const { id } = useParams(); // Using id to match route parameter in App.js
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    useCases: '', // Will be converted to/from array
    price: '',
    integrationType: 'api', // Default value
    integrationApiUrl: '',
    integrationInstructions: '',
    sandboxIsEnabled: false,
    sandboxTestInstructions: '',
    customizationGuide: '',
    tags: '', // Will be converted to/from array
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: agentData, loading: queryLoading, error: queryError } = useQuery(GET_AGENT_DETAILS, {
    variables: { agentId: id },
    skip: !id, // Don't run query if id is not available
    onCompleted: (data) => {
      if (data && data.agent) {
        const { agent } = data;
        setFormData({
          name: agent.name || '',
          description: agent.description || '',
          category: agent.category || '',
          useCases: Array.isArray(agent.useCases) ? agent.useCases.join(', ') : '',
          price: agent.price !== null ? agent.price.toString() : '',
          integrationType: agent.integrationDetails?.type || 'api',
          integrationApiUrl: agent.integrationDetails?.apiUrl || '',
          integrationInstructions: agent.integrationDetails?.instructions || '',
          sandboxIsEnabled: agent.sandbox?.isEnabled || false,
          sandboxTestInstructions: agent.sandbox?.testInstructions || '',
          customizationGuide: agent.customizationGuide || '',
          tags: Array.isArray(agent.tags) ? agent.tags.join(', ') : '',
        });
      }
    },
  });

  const [updateAgent, { loading: mutationLoading }] = useMutation(UPDATE_AGENT, {
    onCompleted: (data) => {
      setSuccess('Agent updated successfully! Redirecting...');
      setError('');
      setTimeout(() => navigate(`/agent/${data.updateAgent.id}`), 2000);
    },
    onError: (err) => {
      setError(`Failed to update agent: ${err.message}`);
      setSuccess('');
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { useCases, tags, price, ...otherFormData } = formData;
    const priceFloat = parseFloat(price);

    if (isNaN(priceFloat) || priceFloat < 0) {
        setError('Price must be a non-negative number.');
        return;
    }

    const submissionData = {
        ...otherFormData,
        price: priceFloat,
        ...(useCases && { useCases: useCases.split(',').map(uc => uc.trim()).filter(uc => uc) }),
        ...(tags && { tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) }),
    };

    // Remove fields that are empty or should not be sent if not changed to avoid sending nulls for unchanged optional fields
    // The backend resolver handles undefined fields by not updating them.
    Object.keys(submissionData).forEach(key => {
      if (submissionData[key] === '' || submissionData[key] === null) {
        // For optional fields, if they are empty, we might not want to send them
        // For this example, we send them, and the resolver should handle it.
        // Alternatively, delete submissionData[key]; if you want to avoid sending empty strings for optional fields.
      }
    });

    try {
      await updateAgent({ variables: { agentId: id, input: submissionData } });
    } catch (err) { 
      // Error already handled by onError in useMutation
      console.error('Submission error:', err); // For debugging
    }
  };

  if (queryLoading) return <p>Loading agent details...</p>;
  if (queryError) return <p>Error loading agent details: {queryError.message}</p>;
  if (!agentData && !queryLoading) return <p>No agent data found.</p>; 

  return (
    <div className="edit-agent-page">
      <h2>Edit Agent: {formData.name || 'Loading...'}</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit} className="agent-form">
        {/* Form fields will be similar to CreateAgentPage, but pre-filled */}
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Agent Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required />
        </div>

        {/* Use Cases */}
        <div className="form-group">
          <label htmlFor="useCases">Use Cases (comma-separated)</label>
          <input type="text" id="useCases" name="useCases" value={formData.useCases} onChange={handleChange} />
        </div>

        {/* Price */}
        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"/>
        </div>

        {/* Integration Type */}
        <div className="form-group">
          <label htmlFor="integrationType">Integration Type *</label>
          <select id="integrationType" name="integrationType" value={formData.integrationType} onChange={handleChange} required>
            <option value="api">API</option>
            <option value="slack_plugin">Slack Plugin</option>
            <option value="website_widget">Website Widget</option>
          </select>
        </div>

        {/* Integration API URL */}
        <div className="form-group">
          <label htmlFor="integrationApiUrl">API URL (if type is API)</label>
          <input type="url" id="integrationApiUrl" name="integrationApiUrl" value={formData.integrationApiUrl} onChange={handleChange} />
        </div>

        {/* Integration Instructions */}
        <div className="form-group">
          <label htmlFor="integrationInstructions">Integration Instructions</label>
          <textarea id="integrationInstructions" name="integrationInstructions" value={formData.integrationInstructions} onChange={handleChange} />
        </div>

        {/* Sandbox Enabled */}
        <div className="form-group form-group-checkbox">
          <input type="checkbox" id="sandboxIsEnabled" name="sandboxIsEnabled" checked={formData.sandboxIsEnabled} onChange={handleChange} />
          <label htmlFor="sandboxIsEnabled">Enable Sandbox</label>
        </div>

        {/* Sandbox Test Instructions */}
        {formData.sandboxIsEnabled && (
          <div className="form-group">
            <label htmlFor="sandboxTestInstructions">Sandbox Test Instructions</label>
            <textarea id="sandboxTestInstructions" name="sandboxTestInstructions" value={formData.sandboxTestInstructions} onChange={handleChange} />
          </div>
        )}

        {/* Customization Guide */}
        <div className="form-group">
          <label htmlFor="customizationGuide">Customization Guide</label>
          <textarea id="customizationGuide" name="customizationGuide" value={formData.customizationGuide} onChange={handleChange} />
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} />
        </div>

        <button type="submit" disabled={mutationLoading} className="submit-button">
          {mutationLoading ? 'Updating Agent...' : 'Update Agent'}
        </button>
      </form>
    </div>
  );
};

export default EditAgentPage;
