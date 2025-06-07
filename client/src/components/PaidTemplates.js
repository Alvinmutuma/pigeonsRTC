import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Rating,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CodeIcon from '@mui/icons-material/Code';
import CategoryIcon from '@mui/icons-material/Category';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import InfoIcon from '@mui/icons-material/Info';

// GraphQL Queries and Mutations
const GET_TEMPLATES = gql`
  query GetTemplates($category: String, $searchTerm: String, $sortBy: String, $limit: Int, $offset: Int) {
    templates(category: $category, searchTerm: $searchTerm, sortBy: $sortBy, limit: $limit, offset: $offset) {
      templates {
        id
        name
        description
        category
        price
        currency
        thumbnailUrl
        rating
        reviewCount
        downloadCount
        author {
          id
          username
          avatar
        }
        tags
        createdAt
        isFeatured
      }
      totalCount
    }
  }
`;

const GET_TEMPLATE_DETAILS = gql`
  query GetTemplateDetails($id: ID!) {
    template(id: $id) {
      id
      name
      description
      longDescription
      category
      price
      currency
      thumbnailUrl
      demoUrl
      rating
      reviewCount
      downloadCount
      author {
        id
        username
        avatar
      }
      tags
      features
      requirements
      createdAt
      updatedAt
      isFeatured
      reviews {
        id
        user {
          id
          username
          avatar
        }
        rating
        comment
        createdAt
      }
      relatedTemplates {
        id
        name
        thumbnailUrl
        price
        currency
      }
    }
  }
`;

const PURCHASE_TEMPLATE = gql`
  mutation PurchaseTemplate($templateId: ID!) {
    purchaseTemplate(templateId: $templateId) {
      id
      downloadUrl
      purchaseDate
    }
  }
`;

const ADD_TO_FAVORITES = gql`
  mutation AddTemplateToFavorites($templateId: ID!) {
    addTemplateToFavorites(templateId: $templateId) {
      id
      isFavorite
    }
  }
`;

const REMOVE_FROM_FAVORITES = gql`
  mutation RemoveTemplateFromFavorites($templateId: ID!) {
    removeTemplateFromFavorites(templateId: $templateId) {
      id
      isFavorite
    }
  }
`;

// Template categories
const TEMPLATE_CATEGORIES = [
  'HR Bot',
  'Customer Support',
  'Data Analysis',
  'Legal Assistant',
  'Marketing Assistant',
  'Sales Bot',
  'Content Generator',
  'Research Assistant',
  'Personal Assistant',
  'Healthcare Bot'
];

