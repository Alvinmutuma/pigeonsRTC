import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs,
  Tab,
  Container
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ApiIcon from '@mui/icons-material/Api';
import BarChartIcon from '@mui/icons-material/BarChart';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

// Import API pricing components
import ApiPricingCalculator from './api-pricing/ApiPricingCalculator';
import ApiPricingTiers from './api-pricing/ApiPricingTiers';
import ApiUsageDashboard from './api-pricing/ApiUsageDashboard';
import ApiKeyManagement from './api-pricing/ApiKeyManagement';

const MeteredApiPricing = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Metered API Usage Pricing
        </Typography>
        <Typography variant="body1" paragraph>
          Our flexible API pricing scales with your usage. Pay only for what you need with transparent, predictable pricing.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="API pricing tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ApiIcon />} iconPosition="start" label="Pricing Tiers" />
            <Tab icon={<CalculateIcon />} iconPosition="start" label="Cost Calculator" />
            <Tab icon={<BarChartIcon />} iconPosition="start" label="Usage Dashboard" />
            <Tab icon={<VpnKeyIcon />} iconPosition="start" label="API Key Management" />
          </Tabs>
        </Box>

        {activeTab === 0 && <ApiPricingTiers />}
        {activeTab === 1 && <ApiPricingCalculator />}
        {activeTab === 2 && <ApiUsageDashboard />}
        {activeTab === 3 && <ApiKeyManagement />}
      </Box>
    </Container>
  );
};

export default MeteredApiPricing;
