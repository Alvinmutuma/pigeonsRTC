import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';

// GraphQL Queries
const GET_USE_CASES = gql`
  query GetUseCases($industry: String, $businessSize: String, $featured: Boolean, $status: UseCaseStatus, $limit: Int, $offset: Int) {
    useCases(industry: $industry, businessSize: $businessSize, featured: $featured, status: $status, limit: $limit, offset: $offset) {
      useCases {
        id
        title
        description
        industry
        businessSize
        challenge
        solution
        results
        featured
        tags
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
        }
        mediaAssets {
          id
          type
          url
          title
        }
        author {
          id
          username
        }
        createdAt
      }
      totalCount
    }
  }
`;

const GET_FEATURED_USE_CASES = gql`
  query GetFeaturedUseCases($limit: Int) {
    featuredUseCases(limit: $limit) {
      id
      title
      description
      industry
      businessSize
      featured
      mediaAssets {
        id
        type
        url
        title
      }
    }
  }
`;

const UseCaseLibrary = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessSize, setBusinessSize] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(6);
  
  // Calculate offset for pagination
  const offset = (page - 1) * itemsPerPage;
  
  // Queries
  const { loading: loadingUseCases, error: errorUseCases, data: useCasesData } = useQuery(GET_USE_CASES, {
    variables: {
      industry: industry || undefined,
      businessSize: businessSize || undefined,
      featured: undefined,
      status: 'PUBLISHED',
      limit: itemsPerPage,
      offset
    }
  });
  
  const { loading: loadingFeatured, error: errorFeatured, data: featuredData } = useQuery(GET_FEATURED_USE_CASES, {
    variables: { limit: 3 }
  });
  
  // Handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleIndustryChange = (event) => {
    setIndustry(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  const handleBusinessSizeChange = (event) => {
    setBusinessSize(event.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setIndustry('');
    setBusinessSize('');
    setPage(1);
  };
  
  // Filtered use cases
  const filteredUseCases = useCasesData?.useCases?.useCases || [];
  const totalCount = useCasesData?.useCases?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  // Featured use cases
  const featuredUseCases = featuredData?.featuredUseCases || [];
  
  // Industry options (would typically come from an API)
  const industryOptions = [
    'Healthcare',
    'Finance',
    'Retail',
    'Technology',
    'Education',
    'Manufacturing',
    'Real Estate',
    'Legal',
    'Marketing',
    'Customer Service'
  ];
  
  // Business size options
  const businessSizeOptions = [
    'SMALL',
    'MEDIUM',
    'ENTERPRISE',
    'ALL'
  ];
  
  // Helper function to get image URL or default
  const getImageUrl = (useCase) => {
    const image = useCase.mediaAssets?.find(asset => asset.type === 'IMAGE');
    return image?.url || 'https://via.placeholder.com/300x160?text=Use+Case';
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Use Case Library
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explore real-world applications of AI agents across different industries and business sizes.
          Learn how organizations are leveraging AI to solve specific challenges and achieve measurable results.
        </Typography>
      </Box>
      
      {/* Featured Use Cases */}
      {!loadingFeatured && !errorFeatured && featuredUseCases.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ mr: 1 }} /> Featured Use Cases
          </Typography>
          
          <Grid container spacing={3}>
            {featuredUseCases.map((useCase) => (
              <Grid item xs={12} md={4} key={useCase.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={getImageUrl(useCase)}
                    alt={useCase.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {useCase.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {useCase.industry}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {useCase.description.length > 120 
                        ? `${useCase.description.substring(0, 120)}...` 
                        : useCase.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" href={`/use-cases/${useCase.id}`}>
                      Learn More
                    </Button>
                    <Chip 
                      size="small" 
                      label={useCase.businessSize} 
                      color="primary" 
                      variant="outlined" 
                      sx={{ ml: 'auto' }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Search and Filters */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search Use Cases"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />
        
        <FormControl sx={{ minWidth: '200px' }}>
          <InputLabel id="industry-label">Industry</InputLabel>
          <Select
            labelId="industry-label"
            value={industry}
            label="Industry"
            onChange={handleIndustryChange}
            startAdornment={<CategoryIcon sx={{ color: 'action.active', mr: 1 }} />}
          >
            <MenuItem value="">All Industries</MenuItem>
            {industryOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: '200px' }}>
          <InputLabel id="business-size-label">Business Size</InputLabel>
          <Select
            labelId="business-size-label"
            value={businessSize}
            label="Business Size"
            onChange={handleBusinessSizeChange}
            startAdornment={<BusinessIcon sx={{ color: 'action.active', mr: 1 }} />}
          >
            <MenuItem value="">All Sizes</MenuItem>
            {businessSizeOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <Button 
          variant="outlined" 
          startIcon={<FilterListIcon />}
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </Box>
      
      {/* Use Cases Grid */}
      {loadingUseCases ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : errorUseCases ? (
        <Alert severity="error">Error loading use cases: {errorUseCases.message}</Alert>
      ) : filteredUseCases.length === 0 ? (
        <Alert severity="info">
          No use cases found matching your criteria. Try adjusting your filters.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredUseCases.map((useCase) => (
              <Grid item xs={12} sm={6} md={4} key={useCase.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={getImageUrl(useCase)}
                    alt={useCase.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {useCase.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {useCase.industry}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {useCase.description.length > 120 
                        ? `${useCase.description.substring(0, 120)}...` 
                        : useCase.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {useCase.tags?.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                      {useCase.tags?.length > 3 && (
                        <Chip label={`+${useCase.tags.length - 3}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" href={`/use-cases/${useCase.id}`}>
                      Learn More
                    </Button>
                    <Chip 
                      size="small" 
                      label={useCase.businessSize} 
                      color="primary" 
                      variant="outlined" 
                      sx={{ ml: 'auto' }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default UseCaseLibrary;
