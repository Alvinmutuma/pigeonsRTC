import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { 
  Box, 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GitHubIcon from '@mui/icons-material/GitHub';
import HistoryIcon from '@mui/icons-material/History';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import MergeIcon from '@mui/icons-material/Merge';

// GraphQL Queries and Mutations
const GET_COLLABORATORS = gql`
  query GetCollaborators($agentId: ID!) {
    agentCollaborators(agentId: $agentId) {
      id
      user {
        id
        username
        email
      }
      role
      addedAt
    }
  }
`;

const GET_VERSION_HISTORY = gql`
  query GetVersionHistory($agentId: ID!) {
    agentVersionHistory(agentId: $agentId) {
      id
      version
      description
      changedBy {
        id
        username
      }
      timestamp
      changes {
        field
        oldValue
        newValue
      }
    }
  }
`;

const ADD_COLLABORATOR = gql`
  mutation AddCollaborator($agentId: ID!, $input: CollaboratorInput!) {
    addCollaborator(agentId: $agentId, input: $input) {
      id
      name
    }
  }
`;

const UPDATE_COLLABORATOR_ROLE = gql`
  mutation UpdateCollaboratorRole($agentId: ID!, $userId: ID!, $role: CollaboratorRole!) {
    updateCollaboratorRole(agentId: $agentId, userId: $userId, role: $role) {
      id
      name
    }
  }
`;

const REMOVE_COLLABORATOR = gql`
  mutation RemoveCollaborator($agentId: ID!, $userId: ID!) {
    removeCollaborator(agentId: $agentId, userId: $userId) {
      id
      name
    }
  }
`;

const CREATE_VERSION = gql`
  mutation CreateAgentVersion($agentId: ID!, $input: VersionInput!) {
    createAgentVersion(agentId: $agentId, input: $input) {
      id
      version
      description
    }
  }
`;

const FORK_AGENT = gql`
  mutation ForkAgent($agentId: ID!, $name: String!) {
    forkAgent(agentId: $agentId, name: $name) {
      id
      name
    }
  }
`;

const MERGE_AGENT_CHANGES = gql`
  mutation MergeAgentChanges($sourceAgentId: ID!, $targetAgentId: ID!) {
    mergeAgentChanges(sourceAgentId: $sourceAgentId, targetAgentId: $targetAgentId) {
      id
      name
    }
  }
`;

const CollaboratorManagement = ({ agentId, agentName, isOwner }) => {
  // State
  const [openCollaboratorDialog, setOpenCollaboratorDialog] = useState(false);
  const [openVersionDialog, setOpenVersionDialog] = useState(false);
  const [openForkDialog, setOpenForkDialog] = useState(false);
  const [openMergeDialog, setOpenMergeDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EDITOR');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [forkName, setForkName] = useState('');
  const [sourceAgentId, setSourceAgentId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editingCollaborator, setEditingCollaborator] = useState(null);

  // Queries
  const { loading: loadingCollaborators, error: errorCollaborators, data: collaboratorsData, refetch: refetchCollaborators } = useQuery(GET_COLLABORATORS, {
    variables: { agentId },
    skip: !agentId
  });

  const { loading: loadingHistory, error: errorHistory, data: historyData, refetch: refetchHistory } = useQuery(GET_VERSION_HISTORY, {
    variables: { agentId },
    skip: !agentId || !openHistoryDialog
  });

  // Mutations
  const [addCollaborator, { loading: addingCollaborator }] = useMutation(ADD_COLLABORATOR, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Collaborator added successfully', severity: 'success' });
      refetchCollaborators();
      handleCloseCollaboratorDialog();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error adding collaborator: ${error.message}`, severity: 'error' });
    }
  });

  const [updateCollaboratorRole, { loading: updatingRole }] = useMutation(UPDATE_COLLABORATOR_ROLE, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Collaborator role updated successfully', severity: 'success' });
      refetchCollaborators();
      handleCloseCollaboratorDialog();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error updating role: ${error.message}`, severity: 'error' });
    }
  });

  const [removeCollaborator] = useMutation(REMOVE_COLLABORATOR, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Collaborator removed successfully', severity: 'success' });
      refetchCollaborators();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error removing collaborator: ${error.message}`, severity: 'error' });
    }
  });

  const [createVersion, { loading: creatingVersion }] = useMutation(CREATE_VERSION, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Version created successfully', severity: 'success' });
      refetchHistory();
      handleCloseVersionDialog();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error creating version: ${error.message}`, severity: 'error' });
    }
  });

  const [forkAgent, { loading: forkingAgent }] = useMutation(FORK_AGENT, {
    onCompleted: (data) => {
      setSnackbar({ open: true, message: `Agent forked successfully as ${data.forkAgent.name}`, severity: 'success' });
      handleCloseForkDialog();
      // Redirect to the new agent page
      window.location.href = `/agents/${data.forkAgent.id}`;
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error forking agent: ${error.message}`, severity: 'error' });
    }
  });

  const [mergeAgentChanges, { loading: mergingChanges }] = useMutation(MERGE_AGENT_CHANGES, {
    onCompleted: () => {
      setSnackbar({ open: true, message: 'Changes merged successfully', severity: 'success' });
      handleCloseMergeDialog();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: `Error merging changes: ${error.message}`, severity: 'error' });
    }
  });

  // Handlers
  const handleOpenCollaboratorDialog = (collaborator = null) => {
    if (collaborator) {
      setEditingCollaborator(collaborator);
      setEmail(collaborator.user.email);
      setRole(collaborator.role);
    } else {
      setEditingCollaborator(null);
      setEmail('');
      setRole('EDITOR');
    }
    setOpenCollaboratorDialog(true);
  };

  const handleCloseCollaboratorDialog = () => {
    setOpenCollaboratorDialog(false);
    setEditingCollaborator(null);
    setEmail('');
    setRole('EDITOR');
  };

  const handleOpenVersionDialog = () => {
    setOpenVersionDialog(true);
  };

  const handleCloseVersionDialog = () => {
    setOpenVersionDialog(false);
    setVersion('');
    setDescription('');
  };

  const handleOpenForkDialog = () => {
    setForkName(`${agentName} - Fork`);
    setOpenForkDialog(true);
  };

  const handleCloseForkDialog = () => {
    setOpenForkDialog(false);
    setForkName('');
  };

  const handleOpenMergeDialog = () => {
    setOpenMergeDialog(true);
  };

  const handleCloseMergeDialog = () => {
    setOpenMergeDialog(false);
    setSourceAgentId('');
  };

  const handleOpenHistoryDialog = () => {
    setOpenHistoryDialog(true);
    refetchHistory();
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmitCollaborator = () => {
    if (editingCollaborator) {
      updateCollaboratorRole({
        variables: {
          agentId,
          userId: editingCollaborator.user.id,
          role
        }
      });
    } else {
      addCollaborator({
        variables: {
          agentId,
          input: {
            userId: email, // In a real app, you'd need to search for the user ID by email first
            role
          }
        }
      });
    }
  };

  const handleRemoveCollaborator = (userId) => {
    if (window.confirm('Are you sure you want to remove this collaborator?')) {
      removeCollaborator({
        variables: {
          agentId,
          userId
        }
      });
    }
  };

  const handleCreateVersion = () => {
    createVersion({
      variables: {
        agentId,
        input: {
          version,
          description,
          changes: [] // In a real app, you'd track actual changes
        }
      }
    });
  };

  const handleForkAgent = () => {
    forkAgent({
      variables: {
        agentId,
        name: forkName
      }
    });
  };

  const handleMergeChanges = () => {
    mergeAgentChanges({
      variables: {
        sourceAgentId,
        targetAgentId: agentId
      }
    });
  };

  // Render
  if (loadingCollaborators) return <CircularProgress />;
  if (errorCollaborators) return <Alert severity="error">Error loading collaborators: {errorCollaborators.message}</Alert>;

  const collaborators = collaboratorsData?.agentCollaborators || [];

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
          <GitHubIcon sx={{ mr: 1 }} /> Collaboration & Version Control
        </Typography>
        <Box>
          {isOwner && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PersonAddIcon />}
              onClick={() => handleOpenCollaboratorDialog()}
              sx={{ mr: 1 }}
            >
              Add Collaborator
            </Button>
          )}
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<HistoryIcon />}
            onClick={handleOpenHistoryDialog}
            sx={{ mr: 1 }}
          >
            Version History
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<ForkRightIcon />}
            onClick={handleOpenForkDialog}
            sx={{ mr: 1 }}
          >
            Fork
          </Button>
          {isOwner && (
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<MergeIcon />}
              onClick={handleOpenMergeDialog}
            >
              Merge
            </Button>
          )}
        </Box>
      </Box>

      {/* Collaborators Table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Added On</TableCell>
              {isOwner && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {collaborators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 5 : 4} align="center">
                  No collaborators yet
                </TableCell>
              </TableRow>
            ) : (
              collaborators.map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>{collaborator.user.username}</TableCell>
                  <TableCell>{collaborator.user.email}</TableCell>
                  <TableCell>{collaborator.role}</TableCell>
                  <TableCell>{new Date(collaborator.addedAt).toLocaleDateString()}</TableCell>
                  {isOwner && (
                    <TableCell align="right">
                      <Tooltip title="Edit Role">
                        <IconButton onClick={() => handleOpenCollaboratorDialog(collaborator)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton onClick={() => handleRemoveCollaborator(collaborator.user.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Version Button */}
      {isOwner && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleOpenVersionDialog}
            startIcon={<HistoryIcon />}
          >
            Create New Version
          </Button>
        </Box>
      )}

      {/* Add/Edit Collaborator Dialog */}
      <Dialog open={openCollaboratorDialog} onClose={handleCloseCollaboratorDialog}>
        <DialogTitle>{editingCollaborator ? 'Edit Collaborator Role' : 'Add Collaborator'}</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '400px', mt: 2 }}>
            {!editingCollaborator && (
              <TextField
                label="Collaborator Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                disabled={addingCollaborator}
              />
            )}
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={updatingRole}
              >
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="EDITOR">Editor</MenuItem>
                <MenuItem value="VIEWER">Viewer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCollaboratorDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitCollaborator} 
            color="primary" 
            disabled={addingCollaborator || updatingRole || (!editingCollaborator && !email)}
          >
            {addingCollaborator || updatingRole ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Version Dialog */}
      <Dialog open={openVersionDialog} onClose={handleCloseVersionDialog}>
        <DialogTitle>Create New Version</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '400px', mt: 2 }}>
            <TextField
              label="Version Number"
              fullWidth
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              margin="normal"
              placeholder="e.g., 1.0.1"
              disabled={creatingVersion}
            />
            <TextField
              label="Description"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              placeholder="Describe what changed in this version"
              disabled={creatingVersion}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVersionDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateVersion} 
            color="primary" 
            disabled={creatingVersion || !version}
          >
            {creatingVersion ? <CircularProgress size={24} /> : 'Create Version'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fork Dialog */}
      <Dialog open={openForkDialog} onClose={handleCloseForkDialog}>
        <DialogTitle>Fork Agent</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '400px', mt: 2 }}>
            <TextField
              label="New Agent Name"
              fullWidth
              value={forkName}
              onChange={(e) => setForkName(e.target.value)}
              margin="normal"
              disabled={forkingAgent}
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Forking will create a copy of this agent that you can modify independently.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForkDialog}>Cancel</Button>
          <Button 
            onClick={handleForkAgent} 
            color="primary" 
            disabled={forkingAgent || !forkName}
          >
            {forkingAgent ? <CircularProgress size={24} /> : 'Fork Agent'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={openMergeDialog} onClose={handleCloseMergeDialog}>
        <DialogTitle>Merge Changes</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '400px', mt: 2 }}>
            <TextField
              label="Source Agent ID"
              fullWidth
              value={sourceAgentId}
              onChange={(e) => setSourceAgentId(e.target.value)}
              margin="normal"
              disabled={mergingChanges}
              placeholder="Enter the ID of the agent to merge from"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Merging will bring changes from the source agent into this agent.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMergeDialog}>Cancel</Button>
          <Button 
            onClick={handleMergeChanges} 
            color="primary" 
            disabled={mergingChanges || !sourceAgentId}
          >
            {mergingChanges ? <CircularProgress size={24} /> : 'Merge Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog} maxWidth="md" fullWidth>
        <DialogTitle>Version History</DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : errorHistory ? (
            <Alert severity="error">Error loading version history: {errorHistory.message}</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Version</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Changed By</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyData?.agentVersionHistory?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No version history available
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyData?.agentVersionHistory?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.version}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.changedBy.username}</TableCell>
                        <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CollaboratorManagement;
