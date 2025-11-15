import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/helpers';
import socketService from '../services/socket';
import '../assets/css/messaging.css';

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize socket connection and load data - ONLY RUN ONCE
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // Small delay to ensure localStorage is available
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (!mounted) return;

      // Check authentication using helper
      if (!isAuthenticated()) {
        console.log('❌ Not authenticated, redirecting to login...');
        navigate('/login');
        return;
      }

      const user = getCurrentUser();
      if (!mounted) return;
      setCurrentUser(user);

      // Get token for socket connection
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Initialize socket
      await socketService.connect(token);
      if (!mounted) return;

      const status = socketService.getStatus();
      setConnectionStatus(status);

      // Listen for new messages
      const handleNewMessage = (data) => {
        if (data.message && mounted) {
          // Add to messages if from selected user
          const msgSenderId = data.message.sender?._id || data.message.sender;
          const currentSelectedId = selectedUser?._id;
          
          if (currentSelectedId && 
              (msgSenderId === currentSelectedId || 
               data.message.recipient === user._id)) {
            setMessages(prev => [...prev, data.message]);
          }
          
          // Update conversations list
          loadConversations();
        }
      };

      socketService.on('newMessage', handleNewMessage);

      // Load conversations
      await loadConversations();

      // Check if a user was passed via navigation state (from profile view)
      if (location.state?.selectedUser && mounted) {
        const userToSelect = location.state.selectedUser;
        setSelectedUser(userToSelect);
        loadMessages(userToSelect._id || userToSelect.id);
      }
    };

    checkAuth();

    return () => {
      mounted = false;
      socketService.off('newMessage');
    };
  }, [navigate]); // Only depend on navigate - run once on mount

  // Load conversations with debounce protection
  const loadConversations = async () => {
    // Prevent multiple simultaneous calls
    if (loadConversations.isLoading) {
      console.log('⚠️ Already loading conversations, skipping...');
      return;
    }

    loadConversations.isLoading = true;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No auth token, skipping conversation load');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('📋 Loaded conversations:', result.data.conversations);
        setConversations(result.data.conversations || []);
      }
    } catch (error) {
      console.error('❌ Load conversations error:', error.message);
      // Don't show error to user for background refreshes
    } finally {
      setLoading(false);
      // Allow next call after 1 second
      setTimeout(() => {
        loadConversations.isLoading = false;
      }, 1000);
    }
  };

  // Load messages for selected user with protection
  const loadMessages = async (userId) => {
    if (!userId) {
      console.warn('No userId provided to loadMessages');
      return;
    }

    // Prevent duplicate calls
    if (loadMessages.currentUserId === userId && loadMessages.isLoading) {
      console.log('⚠️ Already loading messages for this user, skipping...');
      return;
    }

    loadMessages.currentUserId = userId;
    loadMessages.isLoading = true;

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('📨 Loaded messages for user:', result.data.otherUser);
        setMessages(result.data.messages || []);
        setSelectedUser(result.data.otherUser);
      }
    } catch (error) {
      console.error('❌ Load messages error:', error.message);
    } finally {
      // Allow next call after 500ms
      setTimeout(() => {
        loadMessages.isLoading = false;
      }, 500);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    
    try {
      const result = await socketService.sendMessage(
        selectedUser._id,
        newMessage.trim()
      );

      if (result.success) {
        // Add message to list immediately
        setMessages(prev => [...prev, result.data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Select conversation
  const handleSelectConversation = (conversation) => {
    loadMessages(conversation.otherUser._id);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="messaging-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messaging-page">
      {/* Header */}
      <div className="messaging-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>Messages</h1>
        {connectionStatus && (
          <div className={`connection-status ${connectionStatus.connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {connectionStatus.mode}
          </div>
        )}
      </div>

      <div className="messaging-container">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>Conversations</h2>
          </div>
          
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="empty-state">
                <p>No conversations yet</p>
                <small>Start chatting with alumni or students!</small>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item ${selectedUser?._id === conv.otherUser._id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="conv-avatar">
                    {conv.otherUser.profilePicture?.url ? (
                      <img src={conv.otherUser.profilePicture.url} alt="" />
                    ) : (
                      <div className="avatar-placeholder">
                        {conv.otherUser.firstName?.[0]}{conv.otherUser.lastName?.[0]}
                      </div>
                    )}
                    {conv.otherUser.isOnline && <span className="online-indicator"></span>}
                  </div>
                  
                  <div className="conv-info">
                    <div className="conv-header">
                      <h3>
                        {conv.otherUser?.firstName && conv.otherUser?.lastName 
                          ? `${conv.otherUser.firstName} ${conv.otherUser.lastName}`
                          : conv.otherUser?.fullName || conv.otherUser?.email || 'Unknown User'}
                      </h3>
                      <span className="conv-time">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    {/* Show email for additional context */}
                    {conv.otherUser?.email && (
                      <p className="text-xs text-gray-500 mb-1">{conv.otherUser.email}</p>
                    )}
                    <div className="conv-preview">
                      <p className={!conv.lastMessage.isRead ? 'unread' : ''}>
                        {conv.lastMessage.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedUser.profilePicture?.url ? (
                      <img src={selectedUser.profilePicture.url} alt="" />
                    ) : (
                      <div className="avatar-placeholder">
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </div>
                    )}
                    {selectedUser.isOnline && <span className="online-indicator"></span>}
                  </div>
                  <div>
                    <h3>
                      {selectedUser?.firstName && selectedUser?.lastName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser?.fullName || selectedUser?.email || 'Unknown User'}
                    </h3>
                    <small className="text-gray-600">
                      {selectedUser?.email && `${selectedUser.email} • `}
                      {selectedUser.isOnline ? 'Online' : 'Offline'}
                    </small>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="messages-area">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <p>No messages yet</p>
                    <small>Send a message to start the conversation</small>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${msg.sender === currentUser?._id || msg.sender?._id === currentUser?._id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{msg.content}</p>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form className="message-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  autoFocus
                />
                <button type="submit" disabled={!newMessage.trim() || sending}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
