import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X, Sparkles, Bot, AlertTriangle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ all: true })
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {}
  };

  const deleteNotif = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {}
  };

  const getIconForType = (type: string) => {
    if (type.includes('quiz')) return <Sparkles className="w-4 h-4 text-purple-500" />;
    if (type.includes('warning') || type.includes('attendance')) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (type.includes('summary') || type.includes('study')) return <BookOpen className="w-4 h-4 text-blue-500" />;
    return <Bot className="w-4 h-4 text-brand-primary" />;
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2.5 rounded-2xl bg-gray-100/80 dark:bg-white/[0.04] hover:bg-gray-200/80 dark:hover:bg-white/[0.08] border border-gray-200/80 dark:border-white/10 text-gray-700 dark:text-gray-300 transition-all shadow-sm"
        aria-label="Notification Center"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-brand-dark animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="fixed right-4 top-20 w-96 max-h-[75vh] bg-white dark:bg-brand-dark border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notification Center</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Autonomous Platform Activity</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-brand-primary font-medium px-2.5 py-1 rounded-lg hover:bg-brand-primary/10 transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {loading ? (
                  <div className="py-12 text-center text-xs text-gray-500">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Bot className="w-8 h-8 text-gray-400 mx-auto opacity-50" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">No automated notifications yet</p>
                  </div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all relative group ${
                        item.is_read
                          ? 'bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 opacity-80'
                          : 'bg-brand-primary/5 dark:bg-brand-primary/[0.08] border-brand-primary/20 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 dark:border-white/10 mt-0.5">
                          {getIconForType(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.title}</h4>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNotif(item.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
