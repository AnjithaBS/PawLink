import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { 
  Plus, 
  MapPin, 
  Upload, 
  Search, 
  Calendar, 
  Phone, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  X,
  Map as MapIcon
} from 'lucide-react';

// Custom pins for Lost and Found pets
const lostPinIcon = new L.DivIcon({
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-rose-500/30 border border-rose-400 animate-ping"></div>
      <div class="relative w-7 h-7 rounded-full bg-[#0B0F1A] border-2 border-rose-500 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.5)]">
        <span class="text-xs text-rose-400 font-bold select-none leading-none">🐾</span>
      </div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const foundPinIcon = new L.DivIcon({
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400 animate-ping"></div>
      <div class="relative w-7 h-7 rounded-full bg-[#0B0F1A] border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
        <span class="text-xs text-emerald-400 font-bold select-none leading-none">🐾</span>
      </div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map click event listener to select coords inside form modal
const FormMapEvents = ({ setPosition, addToast }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      addToast(`Selected coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`, 'info', 2000);
    }
  });
  return null;
};

// Recenter Map Helper
const RecenterMap = ({ coords }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
};

const LostFoundPets = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Lost'); // Tab filters listing and map display (Lost / Found)
  
  // Form states
  const [type, setType] = useState('Lost');
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [address, setAddress] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  
  // Map positioning inside modal form
  const [formPosition, setFormPosition] = useState([8.4024, 77.0822]);
  // Main view map center
  const [viewCenter, setViewCenter] = useState([8.4024, 77.0822]);
  
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      // Fetch all to plot on map, we can filter listings in memory by tab
      const res = await API.get('/lost-found', { params });
      if (res.data.success) {
        setReports(res.data.reports);
        
        // Recenter main view map to first result if exists
        const filtered = res.data.reports.filter(r => r.type === activeTab);
        if (filtered.length > 0 && filtered[0].lastSeenLocation) {
          setViewCenter([filtered[0].lastSeenLocation.lat, filtered[0].lastSeenLocation.lng]);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading reports', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search, activeTab]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!breed || !color || !dateTime || !contactDetails) {
      addToast('Please fill out all fields', 'warning', 3000);
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('type', type);
    formData.append('breed', breed);
    formData.append('color', color);
    formData.append('dateTime', dateTime);
    formData.append('contactDetails', contactDetails);
    formData.append('address', address);
    formData.append('lat', formPosition[0]);
    formData.append('lng', formPosition[1]);
    if (photoFile) {
      formData.append('image', photoFile);
    }

    try {
      const res = await API.post('/lost-found', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        addToast('Lost/Found pet reported successfully! 🚨', 'success', 3000);
        setModalOpen(false);
        // Clear
        setBreed('');
        setColor('');
        setDateTime('');
        setContactDetails('');
        setAddress('');
        setPhotoFile(null);
        setPhotoPreview('');
        fetchReports();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error submitting report';
      addToast(errMsg, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (reportId) => {
    try {
      const res = await API.put(`/lost-found/${reportId}/status`);
      if (res.data.success) {
        addToast(res.data.message, 'success', 3000);
        fetchReports();
      }
    } catch (err) {
      addToast('Failed to update status', 'error', 3000);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (confirm('Delete this report permanently?')) {
      try {
        const res = await API.delete(`/lost-found/${reportId}`);
        if (res.data.success) {
          addToast('Report deleted', 'success', 3000);
          fetchReports();
        }
      } catch (err) {
        addToast('Failed to delete report', 'error', 3000);
      }
    }
  };

  const filteredReports = reports.filter(r => r.type === activeTab);

  return (
    <div className="flex flex-col gap-6 relative select-none">
      {/* Header */}
      <div className="relative glass rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <MapIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Lost & Found Pets
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Report lost pets or map sightings of stray animals with custom geographic tracking.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="relative z-10 flex items-center gap-2 p-1.5 px-5 py-3 rounded-2xl font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Post Lost/Found Report</span>
        </button>
      </div>

      {/* Tabs and search bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Toggle tab */}
        <div className="glass p-1.5 rounded-2xl border border-white/5 flex gap-1">
          <button
            onClick={() => setActiveTab('Lost')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
              activeTab === 'Lost'
                ? 'bg-rose-500/25 border border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔍 View Lost Pet Reports
          </button>
          <button
            onClick={() => setActiveTab('Found')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
              activeTab === 'Found'
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-brand-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📍 View Found Animal Sightings
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex items-center">
          <span className="absolute left-4 text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by breed, color, address..."
            className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        </div>
      </div>

      {/* Main Content Layout (Map + Feed List) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Reports list (Left 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-1">
          <h2 className="text-lg font-bold text-slate-200 flex items-center justify-between">
            <span>List of {activeTab}s</span>
            <span className="text-xs bg-slate-800 border border-white/5 px-2 py-0.5 rounded-full text-slate-400">
              {filteredReports.length} reports
            </span>
          </h2>

          {loading && filteredReports.length === 0 ? (
            <div className="glass rounded-3xl p-16 flex items-center justify-center border border-white/5">
              <Spinner />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-white/5">
              <p className="text-slate-500 text-xs leading-relaxed">No reports matching this category.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredReports.map((report) => (
                <div 
                  key={report._id}
                  onClick={() => {
                    if (report.lastSeenLocation) {
                      setViewCenter([report.lastSeenLocation.lat, report.lastSeenLocation.lng]);
                    }
                  }}
                  className={`glass rounded-2xl border p-4 flex gap-4 cursor-pointer transition-all hover-tilt-lift ${
                    report.status === 'Found' 
                      ? 'opacity-60 border-white/5 bg-slate-900/40' 
                      : report.type === 'Lost'
                        ? 'blink-glow-red border-rose-500/30 bg-[#0F172A]/70 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                        : 'blink-glow-orange border-amber-500/30 bg-[#0F172A]/70 shadow-[0_0_15px_rgba(253,186,116,0.05)]'
                  }`}
                >
                  {/* Picture */}
                  <div className="w-20 h-20 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {report.image ? (
                      <img src={`http://localhost:5000${report.image}`} alt={report.breed} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🐾</span>
                    )}
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-200 truncate">{report.breed}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        report.status === 'Found' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                      }`}>
                        {report.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-normal">
                      <strong>Color:</strong> {report.color}
                    </p>

                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{report.lastSeenLocation?.address || 'Map Location'}</span>
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-[9px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.dateTime).toLocaleDateString()}
                      </span>

                      {/* Action buttons */}
                      <div className="flex gap-1">
                        {(report.reporter?._id === user?.id || user?.role === 'admin') && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStatus(report._id);
                              }}
                              className="p-1 text-[10px] font-bold text-brand-400 hover:text-brand-300"
                              title="Mark resolved/Found"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReport(report._id);
                              }}
                              className="p-1 text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Column Right (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-400" />
            <span>Interactive Tracking Map</span>
          </h2>

          <div className="h-[480px] rounded-3xl overflow-hidden border border-white/5 relative z-10 shadow-xl">
            <MapContainer
              center={viewCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Loop and plot pins */}
              {reports.map((report) => {
                if (!report.lastSeenLocation || !report.lastSeenLocation.lat) return null;
                const pos = [report.lastSeenLocation.lat, report.lastSeenLocation.lng];
                
                return (
                  <Marker 
                    key={report._id} 
                    position={pos} 
                    icon={report.type === 'Lost' ? lostPinIcon : foundPinIcon}
                  >
                    <Popup>
                      <div className="p-2 flex flex-col gap-2 max-w-[200px]">
                        <div className="font-bold text-slate-800 text-sm">{report.breed} ({report.type})</div>
                        <div className="text-slate-600 text-xs">
                          <strong>Color:</strong> {report.color}<br />
                          <strong>Status:</strong> {report.status}<br />
                          <strong>Seen:</strong> {new Date(report.dateTime).toLocaleDateString()}<br />
                          <strong>Contact:</strong> {report.contactDetails}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              <RecenterMap coords={viewCenter} />
            </MapContainer>
          </div>
        </div>
      </div>

      {/* ==========================================
      //    CREATE LOST/FOUND REPORT MODAL
      // ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto select-none">
          <div className="w-full max-w-2xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                🚨 File Lost/Found Pet Incident
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Report Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                  >
                    <option value="Lost">Lost Pet (My Pet is Missing) 🔍</option>
                    <option value="Found">Found Stray Sighting (Sighted Stray Animal) 📍</option>
                  </select>
                </div>

                {/* Breed */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Breed / Animal Category
                  </label>
                  <input
                    type="text"
                    required
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Beagle, Ginger Cat"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Color */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Color / Specific Markings
                  </label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Tri-color white brown spots, red collar"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Date & Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Last Seen Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Location Pin Map */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Pin Incident Location on Map (Click to Pin)
                </label>
                <div className="h-[220px] rounded-2xl overflow-hidden border border-white/5 relative z-10">
                  <MapContainer
                    center={formPosition}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={formPosition} icon={type === 'Lost' ? lostPinIcon : foundPinIcon} />
                    <FormMapEvents setPosition={setFormPosition} addToast={addToast} />
                    <RecenterMap coords={formPosition} />
                  </MapContainer>
                </div>
                <p className="text-[10px] text-slate-500">
                  Lat: {formPosition[0].toFixed(5)}, Lng: {formPosition[1].toFixed(5)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Landmark Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Last Seen Address / Landmarks
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near 24th St Civic Subway Station"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    placeholder="e.g. +1 (415) 555-0199"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Upload Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 bg-slate-900 border border-white/10 hover:border-brand-500 focus-within:border-brand-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-sm font-semibold">
                    <Upload className="w-4 h-4 text-brand-400" />
                    <span>{photoFile ? 'Change Photo' : 'Select Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  
                  {photoPreview && (
                    <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-white/10">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'Publishing Report...' : 'Publish Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFoundPets;
