import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { CREATE_AGENT } from '../graphql/mutations';
import { GET_AGENTS_FOR_DISPLAY } from '../graphql/queries'; // To update cache
import './CreateAgentPage.css';

const CreateAgentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    useCases: '', // Comma-separated string, will be converted to array
    pricingType: 'FREE', // Default pricing type
    pricingAmount: '',   // Amount for SUBSCRIPTION or PAY_PER_USE
    pricingCurrency: 'USD', // Currency for SUBSCRIPTION or PAY_PER_USE
    pricingDetails: '',  // Additional details for pricing
    // status: 'pending_approval', // Defaulted by backend if not provided
    integrationType: 'api', // Default value
    integrationApiUrl: '',
    integrationInstructions: '',
    integrationExternalDocumentationLink: '', // New field for external documentation link
    // --- New Authentication Fields ---
    authType: 'NONE', // Options: 'NONE', 'API_KEY', 'BEARER_TOKEN'
    apiKey: '',
    apiKeyIn: 'HEADER', // Options: 'HEADER', 'QUERY'
    apiKeyName: '', // e.g., 'X-API-Key' or 'api_key'
    bearerToken: '',
    // --- End New Authentication Fields ---
    sandboxIsEnabled: false,
    sandboxTestInstructions: '',
    customizationGuide: '',
    defaultConfig: '', // New field for default configuration (JSON string)
    tags: '', // Comma-separated string, will be converted to array
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [createAgent, { loading, error }] = useMutation(CREATE_AGENT, {
    // Option 1: Refetch queries after mutation (simpler)
    refetchQueries: [{ query: GET_AGENTS_FOR_DISPLAY }],
    // Option 2: Update cache directly (more complex, but more performant for some cases)
    // update: (cache, { data: { createAgent: newAgent } }) => {
    //   try {
    //     const { agents } = cache.readQuery({ query: GET_AGENTS_FOR_DISPLAY });
    //     cache.writeQuery({
    //       query: GET_AGENTS_FOR_DISPLAY,
    //       data: { agents: agents.concat([newAgent]) },
    //     });
    //   } catch (e) {
    //     console.warn('Could not update agent list cache after creation:', e);
    //   }
    // },
    onCompleted: (data) => {
      setFormSuccess(`Agent '${data.createAgent.name}' created successfully! Redirecting...`);
      setFormError('');
      // Redirect to the new agent's detail page or listings page
      setTimeout(() => navigate(`/agent/${data.createAgent.id}`), 2000);
    },
    onError: (err) => {
      setFormError(`Error creating agent: ${err.message}`);
      setFormSuccess('');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Basic validation (can be expanded)
    if (!formData.name || !formData.description || !formData.category || !formData.integrationType) {
      setFormError('Name, Description, Category, and Integration Type are required.');
      return;
    }

    // New Pricing Validation
    if ((formData.pricingType === 'SUBSCRIPTION' || formData.pricingType === 'PAY_PER_USE')) {
      if (formData.pricingAmount === '' || parseFloat(formData.pricingAmount) < 0) {
        setFormError('Amount is required and cannot be negative for Subscription or Pay Per Use pricing.');
        return;
      }
      if (!formData.pricingCurrency.trim()) {
        setFormError('Currency is required for Subscription or Pay Per Use pricing.');
        return;
      }
    }

    if (formData.authType === 'API_KEY' && (!formData.apiKey || !formData.apiKeyName)) {
      setFormError('For API Key authentication, the Key and Name are required.');
      return;
    }
    if (formData.authType === 'BEARER_TOKEN' && !formData.bearerToken) {
      setFormError('For Bearer Token authentication, the Token is required.');
      return;
    }
    // Validate defaultConfig is valid JSON if provided
    if (formData.defaultConfig && formData.defaultConfig.trim() !== '') {
      try {
        JSON.parse(formData.defaultConfig);
      } catch (e) {
        setFormError('Default Configuration must be a valid JSON string.');
        return;
      }
    }

    // Construct the authentication object based on authType
    let authenticationObject = { type: formData.authType };
    if (formData.authType === 'API_KEY') {
      authenticationObject.apiKeyDetails = {
        key: formData.apiKey,
        in: formData.apiKeyIn,
        name: formData.apiKeyName,
      };
    } else if (formData.authType === 'BEARER_TOKEN') {
      authenticationObject.bearerTokenDetails = {
        token: formData.bearerToken,
      };
    }

    const input = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      useCases: formData.useCases ? formData.useCases.split(',').map(uc => uc.trim()).filter(uc => uc) : [],
      pricing: {
        type: formData.pricingType,
        amount: (formData.pricingType === 'SUBSCRIPTION' || formData.pricingType === 'PAY_PER_USE') && formData.pricingAmount !== '' 
                  ? parseFloat(formData.pricingAmount) 
                  : null,
        currency: (formData.pricingType === 'SUBSCRIPTION' || formData.pricingType === 'PAY_PER_USE') && formData.pricingAmount !== '' 
                    ? formData.pricingCurrency 
                    : null,
        details: formData.pricingDetails,
      },
      integrationDetails: {
        type: formData.integrationType,
        apiUrl: formData.integrationApiUrl || null, // Send null if empty for optional fields
        instructions: formData.integrationInstructions || null,
        externalDocumentationLink: formData.integrationExternalDocumentationLink || null, // Add new field here
        authentication: authenticationObject,
      },
      sandbox: {
        isEnabled: formData.sandboxIsEnabled,
        testInstructions: formData.sandboxTestInstructions || null,
      },
      customizationGuide: formData.customizationGuide || null,
      defaultConfig: formData.defaultConfig || null, // Add defaultConfig
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    // Clean up optional top-level fields if they are effectively null or empty arrays
    if (!input.useCases.length) delete input.useCases;
    if (!input.tags.length) delete input.tags;

    // Note: The previous logic for deleting optional empty strings like integrationApiUrl, etc.
    // is now handled by sending 'null' for those fields within their respective objects (integrationDetails, sandbox).
    // The GraphQL schema should define these as nullable for this to work seamlessly.

    try {
      console.log('Submitting with input:', JSON.stringify(input, null, 2)); // For debugging
      await createAgent({ variables: { input } });
    } catch (err) {
      // Error is handled by onError callback of useMutation
      console.error('Submission error:', err); // Log for debugging
    }
  };

  return (
    <div className="create-agent-page">
      <h2>Create New AI Agent</h2>
      <form onSubmit={handleSubmit} className="create-agent-form">
        
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label htmlFor="name">Agent Name<span>*</span></label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description<span>*</span></label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category<span>*</span></label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input type="text" id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., productivity, AI, summarizer"/>
          </div>
           <div className="form-group">
            <label htmlFor="useCases">Use Cases (comma-separated)</label>
            <textarea id="useCases" name="useCases" value={formData.useCases} onChange={handleChange} placeholder="e.g., summarize articles, translate text" />
          </div>
        </div>

        <div className="form-section">
          <h3>Default Configuration (Optional)</h3>
          <div className="form-group">
            <label htmlFor="defaultConfig">Default Configuration (JSON format)</label>
            <textarea 
              id="defaultConfig" 
              name="defaultConfig" 
              value={formData.defaultConfig} 
              onChange={handleChange} 
              rows="5" 
              placeholder='e.g., {\n  "prompt_template": "Translate the following text to Spanish: {{text}}",\n  "temperature": 0.7,\n  "max_tokens": 150\n}'
            />
            <small>Enter a valid JSON string defining default parameters for your agent.</small>
          </div>
        </div>

        <div className="form-section">
          <h3>Pricing</h3>
          <div className="form-group">
            <label htmlFor="pricingType">Pricing Type</label>
            <select id="pricingType" name="pricingType" value={formData.pricingType} onChange={(e) => {
              // Set default amount for subscription
              if (e.target.value === 'SUBSCRIPTION' && !formData.pricingAmount) {
                setFormData({
                  ...formData,
                  pricingType: e.target.value,
                  pricingAmount: '29',  // Default to $29 for subscription
                  pricingDetails: formData.pricingDetails || 'Monthly subscription'
                });
              } else {
                handleChange(e);
              }
            }}>
              <option value="FREE">Free</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="PAY_PER_USE">Pay Per Use</option>
              <option value="CONTACT_SALES">Contact Sales</option>
            </select>
          </div>

          {(formData.pricingType === 'SUBSCRIPTION' || formData.pricingType === 'PAY_PER_USE') && (
            <>
              <div className="form-group">
                <label htmlFor="pricingAmount">Amount</label>
                <input type="number" id="pricingAmount" name="pricingAmount" value={formData.pricingAmount} onChange={handleChange} placeholder="e.g., 10.00" min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="pricingCurrency">Currency</label>
                <input type="text" id="pricingCurrency" name="pricingCurrency" value={formData.pricingCurrency} onChange={handleChange} placeholder="e.g., USD" />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="pricingDetails">Pricing Details (Optional)</label>
            <textarea id="pricingDetails" name="pricingDetails" value={formData.pricingDetails} onChange={handleChange} placeholder="e.g., Billed monthly, or $0.01 per API call" />
          </div>
        </div>

        <div className="form-section">
          <h3>Integration Details</h3>
          <div className="form-group">
            <label htmlFor="integrationType">Integration Type<span>*</span></label>
            <select id="integrationType" name="integrationType" value={formData.integrationType} onChange={handleChange} required>
              <option value="api">API</option>
              <option value="slack_plugin">Slack Plugin</option>
              <option value="website_widget">Website Widget</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="integrationApiUrl">API URL (if type is API)</label>
            <input type="url" id="integrationApiUrl" name="integrationApiUrl" value={formData.integrationApiUrl} onChange={handleChange} placeholder="https://api.example.com/agent" />
          </div>
          <div className="form-group">
            <label htmlFor="integrationExternalDocumentationLink">External Documentation Link (Optional)</label>
            <input type="url" id="integrationExternalDocumentationLink" name="integrationExternalDocumentationLink" value={formData.integrationExternalDocumentationLink} onChange={handleChange} placeholder="https://docs.example.com/agent-integration" />
          </div>
          <div className="form-group">
            <label htmlFor="integrationInstructions">Integration Instructions</label>
            <textarea id="integrationInstructions" name="integrationInstructions" value={formData.integrationInstructions} onChange={handleChange} />
          </div>
        </div>

        <div className="form-section">
          <h3>Authentication Details</h3>
          <div className="form-group">
            <label htmlFor="authType">Authentication Type</label>
            <select id="authType" name="authType" value={formData.authType} onChange={handleChange}>
              <option value="NONE">None</option>
              <option value="API_KEY">API Key</option>
              <option value="BEARER_TOKEN">Bearer Token</option>
            </select>
          </div>
          {formData.authType === 'API_KEY' && (
            <div>
              <div className="form-group">
                <label htmlFor="apiKey">API Key</label>
                <input type="text" id="apiKey" name="apiKey" value={formData.apiKey} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="apiKeyIn">API Key Location</label>
                <select id="apiKeyIn" name="apiKeyIn" value={formData.apiKeyIn} onChange={handleChange}>
                  <option value="HEADER">Header</option>
                  <option value="QUERY">Query Parameter</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="apiKeyName">API Key Name</label>
                <input type="text" id="apiKeyName" name="apiKeyName" value={formData.apiKeyName} onChange={handleChange} placeholder="e.g., X-API-Key or api_key" />
              </div>
            </div>
          )}
          {formData.authType === 'BEARER_TOKEN' && (
            <div className="form-group">
              <label htmlFor="bearerToken">Bearer Token</label>
              <input type="text" id="bearerToken" name="bearerToken" value={formData.bearerToken} onChange={handleChange} />
            </div>
          )}
        </div>

        <div className="form-section">
          <h3>Sandbox Environment</h3>
           <div className="form-group form-group-checkbox">
            <input type="checkbox" id="sandboxIsEnabled" name="sandboxIsEnabled" checked={formData.sandboxIsEnabled} onChange={handleChange} />
            <label htmlFor="sandboxIsEnabled">Enable Sandbox</label>
          </div>
          <div className="form-group">
            <label htmlFor="sandboxTestInstructions">Sandbox Test Instructions</label>
            <textarea id="sandboxTestInstructions" name="sandboxTestInstructions" value={formData.sandboxTestInstructions} onChange={handleChange} disabled={!formData.sandboxIsEnabled} />
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label htmlFor="customizationGuide">Customization Guide</label>
            <textarea id="customizationGuide" name="customizationGuide" value={formData.customizationGuide} onChange={handleChange} />
          </div>
        </div>

        {formError && <p className="error-message">{formError}</p>}
        {error && <p className="error-message">Mutation Error: {error.message}</p>} {/* Display mutation hook error */}
        {formSuccess && <p className="success-message">{formSuccess}</p>}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating Agent...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
};

export default CreateAgentPage;
