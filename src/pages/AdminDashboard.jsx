import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { 
  ShieldAlert, 
  MapPin, 
  Layers, 
  Users, 
  Heart, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Filter,
  Eye,
  RefreshCw,
  TrendingUp,
  X
} from 'lucide-react';

// Create map markers depending on severity levels
const createSeverityPin = (severity) => {
  let color = 'bg-emerald-500 border-emerald-400';
  let pulseClass = '';

  if (severity === 'Critical') {
    color = 'bg-rose-500 border-rose-400';
    pulseClass = 'animate-ping scale-150';
  } else if (severity === 'High') {
    color = 'bg-orange-500 border-orange-400';
  } else if (severity === 'Medium') {
    color = 'bg-amber-500 border-amber-400';
  }

  return new L.DivIcon({
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center select-none">
        ${severity === 'Critical' ? `<div class="absolute w-8 h-8 rounded-full bg-rose-500/30 ${pulseClass}"></div>` : ''}
        <div class="relative w-6 h-6 rounded-full ${color} border-2 flex items-center justify-center shadow-2xl">
          <div class="w-1.5 h-1.5 rounded-full bg-slate-950"></div>
        </div>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const MapPan = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
};

const AdminDashboard = () => {
  const { addToast } = useToast();
  const { socket } = useSocket();

  // Tab selections ('reports', 'users')
  const [activeTab, setActiveTab] = useState('reports');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);

  // Filters
  const [filterIssue, setFilterIssue] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  // Map control
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);

  // Detail Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Status updating loader
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err.message);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    let query = [];
    if (filterIssue) query.push(`issueType=${filterIssue}`);
    if (filterStatus) query.push(`status=${filterStatus}`);
    if (filterSeverity) query.push(`severity=${filterSeverity}`);

    const queryString = query.length > 0 ? `?${query.join('&')}` : '';

    try {
      const res = await API.get(`/admin/reports${queryString}`);
      if (res.data.success) {
        setReports(res.data.reports);
        
        // Pan map center to first report coordinates if available
        if (res.data.reports.length > 0) {
          const first = res.data.reports[0].location;
          setMapCenter([first.lat, first.lng]);
        }
      }
    } catch (err) {
      console.error('Error fetching reports list:', err.message);
      addToast('Failed to load active reports.', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching user logs:', err.message);
    }
  };

  useEffect(() => {
    fetchStats();
    if (activeTab === 'reports') {
      fetchReports();
    } else {
      fetchUsers();
    }
  }, [activeTab, filterIssue, filterStatus, filterSeverity]);

  // WebSocket real-time triggers for immediate panel updates
  useEffect(() => {
    if (socket) {
      socket.on('new_report', () => {
        addToast('🚨 Active Incident Submission Broadcasted!', 'warning', 5000);
        fetchStats();
        if (activeTab === 'reports') fetchReports();
      });

      socket.on('report_updated', () => {
        fetchStats();
        if (activeTab === 'reports') fetchReports();
      });
    }

    return () => {
      if (socket) {
        socket.off('new_report');
        socket.off('report_updated');
      }
    };
  }, [socket, activeTab, filterIssue, filterStatus, filterSeverity]);

  const handleStatusChange = async (reportId, newStatus) => {
    setStatusUpdating(reportId);
    try {
      const res = await API.put(`/admin/reports/${reportId}/status`, { status: newStatus });
      if (res.data.success) {
        addToast(res.data.message, 'success', 3500);
        
        // Update local reports list immediately
        setReports(prev =>
          prev.map(rep => (rep._id === reportId ? { ...rep, status: newStatus } : rep))
        );
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to update status', 'error', 3000);
    } finally {
      setStatusUpdating(null);
    }
  };

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'In Progress':
        return 'text-sky-400 border-sky-500/20 bg-sky-500/10';
      case 'Pending':
      default:
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10';
      case 'High':
        return 'text-orange-400 bg-orange-500/10';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10';
      case 'Low':
      default:
        return 'text-emerald-400 bg-emerald-500/10';
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none relative">
      {/* Header with platform stats triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse shrink-0" />
            Admin Rescue Control
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Global management cockpit to coordinate responding bodies, monitor map logs, and alter status fields.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex gap-2 bg-slate-900 border border-white/5 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'reports'
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Logs ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'users'
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/15'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Users & Pets Directory
          </button>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total Reports */}
          <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-extrabold text-slate-200">{stats.totalReports}</h3>
              <Layers className="w-5 h-5 text-slate-500 shrink-0" />
            </div>
          </div>

          {/* Pending Alerts */}
          <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Alerts</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-extrabold text-amber-400">{stats.pending}</h3>
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            </div>
          </div>

          {/* In Progress */}
          <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">In Progress</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-extrabold text-sky-400">{stats.inProgress}</h3>
              <RefreshCw className="w-5 h-5 text-sky-400 shrink-0 animate-spin" />
            </div>
          </div>

          {/* Resolved */}
          <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Resolved Rescue</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-extrabold text-emerald-400">{stats.resolved}</h3>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          </div>

          {/* Users Count */}
          <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Citizens</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-extrabold text-slate-200">{stats.usersCount}</h3>
              <Users className="w-5 h-5 text-slate-500 shrink-0" />
            </div>
          </div>

          {/* Pets Count */}
          <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col justify-between shadow-lg">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Pets Registered</span>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-extrabold text-brand-400">{stats.petsCount}</h3>
              <Heart className="w-5 h-5 text-brand-500 shrink-0 fill-brand-500/10" />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVE REPORTS (DEFAULT) */}
      {activeTab === 'reports' ? (
        <div className="flex flex-col gap-6">
          {/* Filters Capsule */}
          <div className="glass rounded-3xl p-5 border border-white/5 flex flex-wrap items-center gap-4 shadow-xl">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-brand-400" />
              Directory Filters:
            </span>

            {/* Filter Issue */}
            <select
              value={filterIssue}
              onChange={(e) => setFilterIssue(e.target.value)}
              className="bg-slate-900 border border-white/5 text-slate-300 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-500 text-xs"
            >
              <option value="">All Issue Categories</option>
              <option value="Injured">Injured</option>
              <option value="Rescue Request">Rescue Request</option>
              <option value="Dead/Decomposed">Dead / Decomposed</option>
              <option value="Treatment Required">Treatment Required</option>
              <option value="Wild Animal Sighting">Wild Animal Sighting</option>
            </select>

            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-white/5 text-slate-300 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-500 text-xs"
            >
              <option value="">All Status states</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Filter Severity */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-white/5 text-slate-300 rounded-xl py-2 px-3 focus:outline-none focus:border-brand-500 text-xs"
            >
              <option value="">All Severity tiers</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Interactive Cluster Map plotting all reported incidents */}
          <div className="h-[400px] rounded-3xl overflow-hidden border border-white/5 relative z-10 shadow-xl">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {reports.map((rep) => (
                <Marker
                  key={rep._id}
                  position={[rep.location.lat, rep.location.lng]}
                  icon={createSeverityPin(rep.severity)}
                >
                  <Popup>
                    <div className="p-2 flex flex-col gap-1.5 select-none min-w-[200px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1">
                        <h4 className="font-extrabold text-xs text-slate-200">
                          {rep.animalType} ({rep.issueType})
                        </h4>
                        <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold ${getSeverityColor(rep.severity)}`}>
                          {rep.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{rep.location.address || 'Global coordinates'}</p>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-medium">"{rep.description.substr(0, 50)}..."</p>
                      <div className="text-[9px] text-slate-500 border-t border-white/5 pt-1 flex justify-between items-center mt-1">
                        <span>Assigned Responders:</span>
                        <span className="font-semibold text-brand-400">{rep.assignedAuthority.split(' & ')[0]}</span>
                      </div>
                      <button
                        onClick={() => openReportDetails(rep)}
                        className="mt-2 text-center text-[10px] font-bold bg-brand-500 text-slate-950 p-1.5 rounded-lg transition-colors hover:bg-brand-400 w-full"
                      >
                        Inspect Full Profile
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              <MapPan center={mapCenter} />
            </MapContainer>
          </div>

          {/* Detailed Reports Data Table List */}
          <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-sm text-slate-200">Incident Registry Logs</h3>
              <span className="text-xs text-slate-400">Renders latest logs first</span>
            </div>

            {loading ? (
              <div className="p-16 flex justify-center">
                <Spinner />
              </div>
            ) : reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No active incident records found matching active filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 divide-y divide-white/5">
                  <thead className="bg-white/[0.01] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="p-4">Reported target</th>
                      <th className="p-4">Priority Severity</th>
                      <th className="p-4">Assigned Authority Responders</th>
                      <th className="p-4">Incident Coordinates</th>
                      <th className="p-4">Rescue Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reports.map((rep) => (
                      <tr key={rep._id} className="hover:bg-white/[0.01] transition-colors">
                        {/* Reporter Details */}
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-200">
                              {rep.animalType} — <span className="text-slate-400 font-semibold">{rep.issueType}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              By: {rep.reporter?.name || 'Citizen'} ({rep.reporter?.email || 'N/A'})
                            </p>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                            rep.severity === 'Critical' 
                              ? 'border-rose-500/20 text-rose-400 bg-rose-500/5' 
                              : rep.severity === 'High'
                              ? 'border-orange-500/20 text-orange-400 bg-orange-500/5'
                              : rep.severity === 'Medium'
                              ? 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                              : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
                          }`}>
                            {rep.severity}
                          </span>
                        </td>

                        {/* Assigned Responders */}
                        <td className="p-4">
                          <p className="font-semibold text-slate-300 max-w-[200px] truncate" title={rep.assignedAuthority}>
                            {rep.assignedAuthority}
                          </p>
                        </td>

                        {/* Address */}
                        <td className="p-4">
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]" title={rep.location.address || 'Coordinates'}>
                            {rep.location.address || `[${rep.location.lat.toFixed(3)}, ${rep.location.lng.toFixed(3)}]`}
                          </p>
                        </td>

                        {/* Dropdown status update changers */}
                        <td className="p-4">
                          <div className="relative">
                            <select
                              disabled={statusUpdating === rep._id}
                              value={rep.status}
                              onChange={(e) => handleStatusChange(rep._id, e.target.value)}
                              className={`border focus:outline-none rounded-xl py-1.5 px-3 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                                getStatusColor(rep.status)
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openReportDetails(rep)}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-all inline-flex items-center gap-1.5 hover:scale-[1.03]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ==========================================
        //         TAB CONTENT: USERS DIRECTORY
        // ==========================================
        <div className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-white/5">
            <h3 className="font-bold text-sm text-slate-200">Users & Registered Pets Directory</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-white/5">
              <thead className="bg-white/[0.01] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="p-4">Account name</th>
                  <th className="p-4">Active Mode Role</th>
                  <th className="p-4">Registered Pets</th>
                  <th className="p-4">Pets Profile logs</th>
                  <th className="p-4 text-right">Joined date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-200">{item.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.hasPet ? (
                        <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                          Pet Owner Mode
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                          Citizen Mode
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-sm text-slate-300">
                      {item.petsCount}
                    </td>
                    <td className="p-4">
                      {item.pets && item.pets.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                          {item.pets.map(p => (
                            <span key={p._id} className="text-[9px] font-semibold bg-white/5 border border-white/5 text-slate-400 px-2 py-0.5 rounded-lg">
                              {p.name} ({p.breed})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-550 text-[10px]">No pets recorded</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==========================================
      //    INCIDENT REPORT DETAIL POPUP INSPECT
      // ========================================== */}
      {modalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto select-none animate-fade-in">
          <div className="w-full max-w-2xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-200">
                  {selectedReport.animalType} ({selectedReport.issueType})
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Report ID: {selectedReport._id}
                </p>
              </div>
              
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Frame */}
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900 h-60 flex items-center justify-center">
                {selectedReport.photo ? (
                  <img
                    src={`http://localhost:5000${selectedReport.photo}`}
                    alt="Incident photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🐾</span>
                )}
              </div>

              {/* Data list details */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    getStatusColor(selectedReport.status)
                  }`}>
                    {selectedReport.status}
                  </span>
                  
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    getSeverityColor(selectedReport.severity)
                  }`}>
                    {selectedReport.severity} Severity
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Description log</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">"{selectedReport.description}"</p>
                </div>

                <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Assigned Responders</span>
                  <p className="text-xs text-brand-400 font-bold leading-normal">{selectedReport.assignedAuthority}</p>
                </div>
              </div>
            </div>

            {/* Geographical coordinates and contact stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4 mt-2">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Incident Location</span>
                <p className="text-xs font-semibold text-slate-300 mt-1 truncate" title={selectedReport.location.address}>
                  {selectedReport.location.address || 'Global Center'}
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">GPS Coordinates</span>
                <p className="text-xs font-mono font-semibold text-slate-400 mt-1">
                  [{selectedReport.location.lat.toFixed(4)}, {selectedReport.location.lng.toFixed(4)}]
                </p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Contact details</span>
                <p className="text-xs font-semibold text-slate-300 mt-1 truncate" title={selectedReport.contactDetails}>
                  {selectedReport.contactDetails}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
