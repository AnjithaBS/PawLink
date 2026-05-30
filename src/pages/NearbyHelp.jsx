import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Star,
  Activity,
  ShoppingBag,
  Scissors,
  Utensils,
  Navigation
} from 'lucide-react';

// Create custom icons based on Category for beautiful map indicators
const createCustomIcon = (type) => {
  let colorClass = 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
  let innerColor = 'bg-emerald-100';

  if (type === 'Pet Food Store') {
    colorClass = 'bg-sky-500 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]';
    innerColor = 'bg-sky-100';
  } else if (type === 'Pet Grooming Salon') {
    colorClass = 'bg-fuchsia-500 border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.5)]';
    innerColor = 'bg-fuchsia-100';
  } else if (type === 'Pet Accessory Shop') {
    colorClass = 'bg-amber-500 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
    innerColor = 'bg-amber-100';
  }

  return new L.DivIcon({
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center">
        <div class="w-6 h-6 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-lg">
          <span class="text-[10px] text-white font-bold leading-none select-none">🐾</span>
        </div>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to dynamically pan map center to selected shop
const MapPanTo = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const NearbyHelp = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  
  // Coordinates (Default: San Francisco)
  const [userCoords, setUserCoords] = useState([8.4024, 77.0822]);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Map control
  const [mapCenter, setMapCenter] = useState([8.4024, 77.0822]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const fetchNearby = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await API.get(`/nearby?lat=${lat}&lng=${lng}`);
      if (res.data.success) {
        setServices(res.data.all);
        setFilteredServices(res.data.all);
        setMapCenter([lat, lng]);
      }
    } catch (err) {
      console.error('Error fetching nearby help:', err.message);
      addToast('Failed to calculate nearby services.', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch using default coordinates
    fetchNearby(userCoords[0], userCoords[1]);
  }, []);

  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation not supported by this browser', 'warning', 3000);
      return;
    }

    setLocating(true);
    addToast('Detecting location coordinates...', 'info', 2000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords([latitude, longitude]);
        setLocating(false);
        addToast('Live location fetched successfully! Calculating nearby help.', 'success', 3000);
        fetchNearby(latitude, longitude);
      },
      (error) => {
        console.error(error);
        setLocating(false);
        addToast('Location access denied. Using mock global center.', 'warning', 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSelectedServiceId(null);

    if (category === 'All') {
      setFilteredServices(services);
    } else {
      const typeMapping = {
        vets: 'Veterinary Hospital',
        food: 'Pet Food Store',
        grooming: 'Pet Grooming Salon',
        accessories: 'Pet Accessory Shop'
      };
      setFilteredServices(services.filter(s => s.type === typeMapping[category]));
    }
  };

  const handleSelectService = (service) => {
    setSelectedServiceId(service.id);
    setMapCenter([service.location.lat, service.location.lng]);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Nearby Pet Support</h1>
          <p className="text-slate-400 text-sm mt-1">
            Map coordinates to display veterinary hospitals, organic markets, spas, and accessory shops.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGPSDetect}
          disabled={locating}
          className="flex items-center gap-1.5 p-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-brand-400' : ''}`} />
          <span>{locating ? 'Searching GPS...' : 'Sync Map with My Location'}</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { key: 'All', label: 'All Services', icon: <Activity className="w-3.5 h-3.5" /> },
          { key: 'vets', label: 'Veterinary Hospitals', icon: <Heart className="w-3.5 h-3.5 text-brand-400" /> },
          { key: 'food', label: 'Pet Food Stores', icon: <Utensils className="w-3.5 h-3.5 text-sky-400" /> },
          { key: 'grooming', label: 'Grooming Spas', icon: <Scissors className="w-3.5 h-3.5 text-fuchsia-400" /> },
          { key: 'accessories', label: 'Accessory Shops', icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-400" /> }
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => handleCategoryFilter(btn.key)}
            className={`flex items-center gap-1.5 p-1 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              selectedCategory === btn.key
                ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                : 'bg-white/5 text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass rounded-3xl p-32 border border-white/5 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Proximity List Left (1 column) */}
          <div className="lg:col-span-1 flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
            <h3 className="font-bold text-slate-300 text-sm">Proximity Directory</h3>
            
            {filteredServices.length === 0 ? (
              <div className="glass rounded-3xl p-8 text-center text-xs text-slate-500 border border-white/5">
                No clinics or centers located in this scope.
              </div>
            ) : (
              filteredServices.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => handleSelectService(shop)}
                  className={`glass rounded-2xl p-4 border transition-all duration-300 cursor-pointer flex flex-col gap-2.5 hover:scale-[1.01] ${
                    selectedServiceId === shop.id
                      ? 'border-brand-500/40 bg-brand-500/5 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-200 leading-snug">{shop.name}</h4>
                    <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                      {shop.distance} km
                    </span>
                  </div>

                  <span className={`text-[9px] font-bold uppercase tracking-wider scale-95 origin-left ${
                    shop.type === 'Veterinary Hospital'
                      ? 'text-brand-400'
                      : shop.type === 'Pet Food Store'
                      ? 'text-sky-400'
                      : shop.type === 'Pet Grooming Salon'
                      ? 'text-fuchsia-400'
                      : 'text-amber-400'
                  }`}>
                    {shop.type}
                  </span>

                  <p className="text-[11px] text-slate-400 leading-relaxed">{shop.address}</p>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 border-t border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <strong className="text-slate-300 font-semibold">{shop.rating}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {shop.contact}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Map Right (2 columns) */}
          <div className="lg:col-span-2 h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border border-white/5 relative z-10 shadow-xl">
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User Center Coordinate */}
              <Marker
                position={userCoords}
                icon={new L.DivIcon({
                  html: `
                    <div class="relative w-8 h-8 flex items-center justify-center">
                      <div class="absolute w-8 h-8 rounded-full bg-sky-500/30 animate-ping"></div>
                      <div class="relative w-6 h-6 rounded-full bg-[#0B0F1A] border-2 border-sky-400 flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                        <div class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
                      </div>
                    </div>
                  `,
                  className: '',
                  iconSize: [32, 32],
                  iconAnchor: [16, 16],
                })}
              >
                <Popup>
                  <div className="p-1 font-bold text-xs text-rose-400">Your Current Coordinate</div>
                </Popup>
              </Marker>

              {/* Seeded Services Coordinates */}
              {filteredServices.map((shop) => (
                <Marker
                  key={shop.id}
                  position={[shop.location.lat, shop.location.lng]}
                  icon={createCustomIcon(shop.type)}
                >
                  <Popup>
                    <div className="p-2 flex flex-col gap-1.5">
                      <h4 className="font-bold text-xs text-slate-200 leading-snug">{shop.name}</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">{shop.address}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 border-t border-white/5 pt-1 mt-1">
                        <span className="flex items-center gap-0.5 font-bold text-amber-400">
                          ★ {shop.rating}
                        </span>
                        <span className="font-mono text-slate-400">{shop.contact}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              <MapPanTo center={mapCenter} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyHelp;
