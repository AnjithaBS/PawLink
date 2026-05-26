import React, { useState, useEffect } from 'react';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { 
  FileText, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Phone,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

const MyReports = () => {
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const res = await API.get('/reports/my');
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Error fetching my reports:', err.message);
      addToast('Failed to retrieve submitted reports.', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full text-sky-400 bg-sky-500/10 border border-sky-500/20 uppercase tracking-wider">
            <Clock className="w-3 h-3 text-sky-400 shrink-0 animate-spin" />
            In Progress
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full text-amber-400 bg-amber-500/10 border border-amber-500/20 uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            Pending
          </span>
        );
    }
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20 pulse-critical',
      High: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    };
    return (
      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${classes[severity]}`}>
        {severity} Priority
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">My Rescue Logs</h1>
        <p className="text-slate-400 text-sm mt-1">
          Monitor response updates and status progression on your logged animal incidents.
        </p>
      </div>

      {loading ? (
        <div className="glass rounded-3xl p-32 border border-white/5 flex justify-center">
          <Spinner />
        </div>
      ) : reports.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 mb-2">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-300 text-lg">No active incident logs</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            You haven't logged any stray or wild animal issues on PawLink yet. Every report actively coordinates responders to rescue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {reports.map((report) => (
            <div
              key={report._id}
              className="glass rounded-3xl border border-white/5 hover:border-white/10 shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Report Hero Frame */}
              <div className="h-48 relative bg-slate-900 overflow-hidden border-b border-white/5 flex items-center justify-center">
                {report.photo ? (
                  <img
                    src={`http://localhost:5000${report.photo}`}
                    alt={report.animalType}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-600 text-center">
                    <span className="text-5xl">🐾</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">No picture attached</span>
                  </div>
                )}

                {/* Severity Badge overlay */}
                <div className="absolute top-4 left-4">
                  {getSeverityBadge(report.severity)}
                </div>

                {/* Status Badge overlay */}
                <div className="absolute top-4 right-4 z-10">
                  {getStatusBadge(report.status)}
                </div>

                {/* Header title block */}
                <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-2xl max-w-[80%]">
                  <h4 className="font-extrabold text-sm text-slate-200">
                    {report.animalType} ({report.issueType})
                  </h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {new Date(report.createdAt).toLocaleDateString()} at{' '}
                    {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Card details */}
              <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Description */}
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Incident log</p>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    "{report.description}"
                  </p>
                </div>

                {/* Smart alert routing authority details */}
                <div className="p-3.5 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-brand-400 shrink-0" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                      Smart Assigned Responders
                      <Sparkles className="w-3 h-3 text-brand-400 animate-pulse" />
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">
                      {report.assignedAuthority}
                    </p>
                  </div>
                </div>

                {/* Location landmarks and details */}
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Pin Location</p>
                      <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                        {report.location.address || `[${report.location.lat.toFixed(3)}, ${report.location.lng.toFixed(3)}]`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Contact Filed</p>
                      <p className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">
                        {report.contactDetails}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default MyReports;
