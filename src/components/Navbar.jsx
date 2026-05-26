import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import { 
  Bell, 
  Menu, 
  X, 
  PawPrint, 
  Check, 
  Info,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err.message);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user, setNotifications]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id) => {
    try {
      const res = await API.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, read: true } : n))
        );
        addToast('Notification marked as read', 'success', 2000);
      }
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => API.put(`/notifications/${n._id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast('All notifications marked as read', 'success', 2500);
    } catch (err) {
      console.error('Error reading all notifications:', err.message);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'status_change':
        return <RefreshCw className="w-4 h-4 text-emerald-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-8">
      {/* Mobile & Logo Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 md:hidden transition-all duration-200"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 select-none">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
            <PawPrint className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-brand-100 to-brand-400 bg-clip-text text-transparent">
            PawLink
          </span>
        </div>
      </div>

      {/* Notifications Drawer Right */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative p-2.5 rounded-xl hover:bg-white/5 border border-white/5 hover:border-white/10 text-slate-300 hover:text-slate-100 transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 rounded-full border border-slate-950 flex items-center justify-center text-[10px] font-extrabold text-white animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 max-h-96 rounded-2xl glass border border-white/10 shadow-2xl overflow-hidden flex flex-col z-[999]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                  <h4 className="font-bold text-slate-200 text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List Container */}
                <div className="overflow-y-auto flex-1 divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                      <Bell className="w-8 h-8 text-slate-600" />
                      <span>No alerts recorded yet.</span>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        className={`p-3.5 flex gap-3 transition-colors ${
                          notif.read ? 'bg-transparent' : 'bg-white/[0.03] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-xs text-slate-200 truncate">
                            {notif.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="mt-0.5 shrink-0 self-start text-brand-400 hover:text-brand-300 p-0.5 hover:bg-brand-500/10 rounded"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
