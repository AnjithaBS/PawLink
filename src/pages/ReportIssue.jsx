import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import { 
  AlertTriangle, 
  MapPin, 
  Upload, 
  Send,
  Navigation,
  Sparkles,
  Phone,
  Info
} from 'lucide-react';

// Gorgeous custom SVG Leaflet pin avoiding asset path glitches
const customPinIcon = new L.DivIcon({
  html: `
    <div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-brand-500/30 border border-brand-400 animate-ping"></div>
      <div class="relative w-7 h-7 rounded-full bg-slate-950 border-2 border-brand-500 flex items-center justify-center shadow-2xl">
        <div class="w-2 h-2 rounded-full bg-brand-400"></div>
      </div>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Click listener helper to grab lat/lng coordinates off map clicks
const MapEvents = ({ setPosition, addToast }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      addToast(`Selected coordinates: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`, 'info', 2000);
    }
  });
  return null;
};

// Component to dynamically pan map center to GPS location changes
const RecenterMap = ({ coords }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (coords) {
      map.setView(coords, 14);
    }
  }, [coords, map]);
  return null;
};

const ReportIssue = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form states
  const [animalType, setAnimalType] = useState('Dog');
  const [issueType, setIssueType] = useState('Injured');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [contactDetails, setContactDetails] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  
  // Geolocation states (Defaults to San Francisco coordinates)
  const [position, setPosition] = useState([37.7749, -122.4194]);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Trigger live geolocation fetch
  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'warning', 3000);
      return;
    }

    setLocating(true);
    addToast('Detecting live GPS coordinates...', 'info', 2000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setLocating(false);
        addToast('Live location loaded onto map!', 'success', 3000);
      },
      (error) => {
        console.error('GPS error:', error);
        setLocating(false);
        addToast('GPS access denied or timed out. Feel free to click anywhere on map.', 'warning', 4000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (!description || !contactDetails) {
      addToast('Description and contact details are required', 'warning', 3000);
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('animalType', animalType);
    formData.append('issueType', issueType);
    formData.append('description', description);
    formData.append('severity', severity);
    formData.append('contactDetails', contactDetails);
    formData.append('address', address);
    formData.append('lat', position[0]);
    formData.append('lng', position[1]);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const res = await API.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        addToast(res.data.message, 'success', 4500);
        navigate('/my-reports');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error submitting animal issue';
      addToast(errMsg, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Report Animal Issue</h1>
        <p className="text-slate-400 text-sm mt-1">
          Provide emergency details about strays in distress. Responders will automatically route based on location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Map Column Left (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-400" />
              Pin Incident Location
            </h3>

            <button
              type="button"
              onClick={handleGPSDetect}
              disabled={locating}
              className="flex items-center gap-1.5 p-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-brand-400' : ''}`} />
              <span>{locating ? 'Locating...' : 'My Live Geolocation'}</span>
            </button>
          </div>

          {/* Interactive Leaflet Map Wrapper */}
          <div className="h-[400px] md:h-[480px] rounded-3xl overflow-hidden border border-white/5 relative z-10 shadow-xl">
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} icon={customPinIcon} />
              <MapEvents setPosition={setPosition} addToast={addToast} />
              <RecenterMap coords={position} />
            </MapContainer>
            
            {/* Coordinate display capsule overlay */}
            <div className="absolute bottom-4 left-4 z-[999] bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-xs text-slate-200 shadow-2xl pointer-events-none">
              <p className="font-semibold flex items-center gap-1 text-brand-400 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Active Coordinates Pin
              </p>
              <p className="font-mono text-slate-400">Lat: {position[0].toFixed(5)}</p>
              <p className="font-mono text-slate-400">Lng: {position[1].toFixed(5)}</p>
            </div>
          </div>
        </div>

        {/* Input Details Column Right (2 columns) */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 border border-white/5 shadow-xl">
          <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
            {/* Animal & Issue Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Animal Category
                </label>
                <select
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-xs"
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Cow">Cow/Cattle</option>
                  <option value="Bird">Bird</option>
                  <option value="Wild Animal">Wild Animal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Issue Category
                </label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-xs"
                >
                  <option value="Injured">Injured</option>
                  <option value="Rescue Request">Rescue Request</option>
                  <option value="Dead/Decomposed">Dead / Decomposed</option>
                  <option value="Treatment Required">Treatment Required</option>
                  <option value="Wild Animal Sighting">Wild Sighting</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                Incident Description
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify visible injuries, confinement details, behavior, or wild animal size."
                rows="3"
                className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-xs resize-none"
              />
            </div>

            {/* Severity & Contact Details Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Severity Rating
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className={`w-full border focus:outline-none focus:ring-2 focus:ring-brand-500/20 rounded-xl py-3 px-3 text-xs font-bold transition-all ${
                    severity === 'Critical'
                      ? 'border-rose-500/50 bg-rose-950/20 text-rose-400'
                      : severity === 'High'
                      ? 'border-orange-500/50 bg-orange-950/20 text-orange-400'
                      : severity === 'Medium'
                      ? 'border-amber-500/50 bg-amber-950/20 text-amber-400'
                      : 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400'
                  }`}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Contact Details
                </label>
                <input
                  type="text"
                  required
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  placeholder="Email or Mobile"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-xs"
                />
              </div>
            </div>

            {/* Address Optional */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                Address / Nearby Landmarks
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Civic Center Park Bench 4"
                className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-xs"
              />
            </div>

            {/* Image Upload and Preview */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">
                Incident Photo
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 bg-slate-900 border border-white/10 hover:border-brand-500 focus-within:border-brand-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-xs font-semibold">
                  <Upload className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{photoFile ? 'Change Incident Photo' : 'Upload Incident Photo'}</span>
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

            {/* Authority routing guidelines info block */}
            <div className="flex gap-2 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10 text-[10px] text-slate-400 mt-1">
              <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                PawLink's **Smart Routing System** automatically analyzes coordinates to calculate distances, assigning the nearest Fire Forces (for Rescues), Veterinary Centers (for Treatment), or Forest Ranges (for Wild Animals).
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 shrink-0" />
                  <span>File Rescue Report</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
