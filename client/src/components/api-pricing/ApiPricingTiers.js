import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ApiPricingTiers = () => {
  // Pricing tiers
  const pricingTiers = [
    { tier: 'Free', requests: 10000, pricePerRequest: 0, monthlyFee: 0 },
    { tier: 'Basic', requests: 100000, pricePerRequest: 0.002, monthlyFee: 49 },
    { tier: 'Pro', requests: 500000, pricePerRequest: 0.0015, monthlyFee: 199 },
    { tier: 'Enterprise', requests: 2000000, pricePerRequest: 0.001, monthlyFee: 499 }
  ];

  // Additional requests pricing (after included amount)
  const additionalRequestPricing = [
    { tier: 'Free', pricePerRequest: 0.005 },
    { tier: 'Basic', pricePerRequest: 0.003 },
    { tier: 'Pro', pricePerRequest: 0.002 },
    { tier: 'Enterprise', pricePerRequest: 0.0008 }
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        API Usage Pricing Tiers
      </Typography>
      <Typography variant="body1" paragraph>
        Choose the plan that best fits your API usage needs. All plans include access to our full API feature set.
      </Typography>
      
      <Grid container spacing={3}>
        {pricingTiers.map((tier) => (
          <Grid item xs={12} sm={6} md={3} key={tier.tier}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              border: tier.tier === 'Pro' ? '2px solid #3f51b5' : '1px solid #ddd'
            }}>
              {tier.tier === 'Pro' && (
                <Box sx={{ bgcolor: '#3f51b5', color: 'white', p: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle2">Most Popular</Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  {tier.tier}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" component="div" color="primary">
                    {formatCurrency(tier.monthlyFee)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per month
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Includes:
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  {formatNumber(tier.requests)} requests/month
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                  Additional requests:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCurrency(additionalRequestPricing.find(t => t.tier === tier.tier)?.pricePerRequest || 0)} per request
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Full API access" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Usage dashboard" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="API key management" />
                  </ListItem>
                  {tier.tier !== 'Free' && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Email support" />
                    </ListItem>
                  )}
                  {(tier.tier === 'Pro' || tier.tier === 'Enterprise') && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Rate limit controls" />
                    </ListItem>
                  )}
                  {tier.tier === 'Enterprise' && (
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Dedicated support" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button 
                  variant={tier.tier === 'Pro' ? "contained" : "outlined"} 
                  fullWidth
                >
                  {tier.tier === 'Enterprise' ? 'Contact Sales' : 'Select Plan'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ApiPricingTiers;
