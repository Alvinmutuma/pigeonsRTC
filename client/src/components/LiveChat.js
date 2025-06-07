import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useSubscription, gql } from '@apollo/client';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import VideocamIcon from '@mui/icons-material/Videocam';
import StarIcon from '@mui/icons-material/Star';
import ScheduleIcon from '@mui/icons-material/Schedule';

// GraphQL Queries and Mutations
const GET_CONVERSATIONS = gql`
  query GetConversations {
    myConversations {
      id
      participants {
        id
        username
        avatar
        role
      }
      lastMessage {
        id
        content
        createdAt
        sender {
          id
          username
        }
      }
      unreadCount
      updatedAt
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      content
      attachments {
        id
        url
        type
        name
      }
      sender {
        id
        username
        avatar
        role
      }
      createdAt
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $content: String!, $attachments: [AttachmentInput]) {
    sendMessage(conversationId: $conversationId, content: $content, attachments: $attachments) {
      id
      content
      createdAt
    }
  }
`;

const CREATE_CONVERSATION = gql`
  mutation CreateConversation($participantIds: [ID!]!) {
    createConversation(participantIds: $participantIds) {
      id
      participants {
        id
        username
        avatar
      }
    }
  }
`;

const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage($conversationId: ID!) {
    newMessage(conversationId: $conversationId) {
      id
      content
      attachments {
        id
        url
        type
        name
      }
      sender {
        id
        username
        avatar
        role
      }
      createdAt
    }
  }
`;

const GET_UPCOMING_AMAS = gql`
  query GetUpcomingAMAs {
    upcomingAMAs {
      id
      title
      description
      developer {
        id
        username
        avatar
        bio
      }
      startTime
      endTime
      maxParticipants
      currentParticipants
      status
    }
  }
`;

const REGISTER_FOR_AMA = gql`
  mutation RegisterForAMA($amaId: ID!) {
    registerForAMA(amaId: $amaId) {
      id
      currentParticipants
    }
  }
`;

const GET_TOP_DEVELOPERS = gql`
  query GetTopDevelopers {
    topDevelopers {
      id
      username
      avatar
      bio
      agentCount
      averageRating
      isAvailableForChat
    }
  }
