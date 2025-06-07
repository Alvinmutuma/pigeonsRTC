import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Divider,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StepsIcon from '@mui/icons-material/Stairs';
import PersonIcon from '@mui/icons-material/Person';

// GraphQL Query
const GET_USE_CASE = gql`
  query GetUseCase($id: ID!) {
    useCase(id: $id) {
      id
      title
      description
      industry
      businessSize
      challenge
      solution
      results
      metrics {
        name
        value
        improvement
      }
      testimonial {
        quote
        author
        position
        company
      }
      relatedAgents {
        id
        name
        description
        category
        pricing {
          type
          amount
          currency
          details
        }
      }
      implementationSteps {
        order
        title
        description
      }
      mediaAssets {
        id
        type
        url
        title
        description
      }
      featured
      tags
      author {
        id
        username
      }
      createdAt
    }
  }
`;

const UseCaseDetail = () => {
  const { id } = useParams();
  
  const { loading, error, data } = useQuery(GET_USE_CASE, {
    variables: { id },
    skip: !id
  });
  
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Alert severity="error" sx={{ my: 4 }}>
      Error loading use case: {error.message}
    </Alert>
  );
  
  if (!data?.useCase) return (
    <Alert severity="warning" sx={{ my: 4 }}>
      Use case not found
    </Alert>
  );
  
  const useCase = data.useCase;
  
  // Helper function to get main image URL or default
  const getMainImageUrl = () => {
    const image = useCase.mediaAssets?.find(asset => asset.type === 'IMAGE');
    return image?.url || 'https://via.placeholder.com/800x400?text=Use+Case';
  };
  
  return (
    <Box sx={{ mt: 4, mb: 8 }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        sx={{ mb: 2 }}
        href="/use-cases"
      >
        Back to Use Cases
      </Button>
      
      {/* Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${getMainImageUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="overline">
              {useCase.industry} • {useCase.businessSize}
            </Typography>
            <Typography variant="h3" component="h1" gutterBottom>
              {useCase.title}
            </Typography>
            <Typography variant="subtitle1" paragraph>
              {useCase.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {useCase.tags?.map((tag) => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  sx={{ color: 'white', borderColor: 'white' }} 
                  variant="outlined" 
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {useCase.featured && (
              <Chip 
                icon={<CheckCircleIcon />} 
                label="Featured Use Case" 
                color="primary" 
                sx={{ alignSelf: 'flex-end', mb: 2 }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column - Main Content */}
        <Grid item xs={12} md={8}>
          {/* Challenge Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              The Challenge
            </Typography>
            <Typography variant="body1" paragraph>
              {useCase.challenge}
            </Typography>
          </Paper>
          
          {/* Solution Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              The Solution
            </Typography>
            <Typography variant="body1" paragraph>
              {useCase.solution}
            </Typography>
          </Paper>
          
          {/* Results Section */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              The Results
            </Typography>
            <Typography variant="body1" paragraph>
              {useCase.results}
            </Typography>
            
            {/* Metrics */}
            {useCase.metrics && useCase.metrics.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Key Metrics
                </Typography>
                <Grid container spacing={2}>
                  {useCase.metrics.map((metric, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h4" color="primary" gutterBottom>
                            {metric.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {metric.name}
                          </Typography>
                          {metric.improvement && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                              <Typography variant="body2" color="success.main">
                                {metric.improvement}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
          
          {/* Implementation Steps */}
          {useCase.implementationSteps && useCase.implementationSteps.length > 0 && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <StepsIcon sx={{ mr: 1 }} /> Implementation Steps
              </Typography>
              <List>
                {useCase.implementationSteps
                  .sort((a, b) => a.order - b.order)
                  .map((step) => (
                    <ListItem key={step.order} alignItems="flex-start">
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{step.order}</Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={step.title}
                        secondary={step.description}
                        primaryTypographyProps={{ variant: 'h6' }}
                        secondaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  ))}
              </List>
            </Paper>
          )}
        </Grid>
        
        {/* Right Column - Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Industry & Business Size */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Industry" 
                  secondary={useCase.industry} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Business Size" 
                  secondary={useCase.businessSize} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Author" 
                  secondary={useCase.author.username} 
                />
              </ListItem>
            </List>
          </Paper>
          
          {/* Testimonial */}
          {useCase.testimonial && (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Testimonial
              </Typography>
              <Box sx={{ display: 'flex' }}>
                <FormatQuoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                <Box>
                  <Typography variant="body1" paragraph>
                    "{useCase.testimonial.quote}"
                  </Typography>
                  <Typography variant="subtitle2">
                    {useCase.testimonial.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {useCase.testimonial.position}{useCase.testimonial.company && `, ${useCase.testimonial.company}`}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
          
          {/* Related Agents */}
          {useCase.relatedAgents && useCase.relatedAgents.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Related AI Agents
              </Typography>
              {useCase.relatedAgents.map((agent) => (
                <Card key={agent.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{agent.name}</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {agent.description.length > 100 
                        ? `${agent.description.substring(0, 100)}...` 
                        : agent.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={agent.category} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Typography variant="subtitle2" color="primary">
                        {agent.pricing.type === 'FREE' 
                          ? 'Free' 
                          : `${agent.pricing.amount} ${agent.pricing.currency}`}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Divider />
                  <Box sx={{ p: 1 }}>
                    <Button size="small" href={`/agents/${agent.id}`}>
                      View Agent
                    </Button>
                  </Box>
                </Card>
              ))}
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default UseCaseDetail;
