import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Users, MessageCircle, Hash, CheckCheck, Inbox } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../../config/api';
import { getSocket } from '../../utils/Socket';
import { useAuth } from '../../utils/idb';
import toast from 'react-hot-toast';

/* ─── Skeleton Loader ─────────────────────────────────────────────────────── */
const SkeletonItem = () => (
  <div className="p-4 flex items-start gap-3 border-b border-red-50 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-red-100 flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-3.5 bg-red-100 rounded-full w-2/3" />
      <div className="h-3 bg-red-50 rounded-full w-full" />
      <div className="h-3 bg-red-50 rounded-full w-4/5" />
      <div className="h-2.5 bg-red-50 rounded-full w-1/3 mt-1" />
    </div>
  </div>
);

const NotificationSkeleton = () => (
  <div className="flex-1 overflow-y-auto divide-y divide-red-50">
    {[1, 2, 3, 4, 5].map(i => <SkeletonItem key={i} />)}
  </div>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const getNotificationConfig = (type) => {
  switch (type) {
    case 'workspace_created':
      return { icon: <Users className="w-4 h-4" />, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-50' };
    case 'member_added':
      return { icon: <Users className="w-4 h-4" />, iconClass: 'text-green-600', bgClass: 'bg-green-50' };
    case 'member_removed':
      return { icon: <Users className="w-4 h-4" />, iconClass: 'text-rose-600', bgClass: 'bg-rose-50' };
    case 'member_updated':
      return { icon: <Users className="w-4 h-4" />, iconClass: 'text-amber-600', bgClass: 'bg-amber-50' };
    case 'message_mention':
      return { icon: <MessageCircle className="w-4 h-4" />, iconClass: 'text-blue-600', bgClass: 'bg-blue-50' };
    case 'channel_created':
      return { icon: <Hash className="w-4 h-4" />, iconClass: 'text-purple-600', bgClass: 'bg-purple-50' };
    default:
      return { icon: <Bell className="w-4 h-4" />, iconClass: 'text-red-600', bgClass: 'bg-red-50' };
  }
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ─── Section Label ───────────────────────────────────────────────────────── */
const SectionLabel = ({ label, red }) => (
  <div className={`px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-b
    ${red ? 'text-red-500 bg-red-50 border-red-100' : 'text-gray-400 bg-gray-50 border-gray-100'}`}>
    {label}
  </div>
);

/* ─── Notification Item ───────────────────────────────────────────────────── */
const NotifItem = ({ n, markAsRead }) => {
  const config = getNotificationConfig(n.type);
  const isUnread = n.is_read === 0;

  return (
    <div className={`relative flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 transition-colors
      ${isUnread ? 'bg-red-50 hover:bg-red-100/70' : 'bg-white hover:bg-gray-50'}`}
    >
      {/* Unread left border accent */}
      {isUnread && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600 rounded-r" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 ml-2 w-9 h-9 rounded-xl flex items-center justify-center
        ${isUnread ? `${config.bgClass} ${config.iconClass}` : 'bg-gray-100 text-gray-400'}`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-snug mb-0.5
              ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
              {n.title}
            </p>
            <p className="text-[13px] text-gray-500 leading-snug line-clamp-2">
              {n.message}
            </p>
            {n.workspace_name && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-red-600 bg-white border border-red-200 rounded-md px-2 py-0.5">
                # {n.workspace_name}
              </span>
            )}
            <p className="text-[11px] text-gray-400 mt-1.5">{timeAgo(n.created_at)}</p>
          </div>

          {/* Mark as read */}
          {isUnread && (
            <button
              onClick={() => markAsRead(n.id)}
              title="Mark as read"
              className="flex-shrink-0 w-7 h-7 rounded-lg border border-red-200 bg-white flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Panel ──────────────────────────────────────────────────────────── */
const NotificationPanel = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (!isOpen || !user) return;
    loadAll();
    socket.on('notification', handleNewNotification);
    return () => socket.off('notification', handleNewNotification);
  }, [isOpen, user]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadNotifications(), loadUnreadCount()]);
    setLoading(false);
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.GET_NOTIFICATIONS), { credentials: 'include' });
      const data = await res.json();
      if (data.status) setNotifications(data.notifications || []);
    } catch (e) { console.error(e); }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.GET_UNREAD_COUNT), { credentials: 'include' });
      const data = await res.json();
      if (data.status) setUnreadCount(data.count || 0);
    } catch (e) { console.error(e); }
  };

  const handleNewNotification = () => {
    loadAll();
    toast.success('New notification', { icon: '🔔' });
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.MARK_NOTIFICATION_READ), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_id: id }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        loadUnreadCount();
      }
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ), {
        method: 'POST', credentials: 'include',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  const unread = notifications.filter(n => n.is_read === 0);
  const read = notifications.filter(n => n.is_read !== 0);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 z-50 flex flex-col bg-white shadow-2xl border-l border-red-100">

        {/* ── Header ── */}
        <div className="bg-gradient-to-br from-red-600 via-red-600 to-red-800 px-5 pt-5 pb-4 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 left-16 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-tight">Notifications</h2>
                <p className="text-red-200 text-xs mt-0.5">
                  {loading ? 'Loading…' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 border border-white/25 hover:bg-white/25 rounded-lg px-2.5 py-1.5 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  All read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white bg-white/15 border border-white/20 hover:bg-white/25 rounded-lg p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Unread badge row */}
          {unreadCount > 0 && !loading && (
            <div className="relative flex items-center gap-3 mt-3.5">
              <span className="bg-white text-red-600 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                {unreadCount} NEW
              </span>
              <div className="flex-1 h-px bg-white/20" />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        {loading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="bg-red-50 rounded-full p-5">
              <Inbox className="w-10 h-10 text-red-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">We'll let you know when something arrives</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {unread.length > 0 && (
              <>
                <SectionLabel label="Unread" red />
                {unread.map(n => <NotifItem key={n.id} n={n} markAsRead={markAsRead} />)}
              </>
            )}
            {read.length > 0 && (
              <>
                <SectionLabel label="Earlier" />
                {read.map(n => <NotifItem key={n.id} n={n} markAsRead={markAsRead} />)}
              </>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        {!loading && notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-red-100 bg-red-50 flex justify-center">
            <p className="text-xs text-gray-400">
              {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;