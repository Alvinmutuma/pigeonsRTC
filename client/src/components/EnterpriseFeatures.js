import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Link
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SupportIcon from '@mui/icons-material/Support';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Import enterprise components
import WhiteLabelOptions from './enterprise/WhiteLabelOptions';
import SSOIntegration from './enterprise/SSOIntegration';

const EnterpriseFeatures = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Enterprise Features
      </Typography>
      <Typography variant="body1" paragraph>
        Unlock advanced capabilities designed for enterprise organizations. Scale your AI agent deployment with security, customization, and support features.
      </Typography>

      {/* Enterprise Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Enterprise-Grade AI Agent Platform
              </Typography>
              <Typography variant="body1" paragraph>
                Deploy and manage AI agents at scale with enterprise-level security, compliance, and support. Our enterprise features are designed for organizations that need advanced customization, integration, and management capabilities.
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="White-label Platform" 
                    secondary="Customize the platform with your branding, colors, and domain" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="SSO Integration" 
                    secondary="Connect with your identity provider for seamless authentication" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Custom Integrations" 
                    secondary="Enterprise-specific API connectors and legacy system integration" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="SLA Guarantees" 
                    secondary="Uptime guarantees with monitoring and priority support" 
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                endIcon={<ArrowForwardIcon />}
                href="#contact-sales"
              >
                Contact Sales
              </Button>
              <Button variant="outlined">
                View Pricing
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Enterprise Implementation Process
              </Typography>
              <Stepper orientation="vertical" sx={{ mt: 2 }}>
                <Step active={true}>
                  <StepLabel>Initial Consultation</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Our enterprise team will work with you to understand your requirements and customize a solution that fits your organization's needs.
                    </Typography>
                  </StepContent>
                </Step>
                <Step active={true}>
                  <StepLabel>Technical Assessment</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      We'll conduct a technical assessment to identify integration points, security requirements, and customization needs.
                    </Typography>
                  </StepContent>
                </Step>
                <Step active={true}>
                  <StepLabel>Implementation & Configuration</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Our team will implement and configure the platform according to your specifications, including SSO, white-labeling, and custom integrations.
                    </Typography>
                  </StepContent>
                </Step>
                <Step active={true}>
                  <StepLabel>Training & Onboarding</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      We provide comprehensive training for administrators, developers, and end-users to ensure a smooth adoption process.
                    </Typography>
                  </StepContent>
                </Step>
                <Step active={true}>
                  <StepLabel>Ongoing Support</StepLabel>
                  <StepContent>
                    <Typography variant="body2">
                      Enterprise customers receive dedicated support, regular updates, and quarterly business reviews to ensure continued success.
                    </Typography>
                  </StepContent>
                </Step>
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enterprise Features Tabs */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="enterprise features tabs">
            <Tab icon={<BusinessIcon />} iconPosition="start" label="White Label" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="SSO Integration" />
            <Tab icon={<IntegrationInstructionsIcon />} iconPosition="start" label="Custom Integrations" />
            <Tab icon={<SupportIcon />} iconPosition="start" label="SLA & Support" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            <WhiteLabelOptions />
          )}
          {activeTab === 1 && (
            <SSOIntegration />
          )}
          {activeTab === 2 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Custom Integrations
              </Typography>
              <Typography variant="body1" paragraph>
                Connect your AI agents with your existing enterprise systems and workflows.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Enterprise API Connectors
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Custom API connectors for enterprise systems like SAP, Oracle, Salesforce, and more.
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Bi-directional data flow" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Secure credential management" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Custom field mapping" />
                        </ListItem>
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Learn More</Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Legacy System Integration
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Connect AI agents with legacy systems through custom adapters and middleware.
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Mainframe connectivity" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Protocol adaptation" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Data transformation" />
                        </ListItem>
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Learn More</Button>
                    </CardActions>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Custom Workflow Builder
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Create custom workflows that integrate AI agents into your business processes.
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Visual workflow designer" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Conditional logic" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary="Approval processes" />
                        </ListItem>
                      </List>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Learn More</Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}
          {activeTab === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                SLA & Support
              </Typography>
              <Typography variant="body1" paragraph>
                Enterprise-grade service level agreements and dedicated support.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Service Level Agreements
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="99.9% Uptime Guarantee" 
                            secondary="Our enterprise platform is built for reliability with redundant infrastructure" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Response Time Commitments" 
                            secondary="1-hour response time for critical issues, 4 hours for high priority" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Resolution Time Targets" 
                            secondary="Defined resolution time targets based on issue severity" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Performance Metrics" 
                            secondary="Regular reporting on system performance and SLA compliance" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Enterprise Support
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Dedicated Account Manager" 
                            secondary="A single point of contact for all your needs" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="24/7 Technical Support" 
                            secondary="Round-the-clock support for critical issues" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Quarterly Business Reviews" 
                            secondary="Regular reviews to ensure your success and plan for future needs" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Priority Feature Requests" 
                            secondary="Enterprise customers get priority consideration for feature requests" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Contact Sales Section */}
      <Paper sx={{ p: 4, mb: 4 }} id="contact-sales">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="h5" gutterBottom>
              Ready to get started with Enterprise features?
            </Typography>
            <Typography variant="body1" paragraph>
              Contact our sales team to discuss your organization's needs and get a customized quote. We'll work with you to create a solution that meets your specific requirements.
            </Typography>
            <Typography variant="body1" paragraph>
              Our enterprise plans include:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited agents" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Unlimited users" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Custom integrations" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="White-label options" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="SSO integration" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Dedicated support" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Request Enterprise Information
                </Typography>
                <Typography variant="body2" paragraph>
                  Fill out the form below and our enterprise team will contact you within 1 business day.
                </Typography>
                <Typography variant="body2">
                  For immediate assistance, contact us at:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <Link href="mailto:enterprise@vibe-ai.com">enterprise@vibe-ai.com</Link> or <Link href="tel:+18005551234">+1 (800) 555-1234</Link>
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  size="large"
                >
                  Request Information
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EnterpriseFeatures;
