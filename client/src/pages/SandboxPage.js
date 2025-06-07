import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AGENT_DETAILS } from '../graphql/queries';
import { EXECUTE_AGENT_SANDBOX_TEST } from '../graphql/mutations'; 
import './SandboxPage.css'; // We'll create this CSS file later

const SandboxPage = () => {
  const { agentId } = useParams();
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [httpMethod, setHttpMethod] = useState('POST');

  const { loading: agentLoading, error: agentError, data: agentData } = useQuery(GET_AGENT_DETAILS, {
    variables: { agentId },
  });

  const [executeTest, { loading: mutationLoading, error: mutationError }] = useMutation(EXECUTE_AGENT_SANDBOX_TEST);

  const handleRunTest = async () => {
    if (!testInput.trim()) {
      alert('Please provide test input.');
      return;
    }
    setIsTesting(true);
    setTestOutput(null);
    try {
      const { data: mutationData } = await executeTest({
        variables: { agentId, testInput, httpMethod }, // testInput is already a string
      });
      // The backend resolver returns 'response' as a JSON string, so parse it here
      if (mutationData?.executeAgentSandboxTest?.response) {
        try {
          const parsedResponse = JSON.parse(mutationData.executeAgentSandboxTest.response);
          setTestOutput({ 
            ...mutationData.executeAgentSandboxTest,
            response: parsedResponse 
          });
        } catch (parseError) {
          console.error('Error parsing sandbox test response:', parseError);
          setTestOutput({ 
            success: false, 
            response: null, 
            error: 'Failed to parse agent response.' 
          });
        }
      } else {
        setTestOutput(mutationData.executeAgentSandboxTest);
      }
    } catch (e) {
      console.error('Error executing sandbox test:', e);
      setTestOutput({ success: false, response: null, error: e.message });
    }
    setIsTesting(false);
  };

  if (agentLoading) return <p>Loading agent details for sandbox...</p>;
  if (agentError) return <p>Error loading agent details: {agentError.message}</p>;

  const agent = agentData?.agent;

  if (!agent) return <p>Agent not found.</p>;
  if (!agent.sandbox?.isEnabled) {
    return (
      <div className="sandbox-page">
        <h2>Sandbox Not Enabled</h2>
        <p>The sandbox is not enabled for this agent.</p>
        <Link to={`/agent/${agentId}`}> Back to Agent Details</Link>
      </div>
    );
  }

  return (
    <div className="sandbox-page">
      <Link to={`/agent/${agentId}`} className="back-link"> Back to Agent Details</Link>
      <h1>Test Sandbox: {agent.name}</h1>
      
      <div className="sandbox-instructions">
        <h2>Test Instructions</h2>
        <p>{agent.sandbox.testInstructions || 'No specific test instructions provided.'}</p>
      </div>

      <div className="sandbox-interactive-area">
        <h2>Test Input</h2>
        
        <div className="form-group">
          <label htmlFor="httpMethod">HTTP Method:</label>
          <select 
            id="httpMethod" 
            value={httpMethod} 
            onChange={(e) => setHttpMethod(e.target.value)}
            disabled={isTesting || mutationLoading}
          >
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="testInputArea">
            {httpMethod === 'POST' 
              ? 'Request Body (JSON format recommended):' 
              : 'Query Parameters (JSON format, e.g., { "param1": "value1", "param2": "value2" }):'}
          </label>
          <textarea
            id="testInputArea"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder={httpMethod === 'POST' 
              ? 'Enter request body here...' 
              : 'Enter query parameters as JSON object here...'}
            rows="10"
            disabled={isTesting || mutationLoading}
          />
        </div>
        <button onClick={handleRunTest} disabled={isTesting || mutationLoading}>
          {isTesting || mutationLoading ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      {mutationError && <p className="error-message">Error during test: {mutationError.message}</p>}
      
      {testOutput && (
        <div className="sandbox-output-area">
          <h2>Test Result</h2>
          <p>Status: {testOutput.success ? 'Success' : 'Failed'}</p>
          {testOutput.error && <p className="error-message">Error: {testOutput.error}</p>}
          {testOutput.response && (
            <div>
              <h3>Agent Response:</h3>
              <pre>{typeof testOutput.response === 'string' ? testOutput.response : JSON.stringify(testOutput.response, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SandboxPage;