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
  HeartPulse,
  Users,
  Sparkles,
  Map,
  MessageSquare,
  Activity
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of PawLink?')) {
      logout();
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold tracking-wide transition-all duration-300 transform hover:scale-[1.02] ${
      isActive
        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)] relative overflow-hidden before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-sky-400 before:rounded-full'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]'
    }`;

  return (
    <aside
      className={`fixed top-20 bottom-4 left-4 z-40 w-60 glass rounded-[24px] border border-white/5 pt-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full justify-between pb-6 px-4 overflow-y-auto">
        {/* Navigation Section */}
        <div className="flex flex-col gap-1">
          {/* User profile capsule in sidebar */}
          <div className="flex items-center gap-3 p-3 mb-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-violet-500 flex items-center justify-center font-bold text-[#0B0F1A] uppercase shadow-lg shadow-sky-400/15">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-slate-200 truncate text-sm">{user?.name}</h4>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 text-sky-300 bg-sky-500/10 border border-sky-500/20 uppercase tracking-widest">
                {user?.role}
              </span>
            </div>
          </div>

          <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-4 mb-2">Platform</p>
          
          <NavLink to="/" end className={navLinkClass} onClick={toggleSidebar}>
            <Home className="w-4.5 h-4.5" />
            <span>Home Dashboard</span>
          </NavLink>

          <NavLink to="/report-issue" className={navLinkClass} onClick={toggleSidebar}>
            <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
            <span>Report Issue</span>
          </NavLink>

          <NavLink to="/my-reports" className={navLinkClass} onClick={toggleSidebar}>
            <FileText className="w-4.5 h-4.5" />
            <span>My Reports</span>
          </NavLink>

          {/* Show Nearby Help ONLY if user has pets (hasPet === true) */}
          {user?.hasPet === true && (
            <NavLink to="/nearby-help" className={navLinkClass} onClick={toggleSidebar}>
              <MapPin className="w-4.5 h-4.5 text-sky-400" />
              <span className="flex items-center gap-1.5">
                Nearby Help
                <HeartPulse className="w-3 h-3 text-rose-400 animate-pulse" />
              </span>
            </NavLink>
          )}

          <NavLink to="/community" className={navLinkClass} onClick={toggleSidebar}>
            <Users className="w-4.5 h-4.5 text-violet-400" />
            <span>Pet Community</span>
          </NavLink>

          <NavLink to="/adoption" className={navLinkClass} onClick={toggleSidebar}>
            <Sparkles className="w-4.5 h-4.5 text-amber-400" />
            <span>Adoption Corner</span>
          </NavLink>

          <NavLink to="/lost-found" className={navLinkClass} onClick={toggleSidebar}>
            <Map className="w-4.5 h-4.5 text-emerald-400" />
            <span>Lost & Found</span>
          </NavLink>

          <NavLink to="/forum" className={navLinkClass} onClick={toggleSidebar}>
            <MessageSquare className="w-4.5 h-4.5" />
            <span>Discussion Forum</span>
          </NavLink>

          {/* Show Scheduler ONLY if user has pets */}
          {user?.hasPet === true && (
            <NavLink to="/health-scheduler" className={navLinkClass} onClick={toggleSidebar}>
              <Activity className="w-4.5 h-4.5" />
              <span>Health Scheduler</span>
            </NavLink>
          )}

          <NavLink to="/profile" className={navLinkClass} onClick={toggleSidebar}>
            <User className="w-4.5 h-4.5" />
            <span>My Profile</span>
          </NavLink>

          {/* Admin routes link */}
          {user?.role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-4 mb-2">Management</p>
              <NavLink to="/admin" className={navLinkClass} onClick={toggleSidebar}>
                <ShieldAlert className="w-4.5 h-4.5 text-rose-400" />
                <span className="text-rose-400">Admin Control</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold tracking-wide text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all duration-300 mt-8 transform hover:scale-[1.02]"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
