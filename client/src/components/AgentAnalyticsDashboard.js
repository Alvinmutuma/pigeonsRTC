import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import DownloadIcon from '@mui/icons-material/Download';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';

// GraphQL Queries
const GET_AGENT_ANALYTICS = gql`
  query GetAgentAnalytics($agentId: ID!, $timeframe: String!) {
    agentAnalytics(agentId: $agentId, timeframe: $timeframe) {
      summary {
        totalRequests
        totalRevenue
        totalUsers
        averageResponseTime
        successRate
      }
      requestsOverTime {
        date
        count
      }
      revenueOverTime {
        date
        amount
      }
      usersOverTime {
        date
        count
      }
      requestsByType {
        type
        count
      }
      requestsByStatus {
        status
        count
      }
      topUsers {
        userId
        username
        requestCount
        revenue
      }
      responseTimeDistribution {
        range
        count
      }
    }
  }
`;

const GET_AGENT_VERSIONS = gql`
  query GetAgentVersions($agentId: ID!) {
    agentVersionHistory(agentId: $agentId) {
      id
      version
      description
      changedBy {
        id
        username
      }
      timestamp
    }
  }
`;

// COLORS
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AgentAnalyticsDashboard = ({ agentId, agentName }) => {
  // State
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState(0);

  // Queries
  const { loading: loadingAnalytics, error: errorAnalytics, data: analyticsData } = useQuery(GET_AGENT_ANALYTICS, {
    variables: { agentId, timeframe },
    skip: !agentId
  });

  const { loading: loadingVersions, error: errorVersions, data: versionsData } = useQuery(GET_AGENT_VERSIONS, {
    variables: { agentId },
    skip: !agentId
  });

  // Handlers
  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExportData = (format) => {
    // In a real app, this would trigger an API call to export data
    console.log(`Exporting data in ${format} format`);
    alert(`Data would be exported in ${format} format`);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Calculate percentage change
  const calculateChange = (current, previous) => {
    if (!previous) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  // Render loading state
  if (loadingAnalytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (errorAnalytics) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading analytics: {errorAnalytics.message}
      </Alert>
    );
  }

  // Mock data for development (remove in production)
  const analytics = analyticsData?.agentAnalytics || {
    summary: {
      totalRequests: 12583,
      totalRevenue: 4325.75,
      totalUsers: 347,
      averageResponseTime: 1.2,
      successRate: 98.7
    },
    requestsOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: `2025-${(i % 12) + 1}-${(i % 28) + 1}`,
      count: 300 + Math.floor(Math.random() * 200)
    })),
    revenueOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: `2025-${(i % 12) + 1}-${(i % 28) + 1}`,
      amount: 100 + Math.floor(Math.random() * 150)
    })),
    usersOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: `2025-${(i % 12) + 1}-${(i % 28) + 1}`,
      count: 10 + Math.floor(Math.random() * 20)
    })),
    requestsByType: [
      { type: 'Query', count: 7845 },
      { type: 'Command', count: 3251 },
      { type: 'Analysis', count: 1487 }
    ],
    requestsByStatus: [
      { status: 'Success', count: 11432 },
      { status: 'Failed', count: 951 },
      { status: 'Timeout', count: 200 }
    ],
    topUsers: Array.from({ length: 5 }, (_, i) => ({
      userId: `user-${i + 1}`,
      username: `Company ${i + 1}`,
      requestCount: 1000 - (i * 150),
      revenue: 800 - (i * 120)
    })),
    responseTimeDistribution: [
      { range: '<0.5s', count: 3245 },
      { range: '0.5-1s', count: 5632 },
      { range: '1-2s', count: 2987 },
      { range: '2-5s', count: 645 },
      { range: '>5s', count: 74 }
    ]
  };

  // Mock version history data
  const versions = versionsData?.agentVersionHistory || Array.from({ length: 5 }, (_, i) => ({
    id: `v-${i + 1}`,
    version: `1.${i}`,
    description: `Version 1.${i} with ${i === 0 ? 'initial features' : 'improvements and bug fixes'}`,
    changedBy: {
      id: `user-${i + 1}`,
      username: `Developer ${i + 1}`
    },
    timestamp: new Date(2025, 0, 1 + i * 15).toISOString()
  }));

  // Previous period data for comparison (mock)
  const previousPeriodSummary = {
    totalRequests: 10983,
    totalRevenue: 3825.50,
    totalUsers: 312,
    averageResponseTime: 1.4,
    successRate: 97.5
  };

  // Calculate changes
  const requestsChange = calculateChange(analytics.summary.totalRequests, previousPeriodSummary.totalRequests);
  const revenueChange = calculateChange(analytics.summary.totalRevenue, previousPeriodSummary.totalRevenue);
  const usersChange = calculateChange(analytics.summary.totalUsers, previousPeriodSummary.totalUsers);
  const responseTimeChange = calculateChange(previousPeriodSummary.averageResponseTime, analytics.summary.averageResponseTime);
  const successRateChange = calculateChange(analytics.summary.successRate, previousPeriodSummary.successRate);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard: {agentName || 'Your Agent'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-select-label"
              value={timeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
              size="small"
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="year">Last year</MenuItem>
              <MenuItem value="all">All time</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={() => handleExportData('csv')}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4" component="div">
                {formatNumber(analytics.summary.totalRequests)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {requestsChange.isPositive ? (
                  <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={requestsChange.isPositive ? 'success.main' : 'error.main'}
                >
                  {requestsChange.value}% from previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Revenue
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(analytics.summary.totalRevenue)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {revenueChange.isPositive ? (
                  <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={revenueChange.isPositive ? 'success.main' : 'error.main'}
                >
                  {revenueChange.value}% from previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" component="div">
                {formatNumber(analytics.summary.totalUsers)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {usersChange.isPositive ? (
                  <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={usersChange.isPositive ? 'success.main' : 'error.main'}
                >
                  {usersChange.value}% from previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg Response Time
              </Typography>
              <Typography variant="h4" component="div">
                {analytics.summary.averageResponseTime}s
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {responseTimeChange.isPositive ? (
                  <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={responseTimeChange.isPositive ? 'success.main' : 'error.main'}
                >
                  {responseTimeChange.value}% faster than before
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" component="div">
                {analytics.summary.successRate}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {successRateChange.isPositive ? (
                  <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={successRateChange.isPositive ? 'success.main' : 'error.main'}
                >
                  {successRateChange.value}% from previous period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<TimelineIcon />} label="Usage" />
          <Tab icon={<MonetizationOnIcon />} label="Revenue" />
          <Tab icon={<PeopleIcon />} label="Users" />
          <Tab icon={<BarChartIcon />} label="Performance" />
          <Tab icon={<HistoryIcon />} label="Version History" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Usage Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Requests Over Time
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.requestsOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Requests" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Requests by Type
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.requestsByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="type"
                      >
                        {analytics.requestsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Requests by Status
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.requestsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                      >
                        {analytics.requestsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Revenue Tab */}
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Revenue Over Time
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.revenueOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#82ca9d" activeDot={{ r: 8 }} name="Revenue" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Top Revenue Generating Users
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell align="right">Requests</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.topUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell component="th" scope="row">
                            {user.username}
                          </TableCell>
                          <TableCell align="right">{formatNumber(user.requestCount)}</TableCell>
                          <TableCell align="right">{formatCurrency(user.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
          
          {/* Users Tab */}
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  User Growth Over Time
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.usersOverTime}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Top Users by Usage
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell align="right">Requests</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.topUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell component="th" scope="row">
                            {user.username}
                          </TableCell>
                          <TableCell align="right">{formatNumber(user.requestCount)}</TableCell>
                          <TableCell align="right">{formatCurrency(user.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
          
          {/* Performance Tab */}
          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Response Time Distribution
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.responseTimeDistribution}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Requests" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Success Rate Over Time
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      Success rate trend chart will be displayed here
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Error Types
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      Error types distribution will be displayed here
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {/* Version History Tab */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Version History
                </Typography>
                {loadingVersions ? (
                  <CircularProgress />
                ) : errorVersions ? (
                  <Alert severity="error">Error loading version history: {errorVersions.message}</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Version</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Changed By</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {versions.map((version) => (
                          <TableRow key={version.id}>
                            <TableCell>
                              <Chip label={version.version} color="primary" size="small" />
                            </TableCell>
                            <TableCell>{version.description}</TableCell>
                            <TableCell>{version.changedBy.username}</TableCell>
                            <TableCell>{new Date(version.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
      
      {/* Export Options */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Export Options
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => handleExportData('csv')}>
            Export as CSV
          </Button>
          <Button variant="outlined" onClick={() => handleExportData('json')}>
            Export as JSON
          </Button>
          <Button variant="outlined" onClick={() => handleExportData('pdf')}>
            Export as PDF
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AgentAnalyticsDashboard;
