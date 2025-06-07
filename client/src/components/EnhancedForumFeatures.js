import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Badge
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/Comment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PushPinIcon from '@mui/icons-material/PushPin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';

// GraphQL Queries
const GET_FORUM_POSTS = gql`
  query GetForumPosts($categoryId: ID, $authorId: ID, $tag: String, $sortBy: String, $limit: Int, $offset: Int) {
    forumPosts(categoryId: $categoryId, authorId: $authorId, tag: $tag, sortBy: $sortBy, limit: $limit, offset: $offset) {
      posts {
        id
        title
        content
        author {
          id
          username
          avatar
        }
        category {
          id
          name
        }
        tags
        upvotes
        downvotes
        views
        isPinned
        isLocked
        createdAt
        updatedAt
        commentCount
      }
      totalCount
    }
  }
`;

const GET_TRENDING_TOPICS = gql`
  query GetTrendingTopics {
    trendingTopics {
      id
      title
      views
      upvotes
      commentCount
      category {
        id
        name
      }
    }
  }
`;

const GET_UPCOMING_AMAS = gql`
  query GetUpcomingAMAs {
    upcomingAMAs {
      id
      title
      developer {
        id
        username
        avatar
      }
      startTime
      participantCount
    }
  }
`;

const GET_SPONSORED_POSTS = gql`
  query GetSponsoredPosts {
    sponsoredPosts {
      id
      title
      sponsor {
        id
        name
        logo
      }
      content
      ctaText
      ctaLink
      impressions
      clicks
    }
  }
`;

// Mutations
const UPVOTE_POST = gql`
  mutation UpvoteForumPost($id: ID!) {
    upvoteForumPost(id: $id) {
      id
      upvotes
      downvotes
    }
  }
`;

const DOWNVOTE_POST = gql`
  mutation DownvoteForumPost($id: ID!) {
    downvoteForumPost(id: $id) {
      id
      upvotes
      downvotes
    }
  }
`;

const CREATE_SPONSORED_POST = gql`
  mutation CreateSponsoredPost($input: SponsoredPostInput!) {
    createSponsoredPost(input: $input) {
      id
      title
    }
  }
`;