`;

// LiveChat component
const LiveChat = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [openNewChatDialog, setOpenNewChatDialog] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const messagesEndRef = useRef(null);

  // Queries
  const { loading: loadingConversations, error: errorConversations, data: conversationsData, refetch: refetchConversations } = useQuery(GET_CONVERSATIONS);
  
  const { loading: loadingMessages, error: errorMessages, data: messagesData } = useQuery(GET_MESSAGES, {
    variables: { conversationId: selectedConversation },
    skip: !selectedConversation
  });
  
  const { loading: loadingAMAs, error: errorAMAs, data: amasData } = useQuery(GET_UPCOMING_AMAS);
  
  const { loading: loadingDevelopers, error: errorDevelopers, data: developersData } = useQuery(GET_TOP_DEVELOPERS);

  // Mutations
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      setMessageInput('');
      setAttachments([]);
      refetchConversations();
    }
  });
  
  const [createConversation, { loading: creatingConversation }] = useMutation(CREATE_CONVERSATION, {
    onCompleted: (data) => {
      setSelectedConversation(data.createConversation.id);
      setOpenNewChatDialog(false);
      refetchConversations();
    }
  });
  
  const [registerForAMA, { loading: registering }] = useMutation(REGISTER_FOR_AMA, {
    onCompleted: () => {
      // Show success message or update UI
    }
  });

  // Subscription
  const { data: newMessageData } = useSubscription(
    NEW_MESSAGE_SUBSCRIPTION,
    { variables: { conversationId: selectedConversation }, skip: !selectedConversation }
  );

  // Effects
  useEffect(() => {
    if (newMessageData) {
      refetchConversations();
    }
  }, [newMessageData, refetchConversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversation(conversationId);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    
    sendMessage({
      variables: {
        conversationId: selectedConversation,
        content: messageInput,
        attachments: attachments.map(att => ({ url: att.url, type: att.type, name: att.name }))
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e) => {
    // In a real app, you'd upload the file to a server and get a URL back
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.type.split('/')[0],
      url: URL.createObjectURL(file)
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleOpenNewChat = () => {
    setOpenNewChatDialog(true);
  };

  const handleCloseNewChat = () => {
    setOpenNewChatDialog(false);
    setSelectedDeveloper('');
  };

  const handleCreateConversation = () => {
    if (!selectedDeveloper) return;
    
    createConversation({
      variables: {
        participantIds: [selectedDeveloper]
      }
    });
  };

  const handleRegisterForAMA = (amaId) => {
    registerForAMA({
      variables: { amaId }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Format time remaining
  const formatTimeRemaining = (dateString) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diff = eventDate - now;
    
    if (diff < 0) return 'Started';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`;
  };

  // Render conversations list
  const renderConversations = () => {
    if (loadingConversations) return <CircularProgress />;
    if (errorConversations) return <Alert severity="error">Error loading conversations</Alert>;
    
    const conversations = conversationsData?.myConversations || [];
    
    if (conversations.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No conversations yet
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleOpenNewChat}
            sx={{ mt: 2 }}
          >
            Start a new chat
          </Button>
        </Box>
      );
    }
    
    return (
      <>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Your Conversations</Typography>
          <Button 
            variant="contained" 
            size="small"
            onClick={handleOpenNewChat}
          >
            New Chat
          </Button>
        </Box>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {conversations.map((conversation) => (
            <React.Fragment key={conversation.id}>
              <ListItem 
                alignItems="flex-start" 
                button
                selected={selectedConversation === conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <ListItemAvatar>
                  <Badge 
                    color="primary" 
                    badgeContent={conversation.unreadCount} 
                    invisible={conversation.unreadCount === 0}
                  >
                    <Avatar 
                      alt={conversation.participants[0].username} 
                      src={conversation.participants[0].avatar} 
                    />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={conversation.participants[0].username}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'inline' }}
                      >
                        {conversation.lastMessage?.content.substring(0, 30)}
                        {conversation.lastMessage?.content.length > 30 ? '...' : ''}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        {conversation.lastMessage ? formatDate(conversation.lastMessage.createdAt) : 'No messages yet'}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </>
    );
  };

  // Render messages
  const renderMessages = () => {
    if (!selectedConversation) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          p: 3
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Select a conversation to start chatting
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleOpenNewChat}
          >
            Start a new chat
          </Button>
        </Box>
      );
    }
    
    if (loadingMessages) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (errorMessages) {
      return <Alert severity="error">Error loading messages</Alert>;
    }
    
    const messages = messagesData?.messages || [];
    
    if (messages.length === 0) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '100%',
          p: 3
        }}>
          <Typography variant="body1" color="text.secondary">
            No messages yet. Start the conversation!
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
        {messages.map((message) => (
          <Box 
            key={message.id}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender.id === 'currentUser' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              {message.sender.id !== 'currentUser' && (
                <Avatar 
                  alt={message.sender.username} 
                  src={message.sender.avatar}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              <Paper 
                sx={{ 
                  p: 2, 
                  maxWidth: '70%',
                  bgcolor: message.sender.id === 'currentUser' ? 'primary.light' : 'background.paper',
                  color: message.sender.id === 'currentUser' ? 'white' : 'inherit',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
                
                {message.attachments && message.attachments.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {message.attachments.map((attachment) => (
                      <Box 
                        key={attachment.id}
                        component="a"
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mt: 1,
                          textDecoration: 'none',
                          color: 'inherit'
                        }}
                      >
                        <AttachFileIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">{attachment.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                mt: 0.5,
                ml: message.sender.id !== 'currentUser' ? 7 : 0,
                mr: message.sender.id === 'currentUser' ? 1 : 0
              }}
            >
              {formatDate(message.createdAt)}
            </Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
    );
  };

  // Render upcoming AMAs
  const renderUpcomingAMAs = () => {
    if (loadingAMAs) return <CircularProgress />;
    if (errorAMAs) return <Alert severity="error">Error loading AMAs</Alert>;
    
    const amas = amasData?.upcomingAMAs || [];
    
    if (amas.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No upcoming AMAs scheduled
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Upcoming "Ask Me Anything" Sessions</Typography>
        <Grid container spacing={2}>
          {amas.map((ama) => (
            <Grid item xs={12} md={6} key={ama.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar src={ama.developer.avatar} alt={ama.developer.username} sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1">{ama.developer.username}</Typography>
                    <Chip 
                      size="small" 
                      icon={<ScheduleIcon />} 
                      label={formatTimeRemaining(ama.startTime)} 
                      color={new Date(ama.startTime) < new Date() ? 'success' : 'primary'} 
                    />
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom>{ama.title}</Typography>
                <Typography variant="body2" paragraph>{ama.description}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" display="block">
                      {new Date(ama.startTime).toLocaleString()} - {new Date(ama.endTime).toLocaleTimeString()}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {ama.currentParticipants}/{ama.maxParticipants} participants
                    </Typography>
                  </Box>
                  <Box>
                    <Button 
                      variant="contained" 
                      startIcon={<VideocamIcon />} 
                      disabled={ama.currentParticipants >= ama.maxParticipants || registering}
                      onClick={() => handleRegisterForAMA(ama.id)}
                    >
                      Join
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // Render top developers
  const renderTopDevelopers = () => {
    if (loadingDevelopers) return <CircularProgress />;
    if (errorDevelopers) return <Alert severity="error">Error loading developers</Alert>;
    
    const developers = developersData?.topDevelopers || [];
    
    if (developers.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No developers available
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Top Developers</Typography>
        <Grid container spacing={2}>
          {developers.map((developer) => (
            <Grid item xs={12} sm={6} md={4} key={developer.id}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar src={developer.avatar} alt={developer.username} sx={{ width: 56, height: 56, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{developer.username}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: 'gold', mr: 0.5 }} fontSize="small" />
                      <Typography variant="body2">{developer.averageRating.toFixed(1)}</Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" paragraph>
                  {developer.bio?.substring(0, 100)}
                  {developer.bio?.length > 100 ? '...' : ''}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={`${developer.agentCount} Agents`} 
                    size="small" 
                    variant="outlined" 
                  />
                  <Button 
                    variant="contained" 
                    size="small"
                    disabled={!developer.isAvailableForChat}
                    onClick={() => {
                      setSelectedDeveloper(developer.id);
                      handleCreateConversation();
                    }}
                  >
                    {developer.isAvailableForChat ? 'Chat Now' : 'Unavailable'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Live Chat & Ask Me Anything
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Direct Messages" />
        <Tab label="Upcoming AMAs" />
        <Tab label="Top Developers" />
      </Tabs>
      
      {activeTab === 0 && (
        <Paper sx={{ height: 600, display: 'flex' }}>
          {/* Conversations List */}
          <Box sx={{ width: 320, borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
            {renderConversations()}
          </Box>
          
          {/* Messages Area */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Messages */}
            {renderMessages()}
            
            {/* Message Input */}
            {selectedConversation && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                {attachments.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {attachments.map((att) => (
                      <Chip
                        key={att.id}
                        label={att.name}
                        onDelete={() => handleRemoveAttachment(att.id)}
                        deleteIcon={<CloseIcon />}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    variant="outlined"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                    multiline
                    maxRows={4}
                    sx={{ mr: 1 }}
                  />
                  <input
                    type="file"
                    id="file-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    multiple
                  />
                  <label htmlFor="file-upload">
                    <IconButton component="span" color="primary">
                      <AttachFileIcon />
                    </IconButton>
                  </label>
                  <IconButton 
                    color="primary" 
                    onClick={handleSendMessage}
                    disabled={sendingMessage || (!messageInput.trim() && attachments.length === 0)}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 2 }}>
          {renderUpcomingAMAs()}
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 2 }}>
          {renderTopDevelopers()}
        </Paper>
      )}
      
      {/* New Chat Dialog */}
      <Dialog open={openNewChatDialog} onClose={handleCloseNewChat}>
        <DialogTitle>Start a New Conversation</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="developer-select-label">Select Developer</InputLabel>
            <Select
              labelId="developer-select-label"
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              label="Select Developer"
            >
              {(developersData?.topDevelopers || []).map((dev) => (
                <MenuItem key={dev.id} value={dev.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={dev.avatar} alt={dev.username} sx={{ mr: 1, width: 24, height: 24 }} />
                    <Typography>{dev.username}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewChat}>Cancel</Button>
          <Button 
            onClick={handleCreateConversation} 
            color="primary"
            disabled={!selectedDeveloper || creatingConversation}
          >
            Start Chat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveChat;
