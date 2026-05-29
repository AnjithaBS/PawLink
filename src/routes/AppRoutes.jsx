import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

// Page imports
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import AskPetOwner from '../pages/AskPetOwner.jsx';
import Home from '../pages/Home.jsx';
import ReportIssue from '../pages/ReportIssue.jsx';
import MyReports from '../pages/MyReports.jsx';
import NearbyHelp from '../pages/NearbyHelp.jsx';
import Profile from '../pages/Profile.jsx';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import Community from '../pages/Community.jsx';
import AdoptionCorner from '../pages/AdoptionCorner.jsx';
import LostFoundPets from '../pages/LostFoundPets.jsx';
import DiscussionForum from '../pages/DiscussionForum.jsx';
import HealthScheduler from '../pages/HealthScheduler.jsx';

// Layout framework
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import PawBotButton from '../components/chatbot/PawBotButton.jsx';

// Shell container incorporating sidebar + navbar
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />
        <main className="flex-1 md:pl-64 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
      <PawBotButton />
    </div>
  );
};

// Route security filter for authenticated sessions
const ProtectedRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Spinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Force user to complete hasPet questionnaire if preference is null
  if (user && user.hasPet === null && window.location.pathname !== '/ask-preference') {
    return <Navigate to="/ask-preference" replace />;
  }

  return <Outlet />;
};

// Route gatekeeper for Admin access
const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Spinner fullPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

// Route gatekeeper for guest pages (Login/Signup)
const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner fullPage />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest Paths */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Questionnaire wizard */}
      <Route element={<ProtectedRoute />}>
        <Route path="/ask-preference" element={<AskPetOwner />} />
      </Route>

      {/* Authenticated Dashboard Shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/report-issue" element={<ReportIssue />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/nearby-help" element={<NearbyHelp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
          <Route path="/adoption" element={<AdoptionCorner />} />
          <Route path="/lost-found" element={<LostFoundPets />} />
          <Route path="/forum" element={<DiscussionForum />} />
          <Route path="/health-scheduler" element={<HealthScheduler />} />
        </Route>
      </Route>

      {/* Admin specific panels */}
      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
