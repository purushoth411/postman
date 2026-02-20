import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Users, X, Edit2, Trash2, Check, X as XIcon } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';
import { getSocket } from '../../utils/Socket';
import { useAuth } from '../../utils/idb';
import toast from 'react-hot-toast';
import { confirm } from '../../utils/alert';

const ChatPanel = ({ workspaceId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socket = getSocket();
  
  // Resizable panel state - initialize to half width
  const [panelWidth, setPanelWidth] = useState(() => {
    return Math.floor(window.innerWidth / 2);
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef(null);

  useEffect(() => {
    if (!workspaceId || !isOpen) return;

    // Join workspace room
    socket.emit('joinWorkspace', workspaceId);

    // Load messages and members
    loadMessages();
    loadMembers();

    // Socket listeners
    socket.on('messageSent', handleNewMessage);
    socket.on('messageUpdated', handleMessageUpdated);
    socket.on('messageDeleted', handleMessageDeleted);

    return () => {
      socket.off('messageSent', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.emit('leaveWorkspace', workspaceId);
    };
  }, [workspaceId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const loadMessages = async () => {
    try {
      const res = await fetch(
        `${getApiUrl(API_ENDPOINTS.GET_MESSAGES)}?workspace_id=${workspaceId}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.status) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const loadMembers = async () => {
    try {
      const res = await fetch(
        `${getApiUrl(API_ENDPOINTS.GET_MEMBERS)}?workspace_id=${workspaceId}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.status) {
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleNewMessage = (data) => {
    if (data.workspaceId === workspaceId) {
      setMessages(prev => [...prev, data.message]);
    }
  };

  const handleMessageUpdated = (data) => {
    if (data.workspaceId === workspaceId) {
      setMessages(prev => prev.map(msg => 
        msg.id === data.message.id ? data.message : msg
      ));
      setEditingMessageId(null);
      setEditText('');
    }
  };

  const handleMessageDeleted = (data) => {
    if (data.workspaceId === workspaceId) {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.SEND_MESSAGE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          workspace_id: workspaceId,
          message: newMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.status) {
        setNewMessage('');
        setShowMentionSuggestions(false);
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const startEdit = (message) => {
    if (message.user_id !== user?.id) return;
    setEditingMessageId(message.id);
    setEditText(message.message);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const saveEdit = async () => {
    if (!editText.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.UPDATE_MESSAGE), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message_id: editingMessageId,
          message: editText.trim(),
        }),
      });

      const data = await res.json();
      if (data.status) {
        setEditingMessageId(null);
        setEditText('');
        toast.success('Message updated');
      } else {
        toast.error(data.message || 'Failed to update message');
      }
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const deleteMessage = async (messageId) => {
      const confirmed = await confirm('Are you sure you want to delete this message?', 'Delete Message', 'warning');
        if (!confirmed) return;
    

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.DELETE_MESSAGE), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message_id: messageId,
        }),
      });

      const data = await res.json();
      if (data.status) {
        toast.success('Message deleted');
      } else {
        toast.error(data.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Check for @ mentions
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt.toLowerCase());
        setMentionStartIndex(lastAtIndex);
        setShowMentionSuggestions(true);
        return;
      }
    }
    setShowMentionSuggestions(false);
  };

  const insertMention = (member) => {
    const beforeMention = newMessage.substring(0, mentionStartIndex);
    const afterMention = newMessage.substring(mentionStartIndex + mentionQuery.length + 1);
    const newText = `${beforeMention}@${member.name} ${afterMention}`;
    setNewMessage(newText);
    setShowMentionSuggestions(false);
    setMentionQuery('');
    inputRef.current?.focus();
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(mentionQuery) ||
    member.email.toLowerCase().includes(mentionQuery)
  );

  const formatMessage = (text) => {
    // Highlight mentions
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before mention
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      // Add mention
      const mentionedMember = members.find(m => 
        m.name.toLowerCase() === match[1].toLowerCase() ||
        m.email.toLowerCase() === match[1].toLowerCase()
      );
      parts.push({
        type: 'mention',
        content: match[0],
        username: match[1],
        userId: mentionedMember?.id,
      });
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
      style={{ width: `${panelWidth}px` }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-red-500 transition-colors z-10"
        style={{ cursor: 'col-resize' }}
      />

      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h2 className="font-semibold">Workspace Chat</h2>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-red-700 rounded p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Members Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 bg-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Users className="w-4 h-4" />
              <span>Members</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {members.map(member => (
              <div
                key={member.id}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium">
                    {member.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{member.name}</div>
                    <div className="text-xs text-gray-500 truncate">{member.email}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => {
              const messageParts = formatMessage(message.message);
              const isOwnMessage = message.user_id === user?.id;
              const isEditing = editingMessageId === message.id;

              return (
                <div key={message.id} className="flex gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {message.user_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.user_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                      {message.updated_at !== message.created_at && (
                        <span className="text-xs text-gray-400 italic">(edited)</span>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                          >
                            <XIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        {messageParts.map((part, idx) => {
                          if (part.type === 'mention') {
                            return (
                              <span
                                key={idx}
                                className="bg-red-100 text-red-700 px-1 rounded font-medium"
                              >
                                {part.content}
                              </span>
                            );
                          }
                          return <span key={idx}>{part.content}</span>;
                        })}
                      </div>
                    )}
                  </div>
                  {isOwnMessage && !isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => startEdit(message)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Edit message"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <form onSubmit={sendMessage} className="relative">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder="Type a message... @mention to tag someone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition-colors"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Mention Suggestions */}
              {showMentionSuggestions && filteredMembers.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                  {filteredMembers.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => insertMention(member)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-medium">
                        {member.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Type @username to mention someone
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
