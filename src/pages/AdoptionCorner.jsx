import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { 
  Heart, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Upload, 
  Trash2, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

const AdoptionCorner = () => {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [animalType, setAnimalType] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form Fields
  const [typeInput, setTypeInput] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (animalType) params.animalType = animalType;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/adoption', { params });
      if (res.data.success) {
        setListings(res.data.listings);
      }
    } catch (err) {
      console.error('Error fetching listings:', err.message);
      addToast('Error loading adoption listings', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, animalType, statusFilter]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleListingSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) {
      addToast('Please upload an animal photo', 'warning', 3000);
      return;
    }
    if (!typeInput || !breed || !age || !vaccinationStatus || !description || !location || !contactDetails) {
      addToast('Please fill out all listing fields', 'warning', 3000);
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('animalType', typeInput);
    formData.append('breed', breed);
    formData.append('age', age);
    formData.append('vaccinationStatus', vaccinationStatus);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('contactDetails', contactDetails);
    formData.append('image', photoFile);

    try {
      const res = await API.post('/adoption', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        addToast('Adoption listing added successfully! 🏡', 'success', 3000);
        setModalOpen(false);
        // Clear fields
        setTypeInput('');
        setBreed('');
        setAge('');
        setVaccinationStatus('');
        setDescription('');
        setLocation('');
        setContactDetails('');
        setPhotoFile(null);
        setPhotoPreview('');
        fetchListings();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error creating listing';
      addToast(errMsg, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (listingId) => {
    try {
      const res = await API.put(`/adoption/${listingId}/status`);
      if (res.data.success) {
        addToast(res.data.message, 'success', 3000);
        if (res.data.userHasPetUpdated) {
          await refreshUser();
        }
        fetchListings();
      }
    } catch (err) {
      addToast('Failed to toggle adoption status', 'error', 3000);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (confirm('Are you sure you want to delete this listing permanently?')) {
      try {
        const res = await API.delete(`/adoption/${listingId}`);
        if (res.data.success) {
          addToast('Adoption listing removed successfully', 'success', 3000);
          fetchListings();
        }
      } catch (err) {
        addToast('Failed to remove listing', 'error', 3000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 relative select-none">
      {/* Welcome Banner */}
      <div className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden border border-white/5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Adoption Corner
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Find loving forever homes for stray animals, or offer pets for adoption to reliable citizens.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="relative z-10 flex items-center gap-2 p-1.5 px-5 py-3 rounded-2xl font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>List for Adoption</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by breed, location, description..."
            className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={animalType}
            onChange={(e) => setAnimalType(e.target.value)}
            className="bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none transition-all flex-1 md:flex-initial"
          >
            <option value="">All Animal Types</option>
            <option value="Dog">Dogs</option>
            <option value="Cat">Cats</option>
            <option value="Bird">Birds</option>
            <option value="Other">Other Animals</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none transition-all flex-1 md:flex-initial"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Adopted">Adopted</option>
          </select>
        </div>
      </div>

      {loading && listings.length === 0 ? (
        <div className="glass rounded-3xl p-16 flex items-center justify-center border border-white/5">
          <Spinner />
        </div>
      ) : listings.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center gap-3">
          <div className="text-5xl mb-2">🏡</div>
          <h3 className="font-bold text-slate-300 text-lg">No adoption listings found</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Try adjusting your search criteria or add your own listing to find homes for local strays.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div 
              key={listing._id}
              className={`glass rounded-3xl border overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                listing.status === 'Adopted' 
                  ? 'border-white/5 opacity-65' 
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              {/* Pet Picture */}
              <div className="h-48 relative bg-slate-900 overflow-hidden flex items-center justify-center border-b border-white/5">
                <img 
                  src={`http://localhost:5000${listing.image}`} 
                  alt={listing.breed} 
                  className="w-full h-full object-cover"
                />
                
                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    listing.status === 'Available' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                  }`}>
                    {listing.status}
                  </span>
                  
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                    {listing.animalType}
                  </span>
                </div>

                {/* Edit / Delete Buttons Overlay */}
                {(listing.owner?._id === user?.id || user?.role === 'admin') && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {listing.status === 'Available' && (
                      <button
                        onClick={() => handleToggleStatus(listing._id)}
                        className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-brand-400 hover:text-brand-300 transition-colors"
                        title="Mark as Adopted"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteListing(listing._id)}
                      className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-200">{listing.breed}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">{listing.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-y border-white/5 py-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Age</span>
                    <span className="text-slate-300 font-semibold mt-0.5 block">{listing.age} Year{listing.age !== 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Vaccinated</span>
                    <span className="text-slate-300 font-semibold mt-0.5 block">{listing.vaccinationStatus}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed flex-1 line-clamp-3">
                  {listing.description}
                </p>

                {/* Owner contact */}
                <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>LISTED BY: {listing.owner?.name}</span>
                    <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                  </div>

                  <a
                    href={`tel:${listing.contactDetails}`}
                    className="flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact: {listing.contactDetails}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
      //    CREATE ADOPTION LISTING MODAL
      // ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto select-none">
          <div className="w-full max-w-xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                🏡 List Animal for Adoption
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleListingSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Animal Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Animal Type
                  </label>
                  <select
                    required
                    value={typeInput}
                    onChange={(e) => setTypeInput(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                  >
                    <option value="">Select Type</option>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Breed */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Breed / Specific Type
                  </label>
                  <input
                    type="text"
                    required
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Stray Kitten, Golden Lab"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Age (Years / Approx)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                  />
                </div>

                {/* Vaccination Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Vaccination Status
                  </label>
                  <input
                    type="text"
                    required
                    value={vaccinationStatus}
                    onChange={(e) => setVaccinationStatus(e.target.value)}
                    placeholder="e.g. Fully Vaccinated, First Dose Done"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Location Area
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mission District, San Francisco"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Contact details */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    placeholder="e.g. +1 (415) 555-0144"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Upload Animal Picture
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 bg-slate-900 border border-white/10 hover:border-brand-500 focus-within:border-brand-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-sm font-semibold">
                    <Upload className="w-4 h-4 text-brand-400" />
                    <span>{photoFile ? 'Change Photo' : 'Upload Photo'}</span>
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

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Description / Story
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell potential adopters about the animal's behavior, rescue circumstances, and temperament..."
                  rows="3"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'Creating Listing...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdoptionCorner;
