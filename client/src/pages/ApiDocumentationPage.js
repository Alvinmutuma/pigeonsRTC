import React from 'react';
import { Link } from 'react-router-dom';
import './Documentation.css';

function ApiDocumentationPage() {
  return (
    <div className="documentation-container">
      <div className="disclaimer-banner">
        <h3>Developer Preview</h3>
        <p>This API Documentation is a demonstration of upcoming features and is not yet ready for production use. The endpoints, authentication methods, and functionalities shown here are for preview purposes only.</p>
      </div>
      
      <div className="documentation-header">
        <h1>API Documentation</h1>
        <p className="subtitle">Learn how to integrate with our agents</p>
      </div>
      
      <div className="documentation-content">
        <div className="sidebar">
          <nav className="doc-nav">
            <ul>
              <li><a href="#getting-started">Getting Started</a></li>
              <li><a href="#authentication">Authentication</a></li>
              <li><a href="#endpoints">API Endpoints</a></li>
              <li><a href="#examples">Code Examples</a></li>
              <li><a href="#sdk">SDK References</a></li>
              <li><a href="#webhook">Webhooks</a></li>
              <li><a href="#troubleshooting">Troubleshooting</a></li>
            </ul>
          </nav>
        </div>
        
        <div className="main-content">
          <section id="getting-started">
            <h2>Getting Started</h2>
            <p>Welcome to the Agent API documentation. Follow these steps to get started with integrating our AI agents into your applications.</p>
            
            <h3>Prerequisites</h3>
            <ul>
              <li>An active developer account</li>
              <li>At least one published agent</li>
              <li>API key (generate from your developer settings)</li>
            </ul>
            
            <div className="code-box">
              <pre>
                <code>
{`// Sample initialization code
const PigeonAI = require('pigeon-ai-sdk');

const client = new PigeonAI.Client({ 
  apiKey: 'your-api-key',
  environment: 'production' 
});`}
                </code>
              </pre>
            </div>
          </section>
          
          <section id="authentication">
            <h2>Authentication</h2>
            <p>All API requests require authentication using your API key. You can generate and manage your API keys in the Developer Dashboard.</p>
            
            <div className="info-box">
              <h4>Important</h4>
              <p>Keep your API keys secure and never expose them in client-side code. Use environment variables or a secure vault.</p>
            </div>
            
            <h3>API Key Authentication</h3>
            <p>Pass your API key in the request header:</p>
            
            <div className="code-box">
              <pre>
                <code>
{`// Example API request with authentication
fetch('https://api.pigeon.ai/v1/agents', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`}
                </code>
              </pre>
            </div>
          </section>
          
          <section id="endpoints">
            <h2>API Endpoints</h2>
            <p>Our API follows RESTful principles with JSON-formatted requests and responses.</p>
            
            <h3>Base URL</h3>
            <p><code>https://api.pigeon.ai/v1</code></p>
            
            <table className="endpoints-table">
              <thead>
                <tr>
                  <th>Endpoint</th>
                  <th>Method</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>/agents</code></td>
                  <td>GET</td>
                  <td>List all your agents</td>
                </tr>
                <tr>
                  <td><code>/agents/{'{agent_id}'}</code></td>
                  <td>GET</td>
                  <td>Get a specific agent</td>
                </tr>
                <tr>
                  <td><code>/agents/{'{agent_id}'}/invoke</code></td>
                  <td>POST</td>
                  <td>Run an agent with input</td>
                </tr>
                <tr>
                  <td><code>/conversations</code></td>
                  <td>GET</td>
                  <td>List agent conversations</td>
                </tr>
                <tr>
                  <td><code>/usage</code></td>
                  <td>GET</td>
                  <td>Get API usage statistics</td>
                </tr>
              </tbody>
            </table>
          </section>
          
          <section id="examples">
            <h2>Code Examples</h2>
            
            <h3>Invoking an Agent</h3>
            <div className="code-box">
              <pre>
                <code>
{`// JavaScript example
const response = await client.agents.invoke({
  agentId: 'agent_123abc',
  input: {
    message: 'How can I improve my website conversion rate?',
    context: {
      industry: 'ecommerce',
      currentRate: '2.4%'
    }
  }
});

console.log(response.output);`}
                </code>
              </pre>
            </div>
            
            <div className="language-tabs">
              <button className="active">JavaScript</button>
              <button>Python</button>
              <button>Ruby</button>
              <button>PHP</button>
              <button>Java</button>
            </div>
          </section>
          
          <section id="sdk">
            <h2>SDK References</h2>
            <p>We provide official SDKs for several programming languages to make integration easier.</p>
            
            <div className="sdk-cards">
              <div className="sdk-card">
                <h3>JavaScript</h3>
                <p>npm install pigeon-ai-sdk</p>
                <Link to="/api-documentation/javascript" className="doc-link">View Documentation</Link>
              </div>
              <div className="sdk-card">
                <h3>Python</h3>
                <p>pip install pigeon-ai</p>
                <Link to="/api-documentation/python" className="doc-link">View Documentation</Link>
              </div>
              <div className="sdk-card">
                <h3>Ruby</h3>
                <p>gem install pigeon-ai</p>
                <Link to="/api-documentation/ruby" className="doc-link">View Documentation</Link>
              </div>
            </div>
          </section>
          
          <section id="webhook">
            <h2>Webhooks</h2>
            <p>Set up webhooks to receive notifications about events related to your agents.</p>
            
            <h3>Available Event Types</h3>
            <ul>
              <li><code>agent.invoked</code> - When an agent is run</li>
              <li><code>conversation.created</code> - When a new conversation starts</li>
              <li><code>feedback.received</code> - When users provide feedback</li>
              <li><code>quota.exceeded</code> - When you approach or exceed usage limits</li>
            </ul>
            
            <h3>Webhook Configuration</h3>
            <p>Configure webhooks in the <Link to="/developer-dashboard" className="inline-link">Developer Dashboard</Link> under API Settings.</p>
          </section>
          
          <section id="troubleshooting">
            <h2>Troubleshooting</h2>
            <p>Common issues and solutions when integrating with our API.</p>
            
            <h3>API Status</h3>
            <p>Check our <Link to="/api-status" className="inline-link">Status Page</Link> for real-time information about API availability.</p>
            
            <h3>Common Error Codes</h3>
            <table className="endpoints-table">
              <thead>
                <tr>
                  <th>Error Code</th>
                  <th>Description</th>
                  <th>Resolution</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>401</td>
                  <td>Unauthorized</td>
                  <td>Check your API key is valid and properly formatted</td>
                </tr>
                <tr>
                  <td>403</td>
                  <td>Forbidden</td>
                  <td>Verify you have permission for the requested resource</td>
                </tr>
                <tr>
                  <td>429</td>
                  <td>Rate Limit Exceeded</td>
                  <td>Implement backoff strategies or upgrade your plan</td>
                </tr>
              </tbody>
            </table>
            
            <div className="support-box">
              <h3>Need Help?</h3>
              <p>Our developer support team is available to assist you with API integration.</p>
              <Link to="/contact" className="btn doc-btn">Contact Support</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ApiDocumentationPage;
