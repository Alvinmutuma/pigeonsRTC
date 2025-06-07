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
  TextField,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQuery, gql } from '@apollo/client';

// GraphQL Queries and Mutations
const GET_API_KEYS = gql`
  query GetApiKeys {
    apiKeys {
      id
      name
      prefix
      createdAt
      lastUsed
      status
      rateLimit
      permissions
    }
  }
`;

const CREATE_API_KEY = gql`
  mutation CreateApiKey($input: ApiKeyInput!) {
    createApiKey(input: $input) {
      id
      name
      key
      prefix
      createdAt
      status
      rateLimit
      permissions
    }
  }
`;

const REVOKE_API_KEY = gql`
  mutation RevokeApiKey($id: ID!) {
    revokeApiKey(id: $id) {
      id
      status
    }
  }
`;

const UPDATE_API_KEY = gql`
  mutation UpdateApiKey($id: ID!, $input: ApiKeyUpdateInput!) {
    updateApiKey(id: $id, input: $input) {
      id
      name
      status
      rateLimit
      permissions
    }
  }
`;

const ApiKeyManagement = () => {
  // State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    rateLimit: 100,
    permissions: ['read', 'write']
  });
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');

  // Queries
  const { loading, error, data, refetch } = useQuery(GET_API_KEYS);

  // Mutations
  const [createApiKey, { loading: creatingKey }] = useMutation(CREATE_API_KEY, {
    onCompleted: (data) => {
      setNewKeyValue(data.createApiKey.key);
      setShowNewKey(true);
      refetch();
    }
  });

  const [revokeApiKey, { loading: revokingKey }] = useMutation(REVOKE_API_KEY, {
    onCompleted: () => {
      refetch();
    }
  });

  const [updateApiKey, { loading: updatingKey }] = useMutation(UPDATE_API_KEY, {
    onCompleted: () => {
      setOpenDialog(false);
      setEditingKey(null);
      refetch();
    }
  });

  // Handlers
  const handleOpenDialog = (key = null) => {
    if (key) {
      setEditingKey(key);
      setNewKeyData({
        name: key.name,
        rateLimit: key.rateLimit,
        permissions: key.permissions
      });
    } else {
      setEditingKey(null);
      setNewKeyData({
        name: '',
        rateLimit: 100,
        permissions: ['read', 'write']
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingKey(null);
  };

  const handleInputChange = (field) => (event) => {
    setNewKeyData({
      ...newKeyData,
      [field]: event.target.value
    });
  };

  const handlePermissionChange = (permission) => (event) => {
    const checked = event.target.checked;
    let newPermissions = [...newKeyData.permissions];
    
    if (checked && !newPermissions.includes(permission)) {
      newPermissions.push(permission);
    } else if (!checked && newPermissions.includes(permission)) {
      newPermissions = newPermissions.filter(p => p !== permission);
    }
    
    setNewKeyData({
      ...newKeyData,
      permissions: newPermissions
    });
  };

  const handleCreateKey = () => {
    createApiKey({
      variables: {
        input: newKeyData
      }
    });
    setOpenDialog(false);
  };

  const handleUpdateKey = () => {
    updateApiKey({
      variables: {
        id: editingKey.id,
        input: newKeyData
      }
    });
  };

  const handleRevokeKey = (id) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      revokeApiKey({
        variables: { id }
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Render API keys
  const renderApiKeys = () => {
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
          Error loading API keys: {error.message}
        </Alert>
      );
    }

    const apiKeys = data?.apiKeys || [];

    if (apiKeys.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No API keys found. Create your first API key to get started.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Create API Key
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {apiKeys.map((key) => (
          <Grid item xs={12} md={6} key={key.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{key.name}</Typography>
                  <Chip 
                    label={key.status} 
                    color={key.status === 'active' ? 'success' : 'error'} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Key: {key.prefix}••••••••••••••••
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(key.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Used: {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Rate Limit: {key.rateLimit} req/min
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Permissions: {key.permissions.join(', ')}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  onClick={() => handleOpenDialog(key)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  onClick={() => handleRevokeKey(key.id)}
                  disabled={revokingKey}
                >
                  {revokingKey ? <CircularProgress size={24} /> : 'Revoke'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">API Key Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create API Key
        </Button>
      </Box>

      <Typography variant="body1" paragraph>
        Create and manage API keys to access the AI Agent Marketplace API. Each key can have different permissions and rate limits.
      </Typography>

      {showNewKey && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          action={
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={() => setShowNewKey(false)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            API Key Created Successfully
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={newKeyValue}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={() => copyToClipboard(newKeyValue)}>
                    <ContentCopyIcon />
                  </IconButton>
                )
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Make sure to copy this key now. For security reasons, you won't be able to see it again.
          </Typography>
        </Alert>
      )}

      {renderApiKeys()}

      {/* Create/Edit API Key Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingKey ? 'Edit API Key' : 'Create New API Key'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Key Name"
              value={newKeyData.name}
              onChange={handleInputChange('name')}
              margin="normal"
              placeholder="e.g., Production API Key"
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="rate-limit-label">Rate Limit (requests per minute)</InputLabel>
              <Select
                labelId="rate-limit-label"
                value={newKeyData.rateLimit}
                onChange={handleInputChange('rateLimit')}
                label="Rate Limit (requests per minute)"
              >
                <MenuItem value={10}>10 req/min</MenuItem>
                <MenuItem value={50}>50 req/min</MenuItem>
                <MenuItem value={100}>100 req/min</MenuItem>
                <MenuItem value={500}>500 req/min</MenuItem>
                <MenuItem value={1000}>1000 req/min</MenuItem>
                <MenuItem value={5000}>5000 req/min</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Permissions
            </Typography>
            <FormControlLabel
              control={
                <Switch 
                  checked={newKeyData.permissions.includes('read')} 
                  onChange={handlePermissionChange('read')} 
                />
              }
              label="Read (Get data from API)"
            />
            <FormControlLabel
              control={
                <Switch 
                  checked={newKeyData.permissions.includes('write')} 
                  onChange={handlePermissionChange('write')} 
                />
              }
              label="Write (Create and update data)"
            />
            <FormControlLabel
              control={
                <Switch 
                  checked={newKeyData.permissions.includes('delete')} 
                  onChange={handlePermissionChange('delete')} 
                />
              }
              label="Delete (Remove data)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={editingKey ? handleUpdateKey : handleCreateKey}
            disabled={creatingKey || updatingKey || !newKeyData.name}
          >
            {creatingKey || updatingKey ? (
              <CircularProgress size={24} />
            ) : (
              editingKey ? 'Update Key' : 'Create Key'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ApiKeyManagement;
