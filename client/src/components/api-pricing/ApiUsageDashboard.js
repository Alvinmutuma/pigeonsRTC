import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Tabs,
  Tab
} from '@mui/material';
import { 
  BarChart,
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const ApiUsageDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);

  // Sample usage data for charts
  const usageData = [
    { name: 'Jan', requests: 42000, cost: 84 },
    { name: 'Feb', requests: 48000, cost: 96 },
    { name: 'Mar', requests: 55000, cost: 110 },
    { name: 'Apr', requests: 62000, cost: 124 },
    { name: 'May', requests: 58000, cost: 116 },
    { name: 'Jun', requests: 65000, cost: 130 },
    { name: 'Jul', requests: 72000, cost: 144 },
    { name: 'Aug', requests: 78000, cost: 156 },
    { name: 'Sep', requests: 85000, cost: 170 },
    { name: 'Oct', requests: 92000, cost: 184 },
    { name: 'Nov', requests: 88000, cost: 176 },
    { name: 'Dec', requests: 95000, cost: 190 }
  ];

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        API Usage Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Monitor your API usage and costs with our comprehensive dashboard.
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Usage Trends" />
        <Tab label="Cost Analysis" />
      </Tabs>
      
      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Monthly API Request Volume
          </Typography>
          <Box sx={{ height: 300, mb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="requests" fill="#3f51b5" name="API Requests" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Month
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatNumber(95000)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    API requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Average
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatNumber(70000)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    API requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Plan Limit
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatNumber(100000)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    API requests
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Usage
                  </Typography>
                  <Typography variant="h4" color="primary">
                    95%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of monthly limit
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Monthly Cost Trends
          </Typography>
          <Box sx={{ height: 300, mb: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={usageData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#3f51b5" name="Monthly Cost" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Month
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(190)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    estimated cost
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Average
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(140)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    last 12 months
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Base Plan Cost
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(49)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    monthly subscription
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Usage
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(141)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    overage charges
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default ApiUsageDashboard;
