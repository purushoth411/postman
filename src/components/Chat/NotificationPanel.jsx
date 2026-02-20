import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Users, MessageCircle, Hash } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';
import { getSocket } from '../../utils/Socket';
import { useAuth } from '../../utils/idb';
import toast from 'react-hot-toast';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = getSocket();

  useEffect(() => {
    if (!isOpen || !user) return;

    loadNotifications();
    loadUnreadCount();

    // Listen for new notifications
    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [isOpen, user]);

  const loadNotifications = async () => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.GET_NOTIFICATIONS), {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.GET_UNREAD_COUNT), {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.status) {
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNewNotification = (data) => {
    loadNotifications();
    loadUnreadCount();
    toast.success('New notification received');
  };

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.MARK_NOTIFICATION_READ), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_id: notificationId }),
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n)
        );
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ), {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'workspace_created':
      case 'member_added':
      case 'member_removed':
      case 'member_updated':
        return <Users className="w-5 h-5" />;
      case 'message_mention':
        return <MessageCircle className="w-5 h-5" />;
      case 'channel_created':
        return <Hash className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'workspace_created':
      case 'member_added':
        return 'text-green-600 bg-green-100';
      case 'member_removed':
        return 'text-red-600 bg-red-100';
      case 'message_mention':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="bg-red-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h2 className="font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs hover:bg-red-700 px-2 py-1 rounded transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="hover:bg-red-700 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  notification.is_read === 0 ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        {notification.workspace_name && (
                          <p className="text-xs text-gray-500">
                            Workspace: {notification.workspace_name}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {notification.is_read === 0 && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;


