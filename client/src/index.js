import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You might want to create this for global styles
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { 
  ApolloClient, 
  InMemoryCache, 
  ApolloProvider, 
  createHttpLink,
  from,
  ApolloLink 
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom'; 
// import reportWebVitals from './reportWebVitals'; // Optional: for performance measuring

// HTTP connection to the API
// First check for runtime config from config.js, then fall back to env vars
const runtimeApiUrl = window.RUNTIME_CONFIG?.API_URL;
const envApiUrl = process.env.REACT_APP_API_URL;
const apiUrl = runtimeApiUrl || envApiUrl;

console.log('API URL being used:', apiUrl); // Debug log

// HTTP connection to the API
const httpLink = createHttpLink({
  // Use runtime config or environment variable for production/staging
  // For local development, fall back to localhost
  uri: apiUrl ? 
    `${(apiUrl.startsWith('localhost') || apiUrl.startsWith('127.0.0.1')) ? 'http://' : 'https://'}${apiUrl}/graphql` : 
    'http://localhost:4010/graphql', // Fallback to localhost:4010 if not set
});

// Error handling link with detailed logging
const errorLink = onError(({ graphQLErrors, networkError, operation, response }) => {
  console.log('=== APOLLO ERROR INTERCEPTOR ===');
  console.log('Operation:', {
    name: operation.operationName,
    variables: operation.variables,
    query: operation.query.loc?.source.body,
  });
  
  if (graphQLErrors) {
    console.error('GraphQL Errors:');
    graphQLErrors.forEach((err, index) => {
      console.error(`Error ${index + 1}:`, {
        message: err.message,
        locations: err.locations,
        path: err.path,
        extensions: err.extensions,
        stack: err.stack
      });
    });
  }

  if (networkError) {
    console.error('Network Error:', {
      message: networkError.message,
      statusCode: networkError.statusCode,
      response: networkError.response,
      stack: networkError.stack,
      bodyText: networkError.bodyText
    });
    
    // Log the complete request details that caused the error
    console.log('Failed Request Details:', {
      operationName: operation.operationName,
      variables: JSON.stringify(operation.variables, null, 2),
      query: operation.query.loc?.source.body
    });
  }
  
  if (response) {
    console.log('Apollo Response:', response);
  }
});

// Middleware for attaching JWT token to requests with detailed logging
const authLink = setContext((operation, { headers }) => {
  // Get the token from local storage
  const token = localStorage.getItem('token');
  
  // Log the token being used (but mask most of it for security)
  if (token) {
    const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 5);
    console.log(`Adding auth token to ${operation.operationName}:`, maskedToken);
  } else {
    console.warn(`No auth token found for operation: ${operation.operationName}`);
  }
  
  // Create headers with authorization
  const authHeaders = {
    ...headers,
    authorization: token ? `Bearer ${token}` : "",
  };
  
  console.log(`Auth headers for ${operation.operationName}:`, {...authHeaders, authorization: '[MASKED]'});
  
  // Return the headers to the context
  return {
    headers: authHeaders
  };
});

// Adding request logging link
const requestLogger = new ApolloLink((operation, forward) => {
  console.group(`GraphQL Request: ${operation.operationName}`);
  console.log('Operation:', operation.operationName);
  console.log('Variables:', operation.variables);
  // Get the query as a string
  const query = operation.query.loc?.source.body;
  console.log('Query:', query);
  console.groupEnd();
  
  return forward(operation).map((response) => {
    console.group(`GraphQL Response: ${operation.operationName}`);
    console.log('Response data:', response.data);
    console.log('Response errors:', response.errors);
    console.groupEnd();
    return response;
  });
});

// Configure Apollo Client with the authLink, errorLink and httpLink
const client = new ApolloClient({
  link: from([errorLink, requestLogger, authLink, httpLink]), // Chain the links in order
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <ApolloProvider client={client}>
        <Router>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Router>
      </ApolloProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
