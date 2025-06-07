import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRocket, FaCode, FaInfoCircle } from 'react-icons/fa';
import './TryBeforeBuy.css';

const TryBeforeBuy = ({ agent }) => {
  const [activeTab, setActiveTab] = useState('demo');
  const [demoInput, setDemoInput] = useState('');
  const [demoOutput, setDemoOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample demo data based on agent category
  const getSampleData = () => {
    const samples = {
      'Customer Support': {
        input: '{"query": "How do I reset my password?"}',
        output: {
          response: "To reset your password, click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password.",
          confidence: 0.95,
          suggested_followup: "Would you like me to help you with anything else related to your account?"
        }
      },
      'Data Analysis': {
        input: '{"dataset": "sales_q2", "metric": "growth", "compare_to": "q1"}',
        output: {
          analysis: "Q2 sales show 12.3% growth compared to Q1. Top performing regions: West (+18.2%), North (+14.5%).",
          visualization_url: "https://example.com/chart/sales_q2_growth",
          anomalies: ["Unusual spike in product category 'Electronics' in June"]
        }
      },
      'Content Creation': {
        input: '{"topic": "AI in healthcare", "format": "blog post", "tone": "informative"}',
        output: {
          title: "5 Ways AI is Transforming Modern Healthcare",
          intro: "Artificial intelligence is revolutionizing healthcare delivery across the globe, from diagnosis to treatment planning...",
          outline: ["Current applications", "Patient benefits", "Implementation challenges", "Future directions", "Ethical considerations"],
          keywords: ["healthcare AI", "medical diagnosis", "patient care", "predictive analytics"]
        }
      },
      default: {
        input: '{"query": "Sample request for this agent"}',
        output: {
          response: "This is a simulated response from the agent. In a real integration, you would receive actual data based on your input.",
          status: "success"
        }
      }
    };

    return samples[agent?.category] || samples.default;
  };

  const handleRunDemo = () => {
    setIsLoading(true);
    setError(null);

    // Validate JSON input
    try {
      JSON.parse(demoInput);
    } catch (e) {
      setError("Invalid JSON format. Please check your input.");
      setIsLoading(false);
      return;
    }

    // Simulate API call with timeout
    setTimeout(() => {
      try {
        const sampleData = getSampleData();
        setDemoOutput(sampleData.output);
        setIsLoading(false);
      } catch (err) {
        setError("An error occurred while processing your request.");
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleLoadSample = () => {
    const sampleData = getSampleData();
    setDemoInput(sampleData.input);
  };

  return (
    <div className="try-before-buy">
      <div className="try-before-buy-header">
        <h2>Try Before You Buy</h2>
        <p>Test this agent with sample data before subscribing</p>
      </div>

      <div className="try-before-buy-tabs">
        <button 
          className={`tab ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          <FaRocket /> Interactive Demo
        </button>
        <button 
          className={`tab ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          <FaCode /> Code Example
        </button>
      </div>

      <div className="try-before-buy-content">
        {activeTab === 'demo' && (
          <div className="demo-container">
            <div className="input-section">
              <div className="input-header">
                <h3>Request</h3>
                <button className="sample-button" onClick={handleLoadSample}>
                  Load Sample
                </button>
              </div>
              <textarea
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Enter your JSON request..."
                className="demo-input"
              />
              <button 
                className="run-button" 
                onClick={handleRunDemo}
                disabled={isLoading || !demoInput.trim()}
              >
                {isLoading ? 'Processing...' : 'Run Test'}
              </button>
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="output-section">
              <h3>Response</h3>
              {isLoading ? (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Processing request...</p>
                </div>
              ) : demoOutput ? (
                <pre className="demo-output">
                  {JSON.stringify(demoOutput, null, 2)}
                </pre>
              ) : (
                <div className="empty-output">
                  <FaInfoCircle />
                  <p>Run the test to see the response</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="code-container">
            <div className="code-example">
              <h3>Integration Example</h3>
              <div className="code-tabs">
                <button className="code-tab active">JavaScript</button>
                <button className="code-tab">Python</button>
                <button className="code-tab">cURL</button>
              </div>
              <pre className="code-block">
{`// JavaScript Example
const apiKey = 'YOUR_API_KEY';

async function callAgent(input) {
  try {
    const response = await fetch('${agent?.integrationDetails?.apiUrl || 'https://api.pigeonrtc.com/agents/'+agent?.id}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify(input)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling agent:', error);
    throw error;
  }
}

// Example usage
const input = ${getSampleData().input};
callAgent(input)
  .then(result => console.log(result))
  .catch(error => console.error(error));`}
              </pre>
            </div>
            <div className="code-notes">
              <h4>Notes</h4>
              <ul>
                <li>This is a simplified example. Your actual implementation may vary.</li>
                <li>You'll need to subscribe to get a valid API key.</li>
                <li>See the <Link to={`/agent/${agent?.id}/docs`}>full documentation</Link> for more details.</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="try-before-buy-footer">
        <p>Ready to use this agent in your application?</p>
        <Link to="/pricing" className="subscribe-button">
          Subscribe Now
        </Link>
      </div>
    </div>
  );
};

export default TryBeforeBuy;
