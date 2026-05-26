import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Home, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  User, 
  ShieldAlert, 
  LogOut,
  HeartPulse
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of PawLink?')) {
      logout();
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium tracking-wide transition-all duration-200 ${
      isActive
        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
    }`;

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass border-r border-white/5 pt-20 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full justify-between pb-6 px-4">
        {/* Navigation Section */}
        <div className="flex flex-col gap-1">
          {/* User profile capsule in sidebar */}
          <div className="flex items-center gap-3 p-3 mb-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center font-bold text-slate-950 uppercase shadow-lg">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-slate-100 truncate text-sm">{user?.name}</h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 text-brand-300 bg-brand-500/10 border border-brand-500/20 uppercase tracking-widest scale-90 origin-left">
                {user?.role}
              </span>
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-4 mb-2">Platform</p>
          
          <NavLink to="/" end className={navLinkClass} onClick={toggleSidebar}>
            <Home className="w-5 h-5" />
            <span>Home Dashboard</span>
          </NavLink>

          <NavLink to="/report-issue" className={navLinkClass} onClick={toggleSidebar}>
            <AlertTriangle className="w-5 h-5" />
            <span>Report Issue</span>
          </NavLink>

          <NavLink to="/my-reports" className={navLinkClass} onClick={toggleSidebar}>
            <FileText className="w-5 h-5" />
            <span>My Reports</span>
          </NavLink>

          {/* Show Nearby Help ONLY if user has pets (hasPet === true) */}
          {user?.hasPet === true && (
            <NavLink to="/nearby-help" className={navLinkClass} onClick={toggleSidebar}>
              <MapPin className="w-5 h-5" />
              <span className="flex items-center gap-1.5">
                Nearby Help
                <HeartPulse className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              </span>
            </NavLink>
          )}

          <NavLink to="/profile" className={navLinkClass} onClick={toggleSidebar}>
            <User className="w-5 h-5" />
            <span>My Profile</span>
          </NavLink>

          {/* Admin routes link */}
          {user?.role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-4 mb-2">Management</p>
              <NavLink to="/admin" className={navLinkClass} onClick={toggleSidebar}>
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span className="text-rose-400">Admin Control</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium tracking-wide text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all duration-200 mt-auto"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