const PaidTemplates = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Calculate offset for pagination
  const offset = page * rowsPerPage;

  // Queries
  const { loading, error, data, refetch } = useQuery(GET_TEMPLATES, {
    variables: {
      category: category || undefined,
      searchTerm: searchTerm || undefined,
      sortBy,
      limit: rowsPerPage,
      offset
    }
  });

  const { loading: loadingDetails, error: errorDetails, data: detailsData } = useQuery(GET_TEMPLATE_DETAILS, {
    variables: { id: selectedTemplate },
    skip: !selectedTemplate
  });

  // Mutations
  const [purchaseTemplate, { loading: purchasing }] = useMutation(PURCHASE_TEMPLATE, {
    onCompleted: (data) => {
      // Handle successful purchase, e.g., redirect to download page
      alert(`Template purchased! Download URL: ${data.purchaseTemplate.downloadUrl}`);
      setOpenDialog(false);
    },
    onError: (error) => {
      alert(`Error purchasing template: ${error.message}`);
    }
  });

  const [addToFavorites] = useMutation(ADD_TO_FAVORITES, {
    onCompleted: () => {
      refetch();
    }
  });

  const [removeFromFavorites] = useMutation(REMOVE_FROM_FAVORITES, {
    onCompleted: () => {
      refetch();
    }
  });

  // Handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (templateId) => {
    setSelectedTemplate(templateId);
    setOpenDialog(true);
    setActiveTab(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePurchase = () => {
    purchaseTemplate({
      variables: { templateId: selectedTemplate }
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleToggleFavorite = (templateId, isFavorite) => {
    if (isFavorite) {
      removeFromFavorites({
        variables: { templateId }
      });
    } else {
      addToFavorites({
        variables: { templateId }
      });
    }
  };

  // Format currency
  const formatCurrency = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(price);
  };

  // Render templates grid
  const renderTemplates = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading templates: {error.message}
        </Alert>
      );
    }

    const templates = data?.templates?.templates || [];
    const totalCount = data?.templates?.totalCount || 0;

    if (templates.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No templates found matching your criteria
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setSearchTerm('');
              setCategory('');
              setSortBy('popular');
            }}
            sx={{ mt: 2 }}
          >
            Clear Filters
          </Button>
        </Box>
      );
    }

    return (
      <>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {templates.length} of {totalCount} templates
        </Typography>
        
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {template.isFeatured && (
                  <Chip 
                    label="Featured" 
                    color="primary" 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10,
                      zIndex: 1
                    }} 
                  />
                )}
                <CardMedia
                  component="img"
                  height="140"
                  image={template.thumbnailUrl || 'https://via.placeholder.com/300x140?text=Template'}
                  alt={template.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {template.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CategoryIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {template.category}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {template.description.length > 100 
                      ? `${template.description.substring(0, 100)}...` 
                      : template.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                      value={template.rating} 
                      precision={0.5} 
                      size="small" 
                      readOnly 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                      ({template.reviewCount})
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {template.tags.slice(0, 3).map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {template.tags.length > 3 && (
                      <Chip 
                        label={`+${template.tags.length - 3}`} 
                        size="small" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Typography variant="h6" color="primary">
                    {template.price === 0 ? 'Free' : formatCurrency(template.price, template.currency)}
                  </Typography>
                  <Box>
                    <Tooltip title="Add to Favorites">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(template.id, template.isFavorite);
                        }}
                      >
                        {template.isFavorite ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Button 
                      size="small" 
                      variant="contained" 
                      endIcon={<ShoppingCartIcon />}
                      onClick={() => handleOpenDialog(template.id)}
                    >
                      {template.price === 0 ? 'Get' : 'Buy'}
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  // Render template details dialog
  const renderTemplateDetails = () => {
    if (loadingDetails) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (errorDetails) {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading template details: {errorDetails.message}
        </Alert>
      );
    }

    const template = detailsData?.template;
    if (!template) return null;

    return (
      <>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{template.name}</Typography>
            <Chip 
              label={template.category} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <img 
              src={template.thumbnailUrl || 'https://via.placeholder.com/600x300?text=Template'} 
              alt={template.name} 
              style={{ width: '100%', borderRadius: 8 }}
            />
          </Box>
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Overview" />
            <Tab label="Features" />
            <Tab label="Reviews" />
          </Tabs>
          
          {activeTab === 0 && (
            <>
              <Typography variant="body1" paragraph>
                {template.longDescription || template.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>Author:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={template.author.avatar || 'https://via.placeholder.com/40'} 
                    alt={template.author.username} 
                    style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 8 }}
                  />
                  <Typography>{template.author.username}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                  <DownloadIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{template.downloadCount} downloads</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={template.rating} precision={0.5} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    ({template.reviewCount} reviews)
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>Tags:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {template.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>Requirements:</Typography>
              <ul>
                {template.requirements?.map((req, index) => (
                  <li key={index}>
                    <Typography variant="body2">{req}</Typography>
                  </li>
                ))}
              </ul>
            </>
          )}
          
          {activeTab === 1 && (
            <>
              <Typography variant="subtitle1" gutterBottom>Key Features:</Typography>
              <ul>
                {template.features?.map((feature, index) => (
                  <li key={index}>
                    <Typography variant="body2">{feature}</Typography>
                  </li>
                ))}
              </ul>
              
              {template.demoUrl && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<VisibilityIcon />}
                    href={template.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Demo
                  </Button>
                </Box>
              )}
            </>
          )}
          
          {activeTab === 2 && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Reviews ({template.reviews?.length || 0})
              </Typography>
              
              {template.reviews?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No reviews yet
                </Typography>
              ) : (
                template.reviews?.map((review) => (
                  <Box key={review.id} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <img 
                        src={review.user.avatar || 'https://via.placeholder.com/40'} 
                        alt={review.user.username} 
                        style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 8 }}
                      />
                      <Box>
                        <Typography variant="subtitle2">{review.user.username}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Rating 
                        value={review.rating} 
                        precision={0.5} 
                        size="small" 
                        readOnly 
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2">{review.comment}</Typography>
                  </Box>
                ))
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h5" color="primary">
            {template.price === 0 ? 'Free' : formatCurrency(template.price, template.currency)}
          </Typography>
          <Box>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handlePurchase}
              startIcon={template.price === 0 ? <DownloadIcon /> : <ShoppingCartIcon />}
              disabled={purchasing}
            >
              {purchasing ? <CircularProgress size={24} /> : (template.price === 0 ? 'Download' : 'Purchase')}
            </Button>
          </Box>
        </DialogActions>
      </>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Agent Templates & Starter Kits
      </Typography>
      <Typography variant="body1" paragraph>
        Browse our collection of pre-built agent templates and starter kits. Get your AI agent up and running in minutes with professionally designed templates for various use cases.
      </Typography>
      
      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search templates..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              value={category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="">All Categories</MenuItem>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel id="sort-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price_low">Price: Low to High</MenuItem>
              <MenuItem value="price_high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Featured Templates Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CodeIcon sx={{ mr: 1 }} /> Featured Templates
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {/* Featured templates would be rendered here */}
      </Box>
      
      {/* All Templates Section */}
      <Box>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} /> All Templates
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderTemplates()}
      </Box>
      
      {/* Template Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {renderTemplateDetails()}
      </Dialog>
    </Box>
  );
};

export default PaidTemplates;
