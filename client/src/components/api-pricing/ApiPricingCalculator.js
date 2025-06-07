import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button, 
  Divider,
  Slider,
  TextField
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';

const ApiPricingCalculator = () => {
  // State
  const [requestVolume, setRequestVolume] = useState(50000);
  const [customRequestVolume, setCustomRequestVolume] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro');

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

  // Handlers
  const handleSliderChange = (event, newValue) => {
    setRequestVolume(newValue);
    setCustomRequestVolume('');
  };

  const handleCustomVolumeChange = (event) => {
    const value = event.target.value;
    setCustomRequestVolume(value);
    if (value && !isNaN(value) && parseInt(value) > 0) {
      setRequestVolume(parseInt(value));
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  // Calculate cost based on volume and plan
  const calculateCost = (volume, plan) => {
    const tier = pricingTiers.find(t => t.tier.toLowerCase() === plan.toLowerCase());
    const additionalPricing = additionalRequestPricing.find(t => t.tier.toLowerCase() === plan.toLowerCase());
    
    if (!tier || !additionalPricing) return 0;
    
    if (volume <= tier.requests) {
      return tier.monthlyFee;
    }
    
    const additionalRequests = volume - tier.requests;
    const additionalCost = additionalRequests * additionalPricing.pricePerRequest;
    
    return tier.monthlyFee + additionalCost;
  };

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

  const currentCost = calculateCost(requestVolume, selectedPlan);

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        API Usage Cost Calculator
      </Typography>
      <Typography variant="body1" paragraph>
        Estimate your monthly cost based on your expected API request volume.
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Estimated Monthly API Requests
            </Typography>
            <Slider
              value={requestVolume}
              min={1000}
              max={2000000}
              step={1000}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatNumber(value)}
              marks={[
                { value: 10000, label: '10K' },
                { value: 100000, label: '100K' },
                { value: 500000, label: '500K' },
                { value: 1000000, label: '1M' },
                { value: 2000000, label: '2M' }
              ]}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Or enter a specific number:
            </Typography>
            <TextField
              value={customRequestVolume}
              onChange={handleCustomVolumeChange}
              variant="outlined"
              size="small"
              placeholder="Enter request volume"
              InputProps={{
                endAdornment: <Typography variant="body2">requests/month</Typography>
              }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Your Plan
            </Typography>
            <Grid container spacing={2}>
              {pricingTiers.map((tier) => (
                <Grid item xs={6} sm={3} key={tier.tier}>
                  <Button
                    variant={selectedPlan === tier.tier.toLowerCase() ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => handlePlanSelect(tier.tier.toLowerCase())}
                  >
                    {tier.tier}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {formatCurrency(currentCost)}
                </Typography>
                <Typography variant="subtitle1">
                  Estimated Monthly Cost
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cost Breakdown:
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan Base Fee:
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatCurrency(pricingTiers.find(t => t.tier.toLowerCase() === selectedPlan)?.monthlyFee || 0)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      Included Requests:
                    </Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {formatNumber(pricingTiers.find(t => t.tier.toLowerCase() === selectedPlan)?.requests || 0)}
                    </Typography>
                  </Grid>
                  
                  {requestVolume > (pricingTiers.find(t => t.tier.toLowerCase() === selectedPlan)?.requests || 0) && (
                    <>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          Additional Requests:
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">
                          {formatNumber(requestVolume - (pricingTiers.find(t => t.tier.toLowerCase() === selectedPlan)?.requests || 0))}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          Additional Request Cost:
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">
                          {formatCurrency((requestVolume - (pricingTiers.find(t => t.tier.toLowerCase() === selectedPlan)?.requests || 0)) * 
                            (additionalRequestPricing.find(t => t.tier.toLowerCase() === selectedPlan)?.pricePerRequest || 0))}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', p: 2 }}>
              <Button variant="contained" startIcon={<CalculateIcon />}>
                Get Custom Quote
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ApiPricingCalculator;
