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
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import { useMutation, gql } from '@apollo/client';

// GraphQL Mutations
const UPDATE_WHITE_LABEL_SETTINGS = gql`
  mutation UpdateWhiteLabelSettings($input: WhiteLabelSettingsInput!) {
    updateWhiteLabelSettings(input: $input) {
      id
      companyName
      primaryColor
      secondaryColor
      logoUrl
      faviconUrl
      customDomain
      customCss
      footerText
      emailTemplate
    }
  }
`;

const WhiteLabelOptions = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [settings, setSettings] = useState({
    companyName: 'Your Company',
    primaryColor: '#3f51b5',
    secondaryColor: '#f50057',
    logoUrl: '',
    faviconUrl: '',
    customDomain: '',
    customCss: '',
    footerText: '© 2025 Your Company. All rights reserved.',
    emailTemplate: '<div>{{content}}</div>',
    enableCustomLogin: true,
    enableCustomErrorPages: true
  });
  const [previewMode, setPreviewMode] = useState(false);

  // Mutations
  const [updateSettings, { loading, error }] = useMutation(UPDATE_WHITE_LABEL_SETTINGS);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (field) => (event) => {
    setSettings({
      ...settings,
      [field]: event.target.value
    });
  };

  const handleSwitchChange = (field) => (event) => {
    setSettings({
      ...settings,
      [field]: event.target.checked
    });
  };

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          logoUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          faviconUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        variables: {
          input: {
            ...settings,
            // Convert files to base64 or handle file upload separately
          }
        }
      });
      alert('White label settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  // Render preview
  const renderPreview = () => {
    return (
      <Box sx={{ mt: 3, border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
        <Box sx={{ 
          bgcolor: settings.primaryColor, 
          p: 2, 
          borderRadius: '4px 4px 0 0',
          display: 'flex',
          alignItems: 'center'
        }}>
          {settings.logoUrl && (
            <img 
              src={settings.logoUrl} 
              alt="Logo" 
              style={{ height: 40, marginRight: 16 }} 
            />
          )}
          <Typography variant="h6" sx={{ color: '#fff' }}>
            {settings.companyName}
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1">
            Sample content area with your branding applied.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              mt: 2, 
              bgcolor: settings.primaryColor,
              '&:hover': {
                bgcolor: settings.primaryColor + 'dd'
              }
            }}
          >
            Primary Button
          </Button>
          <Button 
            variant="outlined" 
            sx={{ 
              mt: 2, 
              ml: 1,
              color: settings.secondaryColor,
              borderColor: settings.secondaryColor,
              '&:hover': {
                borderColor: settings.secondaryColor + 'dd'
              }
            }}
          >
            Secondary Button
          </Button>
        </Box>
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {settings.footerText}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">White Label Options</Typography>
        <Box>
          <Tooltip title="Toggle Preview">
            <IconButton onClick={togglePreviewMode} color={previewMode ? "primary" : "default"}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" paragraph>
        Customize the look and feel of your agent marketplace to match your brand identity.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error saving settings: {error.message}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Branding" />
          <Tab label="Domain" />
          <Tab label="Customization" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={previewMode ? 6 : 12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={settings.companyName}
                  onChange={handleSettingChange('companyName')}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Primary Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      bgcolor: settings.primaryColor,
                      mr: 1,
                      cursor: 'pointer',
                      border: '1px solid #ddd'
                    }}
                  />
                  <TextField
                    size="small"
                    value={settings.primaryColor}
                    onChange={handleSettingChange('primaryColor')}
                    sx={{ width: '120px' }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Secondary Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1,
                      bgcolor: settings.secondaryColor,
                      mr: 1,
                      cursor: 'pointer',
                      border: '1px solid #ddd'
                    }}
                  />
                  <TextField
                    size="small"
                    value={settings.secondaryColor}
                    onChange={handleSettingChange('secondaryColor')}
                    sx={{ width: '120px' }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Logo
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </Button>
                  {settings.logoUrl && (
                    <Box sx={{ ml: 2 }}>
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo Preview" 
                        style={{ height: 40 }} 
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Favicon
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Favicon
                    <input
                      type="file"
                      hidden
                      accept="image/x-icon,image/png"
                      onChange={handleFaviconChange}
                    />
                  </Button>
                  {settings.faviconUrl && (
                    <Box sx={{ ml: 2 }}>
                      <img 
                        src={settings.faviconUrl} 
                        alt="Favicon Preview" 
                        style={{ height: 24 }} 
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Footer Text"
                  value={settings.footerText}
                  onChange={handleSettingChange('footerText')}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {previewMode && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Preview
              </Typography>
              {renderPreview()}
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Custom Domain"
              placeholder="app.yourcompany.com"
              value={settings.customDomain}
              onChange={handleSettingChange('customDomain')}
              helperText="Enter your custom domain to use instead of the default domain"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Domain Setup Instructions
            </Typography>
            <Typography variant="body2" paragraph>
              To set up your custom domain, you'll need to create a CNAME record with your DNS provider:
            </Typography>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre">
                Type: CNAME
                Host: {settings.customDomain.split('.')[0] || 'app'}
                Value: marketplace-proxy.vibe-ai.com
                TTL: 3600
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Once you've created the DNS record, it may take up to 24-48 hours for the changes to propagate.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={settings.enableCustomLogin} 
                  onChange={handleSwitchChange('enableCustomLogin')} 
                />
              }
              label="Enable Custom Login Page"
            />
            <Typography variant="body2" color="text.secondary">
              When enabled, the login page will use your branding and custom domain
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch 
                  checked={settings.enableCustomErrorPages} 
                  onChange={handleSwitchChange('enableCustomErrorPages')} 
                />
              }
              label="Enable Custom Error Pages"
            />
            <Typography variant="body2" color="text.secondary">
              When enabled, error pages (404, 500) will use your branding
            </Typography>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Custom CSS
              <Tooltip title="Add custom CSS to further customize the appearance of your marketplace">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={settings.customCss}
              onChange={handleSettingChange('customCss')}
              placeholder=".custom-class { color: #333; }"
              sx={{ fontFamily: 'monospace' }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Email Template
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              value={settings.emailTemplate}
              onChange={handleSettingChange('emailTemplate')}
              placeholder="<div>{{content}}</div>"
              helperText="Use {{content}} as a placeholder for the email content"
              sx={{ fontFamily: 'monospace' }}
            />
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default WhiteLabelOptions;
