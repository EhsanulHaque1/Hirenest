import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  FaSearch,
  FaPaperPlane,
  FaArrowLeft,
  FaEllipsisV,
  FaTrash,
} from "react-icons/fa";
import "./Chat.css";
import ProfilePopup from "../Components/ProfilePopup";

const SOCKET_URL = "http://localhost:5004";

function Chat() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchRole, setSearchRole] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profilePopupUserId, setProfilePopupUserId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Check for chat_with parameter and auto-open conversation
  useEffect(() => {
    const chatWithData = localStorage.getItem("chat_with");
    if (chatWithData && currentUser) {
      try {
        const userToChat = JSON.parse(chatWithData);
        handleSelectUser(userToChat);
        localStorage.removeItem("chat_with"); // Clear after use
      } catch (error) {
        console.error("Error parsing chat_with data:", error);
      }
    }
  }, [currentUser]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("hirenest_user");

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);

      // Connect to socket
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to socket");
      });

      socketRef.current.on("new_message", (message) => {
        // Only add message if it's from the other user (not from us sending)
        // We check if the sender ID matches the selected user's ID
        if (selectedUser && message.senderId._id === selectedUser._id) {
          // Check if message already exists to avoid duplicates
          setMessages((prev) => {
            const exists = prev.some((m) => m._id === message._id);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
          scrollToBottom();
          // Mark as read
          socketRef.current.emit("mark_read", {
            otherUserId: selectedUser._id,
          });
        }
      });

      socketRef.current.on("user_typing", ({ userId, isTyping }) => {
        if (selectedUser && userId === selectedUser._id) {
          setOtherUserTyping(isTyping);
        }
      });

      socketRef.current.on("message_notification", ({ message }) => {
        // Refresh conversations to update unread count
        fetchConversations();
      });

      socketRef.current.on("messages_read", () => {
        fetchConversations();
      });

      socketRef.current.on("message_deleted", ({ messageId }) => {
        // Remove deleted message from UI
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        fetchConversations();
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disconnected from socket");
      });

      socketRef.current.on("error", (error) => {
        console.error("Socket error:", error);
      });

      // Fetch initial conversations
      fetchConversations();

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [selectedUser]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${SOCKET_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Fetch messages with selected user
  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${SOCKET_URL}/api/chat/messages/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Search users
  const searchUsers = async () => {
    if (!searchQuery && !searchRole) return;

    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (searchQuery) params.append("query", searchQuery);
      if (searchRole) params.append("role", searchRole);

      const response = await fetch(
        `${SOCKET_URL}/api/chat/users/search?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  useEffect(() => {
    if (searchQuery || searchRole) {
      searchUsers();
    }
  }, [searchQuery, searchRole]);

  // Handle selecting a user to chat with
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchRole("");
    setOtherUserTyping(false);

    // Join socket room
    socketRef.current.emit("join_chat", user._id);

    // Fetch messages
    fetchMessages(user._id);
  };

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${SOCKET_URL}/api/chat/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const message = await response.json();
        // Add message to UI (it was already saved to DB via API)
        setMessages((prev) => {
          // Check for duplicates
          const exists = prev.some((m) => m._id === message._id);
          if (!exists) {
            return [...prev, message];
          }
          return prev;
        });
        setNewMessage("");
        scrollToBottom();
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && selectedUser) {
      setIsTyping(true);
      socketRef.current.emit("typing", {
        receiverId: selectedUser._id,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (selectedUser) {
        socketRef.current.emit("typing", {
          receiverId: selectedUser._id,
          isTyping: false,
        });
      }
    }, 2000);
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${SOCKET_URL}/api/chat/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        // Remove message from UI
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

        // Emit socket event to notify other user
        socketRef.current.emit("message_deleted", {
          messageId,
          receiverId: selectedUser._id,
        });

        // Refresh conversations to update last message
        fetchConversations();
      } else {
        alert("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Error deleting message");
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this entire conversation? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${SOCKET_URL}/api/chat/conversations/${selectedUser._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        // Clear messages and close chat
        setMessages([]);
        setSelectedUser(null);
        setShowMenu(false);

        // Refresh conversations list
        fetchConversations();

        alert("Conversation deleted successfully");
      } else {
        alert("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("Error deleting conversation");
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get user initials
  const getInitials = (user) => {
    if (!user) return "??";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    return role === "jobProvider" ? "badge-provider" : "badge-seeker";
  };

  // Handle opening profile popup
  const handleOpenProfilePopup = (userId) => {
    setProfilePopupUserId(userId);
    setShowProfilePopup(true);
  };

  // Handle closing profile popup
  const handleCloseProfilePopup = () => {
    setShowProfilePopup(false);
    setProfilePopupUserId(null);
  };

  if (!currentUser) {
    return (
      <div className="chat-page-wrapper">
        <div className="chat-auth-required">
          <h2>Please log in to access chat</h2>
          <p>You need to be logged in to chat with others on HireNest.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page-wrapper">
      <div className="chat-container">
        {/* Conversations List */}
        <div
          className={`chat-sidebar ${selectedUser ? "chat-sidebar-hidden" : ""}`}
        >
          <div className="chat-sidebar-header">
            <h2>Messages</h2>
            <button
              className="new-chat-btn"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? "Cancel" : "New Chat"}
            </button>
          </div>

          {showSearch && (
            <div className="chat-search-section">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="chat-search-input"
                />
              </div>
              <div className="search-filters">
                <select
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                  className="role-filter"
                >
                  <option value="">All Roles</option>
                  <option value="jobSeeker">Job Seekers</option>
                  <option value="jobProvider">Job Providers</option>
                </select>
              </div>
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="search-result-item"
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="user-avatar">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.username} />
                        ) : (
                          <span>{getInitials(user)}</span>
                        )}
                      </div>
                      <div className="user-details">
                        <span
                          className="user-name"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenProfilePopup(user._id);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {user.firstName} {user.lastName}
                        </span>
                        <span
                          className={`role-badge ${getRoleBadgeClass(user.role)}`}
                        >
                          {user.role === "jobProvider" ? "Provider" : "Seeker"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
                <span>
                  Start a new chat to connect with job seekers or providers
                </span>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item ${
                    selectedUser?._id === conv.otherUser?._id ? "active" : ""
                  }`}
                  onClick={() =>
                    conv.otherUser && handleSelectUser(conv.otherUser)
                  }
                >
                  <div className="conversation-avatar">
                    {conv.otherUser?.profilePicture ? (
                      <img src={conv.otherUser.profilePicture} alt="avatar" />
                    ) : (
                      <span>{getInitials(conv.otherUser)}</span>
                    )}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span
                        className="conversation-name"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProfilePopup(conv.otherUser?._id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        {conv.otherUser?.firstName} {conv.otherUser?.lastName}
                      </span>
                      <span className="conversation-time">
                        {conv.lastMessageAt && formatDate(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <span
                        className={`role-badge-small ${getRoleBadgeClass(conv.otherUser?.role)}`}
                      >
                        {conv.otherUser?.role === "jobProvider"
                          ? "Provider"
                          : "Seeker"}
                      </span>
                      <p className="last-message">
                        {conv.lastMessage?.content
                          ? conv.lastMessage.content.substring(0, 40) + "..."
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`chat-area ${!selectedUser ? "chat-area-hidden" : ""}`}>
          {selectedUser ? (
            <>
              <div className="chat-header">
                <button
                  className="back-btn"
                  onClick={() => setSelectedUser(null)}
                >
                  <FaArrowLeft />
                </button>
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedUser.profilePicture ? (
                      <img src={selectedUser.profilePicture} alt="avatar" />
                    ) : (
                      <span>{getInitials(selectedUser)}</span>
                    )}
                  </div>
                  <div className="chat-user-details">
                    <span
                      className="chat-user-name"
                      onClick={() => handleOpenProfilePopup(selectedUser._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {selectedUser.firstName} {selectedUser.lastName}
                    </span>
                    <span
                      className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}
                    >
                      {selectedUser.role === "jobProvider"
                        ? "Job Provider"
                        : "Job Seeker"}
                    </span>
                  </div>
                </div>
                <div className="menu-container">
                  <button
                    className="menu-btn"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <FaEllipsisV />
                  </button>
                  {showMenu && (
                    <div className="menu-dropdown">
                      <button
                        className="menu-item delete-conversation"
                        onClick={handleDeleteConversation}
                      >
                        <FaTrash /> Delete Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="messages-container">
                <div className="messages-list">
                  {messages.map((message, index) => {
                    const isOwnMessage =
                      message.senderId._id ===
                      (currentUser.id || currentUser._id);
                    const showDate =
                      index === 0 ||
                      formatDate(message.createdAt) !==
                        formatDate(messages[index - 1].createdAt);

                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="date-separator">
                            <span>{formatDate(message.createdAt)}</span>
                          </div>
                        )}
                        <div
                          className={`message ${isOwnMessage ? "message-sent" : "message-received"}`}
                        >
                          <div className="message-bubble">
                            <p>{message.content}</p>
                            <div className="message-footer">
                              <span className="message-time">
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwnMessage && (
                                <button
                                  className="delete-message-btn"
                                  onClick={() =>
                                    handleDeleteMessage(message._id)
                                  }
                                  title="Delete message"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {otherUserTyping && (
                    <div className="typing-indicator">
                      <span>{selectedUser.firstName} is typing...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form
                className="message-input-container"
                onSubmit={handleSendMessage}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  className="message-input"
                />
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim()}
                >
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one</p>
              <button
                className="start-chat-btn"
                onClick={() => setShowSearch(true)}
              >
                Start New Chat
              </button>
            </div>
          )}
        </div>
      </div>
      {showProfilePopup && profilePopupUserId && (
        <ProfilePopup
          userId={profilePopupUserId}
          onClose={handleCloseProfilePopup}
        />
      )}
    </div>
  );
}

export default Chat;
