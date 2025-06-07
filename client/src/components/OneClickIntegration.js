import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Chip
} from '@mui/material';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TestIcon from '@mui/icons-material/BugReport';
import DeleteIcon from '@mui/icons-material/Delete';
import SlackIcon from '@mui/icons-material/Telegram'; // Using Telegram as a placeholder for Slack
import HubspotIcon from '@mui/icons-material/Business';
import NotionIcon from '@mui/icons-material/Description';
import ZapierIcon from '@mui/icons-material/Bolt';
import TeamsIcon from '@mui/icons-material/Group';
import SalesforceIcon from '@mui/icons-material/CloudQueue';
import ZendeskIcon from '@mui/icons-material/Headset';
import CustomIcon from '@mui/icons-material/Settings';

// GraphQL Queries and Mutations
const GET_AVAILABLE_INTEGRATIONS = gql`
  query GetAvailableIntegrations {
    availableIntegrations
  }
`;

const GET_INTEGRATION_DETAILS = gql`
  query GetIntegrationDetails($type: IntegrationType!) {
    integrationDetails(type: $type) {
      type
      name
      description
      setupInstructions
      requiredFields
      optionalFields
      documentationUrl
    }
  }
`;

const SETUP_INTEGRATION = gql`
  mutation SetupIntegration($agentId: ID!, $integrationType: IntegrationType!, $input: IntegrationSetupInput!) {
    setupIntegration(agentId: $agentId, integrationType: $integrationType, input: $input) {
      success
      message
      error
      integrationDetails {
        type
        oneClickIntegrations {
          slack { enabled }
          hubspot { enabled }
          notion { enabled }
          zapier { enabled }
          microsoft_teams { enabled }
          salesforce { enabled }
          zendesk { enabled }
          custom { enabled }
        }
      }
    }
  }
`;

const TEST_INTEGRATION = gql`
  mutation TestIntegration($agentId: ID!, $integrationType: IntegrationType!) {
    testIntegration(agentId: $agentId, integrationType: $integrationType) {
      success
      message
      details
      error
    }
  }
`;

const REMOVE_INTEGRATION = gql`
  mutation RemoveIntegration($agentId: ID!, $integrationType: IntegrationType!) {
    removeIntegration(agentId: $agentId, integrationType: $integrationType) {
      id
      name
      integrationDetails {
        type
        oneClickIntegrations {
          slack { enabled }
          hubspot { enabled }
          notion { enabled }
          zapier { enabled }
          microsoft_teams { enabled }
          salesforce { enabled }
          zendesk { enabled }
          custom { enabled }
        }
      }
    }
  }
`;

// Helper function to get icon by integration type
const getIntegrationIcon = (type) => {
  switch (type) {
    case 'slack_plugin':
      return <SlackIcon />;
    case 'hubspot':
      return <HubspotIcon />;
    case 'notion':
      return <NotionIcon />;
    case 'zapier':
      return <ZapierIcon />;
    case 'microsoft_teams':
      return <TeamsIcon />;
    case 'salesforce':
      return <SalesforceIcon />;
    case 'zendesk':
      return <ZendeskIcon />;
    case 'custom':
      return <CustomIcon />;
    default:
      return <IntegrationInstructionsIcon />;
  }
};

// Helper function to get integration name
const getIntegrationName = (type) => {
  switch (type) {
    case 'slack_plugin':
      return 'Slack';
    case 'hubspot':
      return 'HubSpot';
    case 'notion':
      return 'Notion';
    case 'zapier':
      return 'Zapier';
    case 'microsoft_teams':
      return 'Microsoft Teams';
    case 'salesforce':
      return 'Salesforce';
    case 'zendesk':
      return 'Zendesk';
    case 'custom':
      return 'Custom Integration';
    case 'api':
      return 'API';
    case 'website_widget':
      return 'Website Widget';
    default:
      return type;
  }
};

