import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpIcon from '@mui/icons-material/Help';
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useMutation, gql } from '@apollo/client';

// GraphQL Mutations
const UPDATE_SSO_SETTINGS = gql`
  mutation UpdateSSOSettings($input: SSOSettingsInput!) {
    updateSSOSettings(input: $input) {
      id
      provider
      enabled
      clientId
      clientSecret
      authorizationUrl
      tokenUrl
      userInfoUrl
      callbackUrl
      scopes
      attributeMapping {
        email
        firstName
        lastName
        role
      }
    }
  }
`;

const TEST_SSO_CONNECTION = gql`
  mutation TestSSOConnection($provider: String!) {
    testSSOConnection(provider: $provider) {
      success
      message
    }
  }
`;

// SSO Provider options
const SSO_PROVIDERS = [
  { 
    id: 'okta', 
    name: 'Okta', 
    logo: 'https://www.okta.com/sites/default/files/media/image/2020-11/Logo_Blue_Okta_0.svg',
    description: 'Connect with Okta for enterprise-grade identity management'
  },
  { 
    id: 'auth0', 
    name: 'Auth0', 
    logo: 'https://cdn.auth0.com/website/bob/press/logo/auth0-logo-primary.svg',
    description: 'Integrate with Auth0 for flexible authentication and authorization'
  },
  { 
    id: 'azure', 
    name: 'Azure AD', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Microsoft_Azure.svg/1200px-Microsoft_Azure.svg.png',
    description: 'Use Azure Active Directory for Microsoft-based organizations'
  },
  { 
    id: 'google', 
    name: 'Google Workspace', 
    logo: 'https://workspace.google.com/static/img/products/png/drive.png?cache=1',
    description: 'Connect with Google Workspace for Google-based organizations'
  },
  { 
    id: 'custom', 
    name: 'Custom OIDC/SAML', 
    logo: null,
    description: 'Configure a custom OIDC or SAML provider'
  }
];