const EnhancedForumFeatures = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [anchorElSort, setAnchorElSort] = useState(null);
  const [anchorElFilter, setAnchorElFilter] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openSponsoredDialog, setOpenSponsoredDialog] = useState(false);
  const [sponsoredPostData, setSponsoredPostData] = useState({
    title: '',
    content: '',
    ctaText: 'Learn More',
    ctaLink: '',
    budget: 100
  });

  // Queries
  const { loading: loadingPosts, error: errorPosts, data: postsData } = useQuery(GET_FORUM_POSTS, {
    variables: {
      categoryId: selectedCategory,
      tag: selectedTag,
      sortBy,
      limit: rowsPerPage,
      offset: page * rowsPerPage
    }
  });

  const { loading: loadingTrending, error: errorTrending, data: trendingData } = useQuery(GET_TRENDING_TOPICS);
  const { loading: loadingAMAs, error: errorAMAs, data: amasData } = useQuery(GET_UPCOMING_AMAS);
  const { loading: loadingSponsored, error: errorSponsored, data: sponsoredData } = useQuery(GET_SPONSORED_POSTS);

  // Mutations
  const [upvotePost] = useMutation(UPVOTE_POST);
  const [downvotePost] = useMutation(DOWNVOTE_POST);
  const [createSponsoredPost, { loading: creatingSponsored }] = useMutation(CREATE_SPONSORED_POST, {
    onCompleted: () => {
      setOpenSponsoredDialog(false);
      setSponsoredPostData({
        title: '',
        content: '',
        ctaText: 'Learn More',
        ctaLink: '',
        budget: 100
      });
    }
  });

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSortMenuOpen = (event) => {
    setAnchorElSort(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setAnchorElSort(null);
  };

  const handleFilterMenuOpen = (event) => {
    setAnchorElFilter(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setAnchorElFilter(null);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    handleSortMenuClose();
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    handleFilterMenuClose();
  };

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    handleFilterMenuClose();
  };

  const handleUpvote = (postId) => {
    upvotePost({ variables: { id: postId } });
  };

  const handleDownvote = (postId) => {
    downvotePost({ variables: { id: postId } });
  };

  const handleOpenSponsoredDialog = () => {
    setOpenSponsoredDialog(true);
  };

  const handleCloseSponsoredDialog = () => {
    setOpenSponsoredDialog(false);
  };

  const handleSponsoredInputChange = (e) => {
    const { name, value } = e.target;
    setSponsoredPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSponsoredPost = () => {
    createSponsoredPost({
      variables: {
        input: sponsoredPostData
      }
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render forum posts
  const renderForumPosts = () => {
    if (loadingPosts) return <CircularProgress />;
    if (errorPosts) return <Alert severity="error">Error loading posts: {errorPosts.message}</Alert>;

    const posts = postsData?.forumPosts?.posts || [];
    const totalCount = postsData?.forumPosts?.totalCount || 0;

    if (posts.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No posts found. Try adjusting your filters.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <List>
          {posts.map((post) => (
            <Paper key={post.id} sx={{ mb: 2, overflow: 'hidden' }}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  bgcolor: post.isPinned ? 'action.selected' : 'inherit',
                  borderLeft: post.isPinned ? 4 : 0,
                  borderColor: 'primary.main'
                }}
              >
                <ListItemAvatar>
                  <Avatar src={post.author.avatar} alt={post.author.username} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {post.isPinned && <PushPinIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />}
                        {post.title}
                      </Typography>
                      <Box>
                        <Chip 
                          size="small" 
                          label={post.category.name} 
                          sx={{ mr: 1 }} 
                        />
                        {post.isLocked && (
                          <Chip 
                            size="small" 
                            label="Locked" 
                            color="error" 
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mt: 1 }}
                      >
                        {post.content.substring(0, 150)}
                        {post.content.length > 150 ? '...' : ''}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {post.tags.map((tag) => (
                          <Chip 
                            key={tag} 
                            label={tag} 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleTagChange(tag)}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">{post.author.username}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">{formatDate(post.createdAt)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">{post.commentCount}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">{post.views}</Typography>
                        </Box>
                      </Box>
                    </>
                  }
                />
              </ListItem>
              <Divider />
              <Box sx={{ display: 'flex', p: 1 }}>
                <Button 
                  size="small" 
                  startIcon={<ThumbUpIcon />}
                  onClick={() => handleUpvote(post.id)}
                >
                  {post.upvotes}
                </Button>
                <Button 
                  size="small" 
                  startIcon={<ThumbDownIcon />}
                  onClick={() => handleDownvote(post.id)}
                >
                  {post.downvotes}
                </Button>
                <Button 
                  size="small" 
                  startIcon={<CommentIcon />}
                  href={`/forum/post/${post.id}`}
                  sx={{ ml: 'auto' }}
                >
                  View Discussion
                </Button>
              </Box>
            </Paper>
          ))}
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {posts.length} of {totalCount} posts
          </Typography>
        </Box>
      </>
    );
  };

  // Render trending topics
  const renderTrendingTopics = () => {
    if (loadingTrending) return <CircularProgress size={24} />;
    if (errorTrending) return <Alert severity="error" sx={{ mb: 2 }}>Error loading trending topics</Alert>;

    const topics = trendingData?.trendingTopics || [];

    if (topics.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No trending topics at the moment
        </Typography>
      );
    }

    return (
      <List dense>
        {topics.slice(0, 5).map((topic, index) => (
          <ListItem key={topic.id} button component="a" href={`/forum/post/${topic.id}`}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>{index + 1}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={topic.title}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                    <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">{topic.upvotes}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">{topic.commentCount}</Typography>
                  </Box>
                </Box>
              }
            />
            <Chip size="small" label={topic.category.name} />
          </ListItem>
        ))}
      </List>
    );
  };

  // Render upcoming AMAs
  const renderUpcomingAMAs = () => {
    if (loadingAMAs) return <CircularProgress size={24} />;
    if (errorAMAs) return <Alert severity="error" sx={{ mb: 2 }}>Error loading AMAs</Alert>;

    const amas = amasData?.upcomingAMAs || [];

    if (amas.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          No upcoming AMAs scheduled
        </Typography>
      );
    }

    return (
      <List dense>
        {amas.slice(0, 3).map((ama) => (
          <ListItem key={ama.id} button component="a" href={`/ama/${ama.id}`}>
            <ListItemAvatar>
              <Avatar src={ama.developer.avatar} alt={ama.developer.username} />
            </ListItemAvatar>
            <ListItemText
              primary={ama.title}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="caption">
                    {new Date(ama.startTime).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
            <Chip 
              size="small" 
              label={`${ama.participantCount} joined`} 
              color="primary" 
              variant="outlined" 
            />
          </ListItem>
        ))}
      </List>
    );
  };

  // Render sponsored posts
  const renderSponsoredPosts = () => {
    if (loadingSponsored) return <CircularProgress size={24} />;
    if (errorSponsored) return <Alert severity="error" sx={{ mb: 2 }}>Error loading sponsored content</Alert>;

    const sponsored = sponsoredData?.sponsoredPosts || [];

    if (sponsored.length === 0) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            No sponsored content
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<AddIcon />}
            onClick={handleOpenSponsoredDialog}
          >
            Create Sponsored Post
          </Button>
        </Box>
      );
    }

    return (
      <>
        <List dense>
          {sponsored.slice(0, 2).map((post) => (
            <Paper key={post.id} sx={{ mb: 1, p: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar src={post.sponsor.logo} alt={post.sponsor.name} sx={{ mr: 1 }} />
                <Typography variant="subtitle2">
                  {post.sponsor.name} <Chip size="small" label="Sponsored" variant="outlined" />
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                {post.content.substring(0, 100)}
                {post.content.length > 100 ? '...' : ''}
              </Typography>
              <Button 
                size="small" 
                variant="contained" 
                href={post.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {post.ctaText}
              </Button>
            </Paper>
          ))}
        </List>
        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <Button 
            size="small" 
            startIcon={<AddIcon />}
            onClick={handleOpenSponsoredDialog}
          >
            Create Sponsored Post
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Community Forum
      </Typography>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="All Discussions" />
              <Tab label="Trending" />
              <Tab label="AMAs" />
              <Tab label="My Posts" />
            </Tabs>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Button
                  startIcon={<SortIcon />}
                  onClick={handleSortMenuOpen}
                  size="small"
                >
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Button>
                <Menu
                  anchorEl={anchorElSort}
                  open={Boolean(anchorElSort)}
                  onClose={handleSortMenuClose}
                >
                  <MenuItem onClick={() => handleSortChange('newest')}>Newest</MenuItem>
                  <MenuItem onClick={() => handleSortChange('popular')}>Most Popular</MenuItem>
                  <MenuItem onClick={() => handleSortChange('active')}>Most Active</MenuItem>
                  <MenuItem onClick={() => handleSortChange('upvoted')}>Most Upvoted</MenuItem>
                </Menu>

                <Button
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterMenuOpen}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  Filter
                </Button>
                <Menu
                  anchorEl={anchorElFilter}
                  open={Boolean(anchorElFilter)}
                  onClose={handleFilterMenuClose}
                >
                  <MenuItem onClick={() => handleCategoryChange(null)}>All Categories</MenuItem>
                  <Divider />
                  <MenuItem onClick={() => handleCategoryChange('1')}>AI Agents</MenuItem>
                  <MenuItem onClick={() => handleCategoryChange('2')}>Development</MenuItem>
                  <MenuItem onClick={() => handleCategoryChange('3')}>Business Use Cases</MenuItem>
                  <MenuItem onClick={() => handleCategoryChange('4')}>Integrations</MenuItem>
                  <Divider />
                  <MenuItem onClick={() => handleTagChange(null)}>Clear Tag Filter</MenuItem>
                </Menu>
              </Box>

              <Button 
                variant="contained" 
                href="/forum/new-post"
              >
                New Post
              </Button>
            </Box>

            <Box sx={{ p: 2 }}>
              {activeTab === 0 && renderForumPosts()}
              {activeTab === 1 && (
                <Typography variant="body1">
                  Trending discussions will be shown here
                </Typography>
              )}
              {activeTab === 2 && (
                <Typography variant="body1">
                  AMA threads will be shown here
                </Typography>
              )}
              {activeTab === 3 && (
                <Typography variant="body1">
                  Your posts will be shown here
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Trending Topics */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ mr: 1 }} /> Trending Topics
            </Typography>
            {renderTrendingTopics()}
          </Paper>

          {/* Upcoming AMAs */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1 }} /> Upcoming AMAs
            </Typography>
            {renderUpcomingAMAs()}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined" size="small" href="/ama/schedule">
                View All AMAs
              </Button>
            </Box>
          </Paper>

          {/* Sponsored Content */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalOfferIcon sx={{ mr: 1 }} /> Sponsored
            </Typography>
            {renderSponsoredPosts()}
          </Paper>
        </Grid>
      </Grid>

      {/* Sponsored Post Dialog */}
      <Dialog open={openSponsoredDialog} onClose={handleCloseSponsoredDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create Sponsored Post</DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label="Title"
            fullWidth
            margin="normal"
            value={sponsoredPostData.title}
            onChange={handleSponsoredInputChange}
          />
          <TextField
            name="content"
            label="Content"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={sponsoredPostData.content}
            onChange={handleSponsoredInputChange}
          />
          <TextField
            name="ctaText"
            label="Call to Action Text"
            fullWidth
            margin="normal"
            value={sponsoredPostData.ctaText}
            onChange={handleSponsoredInputChange}
          />
          <TextField
            name="ctaLink"
            label="Call to Action Link"
            fullWidth
            margin="normal"
            value={sponsoredPostData.ctaLink}
            onChange={handleSponsoredInputChange}
          />
          <TextField
            name="budget"
            label="Budget (USD)"
            type="number"
            fullWidth
            margin="normal"
            value={sponsoredPostData.budget}
            onChange={handleSponsoredInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSponsoredDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateSponsoredPost} 
            color="primary"
            disabled={creatingSponsored || !sponsoredPostData.title || !sponsoredPostData.content || !sponsoredPostData.ctaLink}
          >
            {creatingSponsored ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedForumFeatures;