const OneClickIntegration = ({ agentId, agentName, integrationDetails, isOwner, onIntegrationUpdate }) => {
  // State
  const [openSetupDialog, setOpenSetupDialog] = useState(false);
  const [selectedIntegrationType, setSelectedIntegrationType] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [testResult, setTestResult] = useState(null);

  // Get enabled integrations from props
  const enabledIntegrations = React.useMemo(() => {
    if (!integrationDetails?.oneClickIntegrations) return [];
    
    const enabled = [];
    const integrations = integrationDetails.oneClickIntegrations;
    
    if (integrations.slack?.enabled) enabled.push('slack_plugin');
    if (integrations.hubspot?.enabled) enabled.push('hubspot');
    if (integrations.notion?.enabled) enabled.push('notion');
    if (integrations.zapier?.enabled) enabled.push('zapier');
    if (integrations.microsoft_teams?.enabled) enabled.push('microsoft_teams');
    if (integrations.salesforce?.enabled) enabled.push('salesforce');
    if (integrations.zendesk?.enabled) enabled.push('zendesk');
    if (integrations.custom?.enabled) enabled.push('custom');
    
    return enabled;
  }, [integrationDetails]);

  // Queries
  const { loading: loadingIntegrations, error: errorIntegrations, data: integrationsData } = useQuery(GET_AVAILABLE_INTEGRATIONS);
  
  const { loading: loadingDetails, error: errorDetails, data: detailsData } = useQuery(GET_INTEGRATION_DETAILS, {
    variables: { type: selectedIntegrationType },
    skip: !selectedIntegrationType
  });

  // Mutations
  const [setupIntegration, { loading: settingUpIntegration }] = useMutation(SETUP_INTEGRATION, {
    onCompleted: (data) => {
      if (data.setupIntegration.success) {
        setSnackbar({ 
          open: true, 
          message: `${getIntegrationName(selectedIntegrationType)} integration set up successfully!`, 
          severity: 'success' 
        });
        if (onIntegrationUpdate) {
          onIntegrationUpdate(data.setupIntegration.integrationDetails);
        }
        handleCloseSetupDialog();
      } else {
        setSnackbar({ 
          open: true, 
          message: data.setupIntegration.error || 'Failed to set up integration', 
          severity: 'error' 
        });
      }
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: `Error setting up integration: ${error.message}`, 
        severity: 'error' 
      });
    }
  });

  const [testIntegration, { loading: testingIntegration }] = useMutation(TEST_INTEGRATION, {
    onCompleted: (data) => {
      setTestResult(data.testIntegration);
      setSnackbar({ 
        open: true, 
        message: data.testIntegration.success 
          ? 'Integration test successful!' 
          : `Test failed: ${data.testIntegration.error || 'Unknown error'}`, 
        severity: data.testIntegration.success ? 'success' : 'error' 
      });
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: `Error testing integration: ${error.message}`, 
        severity: 'error' 
      });
      setTestResult({ success: false, error: error.message });
    }
  });

  const [removeIntegration, { loading: removingIntegration }] = useMutation(REMOVE_INTEGRATION, {
    onCompleted: (data) => {
      setSnackbar({ 
        open: true, 
        message: `${getIntegrationName(selectedIntegrationType)} integration removed successfully!`, 
        severity: 'success' 
      });
      if (onIntegrationUpdate) {
        onIntegrationUpdate(data.removeIntegration.integrationDetails);
      }
    },
    onError: (error) => {
      setSnackbar({ 
        open: true, 
        message: `Error removing integration: ${error.message}`, 
        severity: 'error' 
      });
    }
  });

  // Handlers
  const handleOpenSetupDialog = (type) => {
    setSelectedIntegrationType(type);
    setOpenSetupDialog(true);
    setActiveStep(0);
    setFormValues({});
    setTestResult(null);
  };

  const handleCloseSetupDialog = () => {
    setOpenSetupDialog(false);
    setSelectedIntegrationType(null);
    setActiveStep(0);
    setFormValues({});
    setTestResult(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormChange = (field, value) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSetupIntegration = () => {
    const input = {};
    
    switch (selectedIntegrationType) {
      case 'slack_plugin':
        input.slackInput = {
          botToken: formValues.botToken,
          signingSecret: formValues.signingSecret,
          installationUrl: formValues.installationUrl,
          configOptions: formValues.configOptions
        };
        break;
      case 'hubspot':
        input.hubspotInput = {
          apiKey: formValues.apiKey,
          portalId: formValues.portalId,
          configOptions: formValues.configOptions
        };
        break;
      case 'notion':
        input.notionInput = {
          accessToken: formValues.accessToken,
          workspaceId: formValues.workspaceId,
          configOptions: formValues.configOptions
        };
        break;
      case 'zapier':
        input.zapierInput = {
          webhookUrl: formValues.webhookUrl,
          triggerKey: formValues.triggerKey,
          configOptions: formValues.configOptions
        };
        break;
      case 'microsoft_teams':
        input.teamsInput = {
          appId: formValues.appId,
          appPassword: formValues.appPassword,
          configOptions: formValues.configOptions
        };
        break;
      case 'salesforce':
        input.salesforceInput = {
          consumerKey: formValues.consumerKey,
          consumerSecret: formValues.consumerSecret,
          callbackUrl: formValues.callbackUrl,
          configOptions: formValues.configOptions
        };
        break;
      case 'zendesk':
        input.zendeskInput = {
          subdomain: formValues.subdomain,
          apiToken: formValues.apiToken,
          configOptions: formValues.configOptions
        };
        break;
      case 'custom':
        input.customInput = {
          configOptions: formValues.configOptions
        };
        break;
      default:
        break;
    }

    setupIntegration({
      variables: {
        agentId,
        integrationType: selectedIntegrationType,
        input
      }
    });
  };

  const handleTestIntegration = () => {
    testIntegration({
      variables: {
        agentId,
        integrationType: selectedIntegrationType
      }
    });
  };

  const handleRemoveIntegration = (type) => {
    if (window.confirm(`Are you sure you want to remove the ${getIntegrationName(type)} integration?`)) {
      setSelectedIntegrationType(type);
      removeIntegration({
        variables: {
          agentId,
          integrationType: type
        }
      });
    }
  };

  // Render setup form based on integration type
  const renderSetupForm = () => {
    if (loadingDetails) return <CircularProgress />;
    if (errorDetails) return <Alert severity="error">Error loading integration details: {errorDetails.message}</Alert>;
    if (!detailsData?.integrationDetails) return null;

    const { requiredFields, optionalFields } = detailsData.integrationDetails;

    return (
      <Box sx={{ mt: 2 }}>
        {requiredFields?.map((field) => (
          <TextField
            key={field}
            label={field}
            fullWidth
            required
            margin="normal"
            value={formValues[field] || ''}
            onChange={(e) => handleFormChange(field, e.target.value)}
            type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('password') || field.toLowerCase().includes('token') ? 'password' : 'text'}
          />
        ))}
        {optionalFields?.map((field) => (
          <TextField
            key={field}
            label={`${field} (Optional)`}
            fullWidth
            margin="normal"
            value={formValues[field] || ''}
            onChange={(e) => handleFormChange(field, e.target.value)}
            type={field.toLowerCase().includes('secret') || field.toLowerCase().includes('password') || field.toLowerCase().includes('token') ? 'password' : 'text'}
          />
        ))}
        {selectedIntegrationType === 'custom' && (
          <TextField
            label="Configuration Options (JSON)"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={formValues.configOptions || ''}
            onChange={(e) => handleFormChange('configOptions', e.target.value)}
            placeholder='{"key": "value"}'
          />
        )}
      </Box>
    );
  };

  // Setup dialog steps
  const steps = ['Integration Details', 'Configure', 'Test & Finish'];

  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        if (loadingDetails) return <CircularProgress />;
        if (errorDetails) return <Alert severity="error">Error loading integration details: {errorDetails.message}</Alert>;
        if (!detailsData?.integrationDetails) return null;
        
        const { name, description, setupInstructions, documentationUrl } = detailsData.integrationDetails;
        
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{name}</Typography>
            <Typography variant="body1" paragraph>{description}</Typography>
            <Typography variant="body2" paragraph>{setupInstructions}</Typography>
            {documentationUrl && (
              <Button 
                variant="outlined" 
                href={documentationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Documentation
              </Button>
            )}
          </Box>
        );
      case 1:
        return renderSetupForm();
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Test Your Integration</Typography>
            <Typography variant="body2" paragraph>
              Before finalizing, you can test if your integration is working correctly.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleTestIntegration}
              disabled={testingIntegration}
              startIcon={testingIntegration ? <CircularProgress size={20} /> : <TestIcon />}
              sx={{ mb: 2 }}
            >
              Test Integration
            </Button>
            
            {testResult && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: testResult.success ? 'success.light' : 'error.light' }}>
                <Typography variant="subtitle1" gutterBottom>
                  {testResult.success ? 'Test Successful!' : 'Test Failed'}
                </Typography>
                <Typography variant="body2">
                  {testResult.message || (testResult.success ? 'Integration is working correctly.' : 'Integration test failed.')}
                </Typography>
                {testResult.details && (
                  <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {testResult.details}
                  </Typography>
                )}
              </Paper>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  // Loading state
  if (loadingIntegrations) return <CircularProgress />;
  if (errorIntegrations) return <Alert severity="error">Error loading integrations: {errorIntegrations.message}</Alert>;

  const availableIntegrations = integrationsData?.availableIntegrations || [];

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <IntegrationInstructionsIcon sx={{ mr: 1 }} /> One-Click Integrations
        </Typography>
      </Box>

      <Typography variant="body1" paragraph>
        Easily connect your AI agent with popular platforms and services. Set up integrations with just a few clicks.
      </Typography>

      {/* Enabled Integrations */}
      {enabledIntegrations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Enabled Integrations</Typography>
          <Grid container spacing={2}>
            {enabledIntegrations.map((type) => (
              <Grid item xs={12} sm={6} md={4} key={type}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getIntegrationIcon(type)}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {getIntegrationName(type)}
                      </Typography>
                      <Chip 
                        size="small" 
                        color="success" 
                        icon={<CheckCircleIcon />} 
                        label="Enabled" 
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      This integration is currently enabled and active.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleTestIntegration(type)}
                      disabled={!isOwner}
                    >
                      Test
                    </Button>
                    {isOwner && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveIntegration(type)}
                        disabled={removingIntegration}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Available Integrations */}
      <Typography variant="h6" gutterBottom>Available Integrations</Typography>
      <Grid container spacing={2}>
        {availableIntegrations
          .filter(type => !enabledIntegrations.includes(type))
          .map((type) => (
            <Grid item xs={12} sm={6} md={4} key={type}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getIntegrationIcon(type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {getIntegrationName(type)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Connect your agent with {getIntegrationName(type)}
                  </Typography>
                </CardContent>
                <CardActions>
                  {isOwner && (
                    <Button 
                      size="small" 
                      onClick={() => handleOpenSetupDialog(type)}
                    >
                      Set Up
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Setup Dialog */}
      <Dialog 
        open={openSetupDialog} 
        onClose={handleCloseSetupDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Set Up {getIntegrationName(selectedIntegrationType)} Integration
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 2 }}>
            {getStepContent(activeStep)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSetupDialog}>Cancel</Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={settingUpIntegration}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button 
              onClick={handleNext} 
              variant="contained" 
              color="primary"
              disabled={activeStep === 1 && Object.keys(formValues).length === 0}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSetupIntegration} 
              variant="contained" 
              color="primary"
              disabled={settingUpIntegration}
            >
              {settingUpIntegration ? <CircularProgress size={24} /> : 'Finish'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OneClickIntegration;