const SSOIntegration = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [settings, setSettings] = useState({
    provider: '',
    enabled: false,
    clientId: '',
    clientSecret: '',
    authorizationUrl: '',
    tokenUrl: '',
    userInfoUrl: '',
    callbackUrl: 'https://app.vibe-ai.com/auth/callback',
    scopes: 'openid profile email',
    attributeMapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
      role: 'role'
    },
    protocol: 'oidc' // 'oidc' or 'saml'
  });
  const [testResult, setTestResult] = useState(null);

  // Mutations
  const [updateSettings, { loading, error }] = useMutation(UPDATE_SSO_SETTINGS);
  const [testConnection, { loading: testingConnection }] = useMutation(TEST_SSO_CONNECTION);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProviderSelect = (providerId) => {
    setSelectedProvider(providerId);
    
    // Set default values based on provider
    if (providerId === 'okta') {
      setSettings({
        ...settings,
        provider: 'okta',
        authorizationUrl: 'https://{your-okta-domain}/oauth2/default/v1/authorize',
        tokenUrl: 'https://{your-okta-domain}/oauth2/default/v1/token',
        userInfoUrl: 'https://{your-okta-domain}/oauth2/default/v1/userinfo',
        protocol: 'oidc'
      });
    } else if (providerId === 'auth0') {
      setSettings({
        ...settings,
        provider: 'auth0',
        authorizationUrl: 'https://{your-auth0-domain}/authorize',
        tokenUrl: 'https://{your-auth0-domain}/oauth/token',
        userInfoUrl: 'https://{your-auth0-domain}/userinfo',
        protocol: 'oidc'
      });
    } else if (providerId === 'azure') {
      setSettings({
        ...settings,
        provider: 'azure',
        authorizationUrl: 'https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
        protocol: 'oidc'
      });
    } else if (providerId === 'google') {
      setSettings({
        ...settings,
        provider: 'google',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
        protocol: 'oidc'
      });
    } else if (providerId === 'custom') {
      setSettings({
        ...settings,
        provider: 'custom',
        authorizationUrl: '',
        tokenUrl: '',
        userInfoUrl: '',
        protocol: 'oidc'
      });
    }
  };

  const handleSettingChange = (field) => (event) => {
    setSettings({
      ...settings,
      [field]: event.target.value
    });
  };

  const handleNestedSettingChange = (parent, field) => (event) => {
    setSettings({
      ...settings,
      [parent]: {
        ...settings[parent],
        [field]: event.target.value
      }
    });
  };

  const handleSwitchChange = (field) => (event) => {
    setSettings({
      ...settings,
      [field]: event.target.checked
    });
  };

  // Protocol change handler is not currently used as protocol tabs are not implemented

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        variables: {
          input: settings
        }
      });
      alert('SSO settings saved successfully!');
    } catch (err) {
      console.error('Error saving SSO settings:', err);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection({
        variables: {
          provider: settings.provider
        }
      });
      setTestResult(result.data.testSSOConnection);
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Render provider selection
  const renderProviderSelection = () => {
    return (
      <Grid container spacing={3}>
        {SSO_PROVIDERS.map((provider) => (
          <Grid item xs={12} sm={6} md={4} key={provider.id}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                border: selectedProvider === provider.id ? '2px solid #3f51b5' : '1px solid #ddd',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={() => handleProviderSelect(provider.id)}
            >
              <CardContent>
                <Box sx={{ 
                  height: 60, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  {provider.logo ? (
                    <img 
                      src={provider.logo} 
                      alt={provider.name} 
                      style={{ maxHeight: 50, maxWidth: '100%' }} 
                    />
                  ) : (
                    <SecurityIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                  )}
                </Box>
                <Typography variant="h6" component="div" gutterBottom align="center">
                  {provider.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {provider.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  fullWidth
                  variant={selectedProvider === provider.id ? "contained" : "outlined"}
                >
                  {selectedProvider === provider.id ? "Selected" : "Select"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render configuration form
  const renderConfigurationForm = () => {
    if (!selectedProvider) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Please select an SSO provider first
          </Typography>
        </Box>
      );
    }

    const provider = SSO_PROVIDERS.find(p => p.id === selectedProvider);

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Configure {provider.name}
          </Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={settings.enabled} 
                onChange={handleSwitchChange('enabled')} 
              />
            }
            label={settings.enabled ? "Enabled" : "Disabled"}
            sx={{ ml: 2 }}
          />
        </Box>

        {settings.protocol === 'oidc' ? (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client ID"
                value={settings.clientId}
                onChange={handleSettingChange('clientId')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Client Secret"
                value={settings.clientSecret}
                onChange={handleSettingChange('clientSecret')}
                type="password"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Authorization URL"
                value={settings.authorizationUrl}
                onChange={handleSettingChange('authorizationUrl')}
                required
                helperText={`Example: ${provider.id === 'okta' ? 'https://your-domain.okta.com/oauth2/default/v1/authorize' : 'https://your-domain.auth0.com/authorize'}`}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Token URL"
                value={settings.tokenUrl}
                onChange={handleSettingChange('tokenUrl')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User Info URL"
                value={settings.userInfoUrl}
                onChange={handleSettingChange('userInfoUrl')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scopes"
                value={settings.scopes}
                onChange={handleSettingChange('scopes')}
                helperText="Space-separated list of scopes (e.g., 'openid profile email')"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Callback URL"
                value={settings.callbackUrl}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton onClick={() => copyToClipboard(settings.callbackUrl)}>
                      <ContentCopyIcon />
                    </IconButton>
                  )
                }}
                helperText="Use this URL in your SSO provider configuration"
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SAML Metadata URL"
                value={settings.metadataUrl || ''}
                onChange={handleSettingChange('metadataUrl')}
                helperText="URL to your IdP's SAML metadata XML"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Or upload SAML Metadata XML
              </Typography>
              <Button
                variant="outlined"
                component="label"
              >
                Upload Metadata XML
                <input
                  type="file"
                  hidden
                  accept=".xml"
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SAML SSO URL"
                value={settings.ssoUrl || ''}
                onChange={handleSettingChange('ssoUrl')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SAML Entity ID"
                value={settings.entityId || ''}
                onChange={handleSettingChange('entityId')}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Service Provider Details (for your IdP configuration)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>ACS URL:</strong> https://app.vibe-ai.com/auth/saml/callback
                      <IconButton size="small" onClick={() => copyToClipboard('https://app.vibe-ai.com/auth/saml/callback')}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Entity ID:</strong> urn:vibe-ai:marketplace
                      <IconButton size="small" onClick={() => copyToClipboard('urn:vibe-ai:marketplace')}>
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        )}

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Attribute Mapping
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Attribute"
              value={settings.attributeMapping.email}
              onChange={handleNestedSettingChange('attributeMapping', 'email')}
              helperText="The attribute name that contains the user's email"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name Attribute"
              value={settings.attributeMapping.firstName}
              onChange={handleNestedSettingChange('attributeMapping', 'firstName')}
              helperText="The attribute name that contains the user's first name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name Attribute"
              value={settings.attributeMapping.lastName}
              onChange={handleNestedSettingChange('attributeMapping', 'lastName')}
              helperText="The attribute name that contains the user's last name"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role Attribute"
              value={settings.attributeMapping.role}
              onChange={handleNestedSettingChange('attributeMapping', 'role')}
              helperText="The attribute name that contains the user's role"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={handleTestConnection}
            disabled={testingConnection || !settings.enabled}
          >
            {testingConnection ? <CircularProgress size={24} /> : 'Test Connection'}
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>

        {testResult && (
          <Alert 
            severity={testResult.success ? "success" : "error"} 
            sx={{ mt: 2 }}
          >
            {testResult.message}
          </Alert>
        )}
      </Box>
    );
  };

  // Render role mapping
  const renderRoleMapping = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Role Mapping
        </Typography>
        <Typography variant="body2" paragraph>
          Map your SSO provider roles to application roles. This determines what permissions users will have when they sign in.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Admin Role Value"
              placeholder="admin"
              helperText="The value in the role attribute that maps to Admin role"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Developer Role Value"
              placeholder="developer"
              helperText="The value in the role attribute that maps to Developer role"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="User Role Value"
              placeholder="user"
              helperText="The value in the role attribute that maps to User role"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Default Role"
              placeholder="user"
              helperText="The default role if no matching role is found"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Role Permissions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Admin
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Full system access" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="User management" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Billing management" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Agent approval" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Developer
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Create and manage agents" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="View analytics" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="API access" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Collaboration features" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Use agents" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="View marketplace" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Submit feedback" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Participate in forums" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Single Sign-On (SSO) Integration</Typography>
        <Chip 
          label="Enterprise Feature" 
          color="primary" 
          variant="outlined" 
          size="small" 
        />
      </Box>

      <Typography variant="body1" paragraph>
        Allow your users to sign in using your organization's identity provider. Support for SAML, OAuth, and OpenID Connect.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error saving settings: {error.message}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Provider" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Configuration" icon={<VpnKeyIcon />} iconPosition="start" />
          <Tab label="Role Mapping" icon={<GroupIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 2 }}>
        {activeTab === 0 && renderProviderSelection()}
        {activeTab === 1 && renderConfigurationForm()}
        {activeTab === 2 && renderRoleMapping()}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <HelpIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Need help setting up SSO? <Button size="small">Contact Support</Button> or view our <Button size="small">Documentation</Button>
        </Typography>
      </Box>
    </Paper>
  );
};

export default SSOIntegration;
