import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { 
  Heart, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertOctagon, 
  Calendar, 
  FileText, 
  ChevronRight, 
  Phone,
  Upload,
  UserCheck,
  MapPin,
  Flame,
  TreePine,
  Activity,
  X
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Pet Form Modal details
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [vaccines, setVaccines] = useState('');
  const [medical, setMedical] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Fetch pets list if pet owner
  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/pets');
      if (res.data.success) {
        setPets(res.data.pets);
      }
    } catch (err) {
      console.error('Error fetching pets:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.hasPet === true) {
      fetchPets();
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setSelectedPetId(null);
    setName('');
    setBreed('');
    setAge('');
    setVaccines('');
    setMedical('');
    setPhotoFile(null);
    setPhotoPreview('');
    setModalOpen(true);
  };

  const openEditModal = (pet) => {
    setEditMode(true);
    setSelectedPetId(pet._id);
    setName(pet.name);
    setBreed(pet.breed);
    setAge(pet.age.toString());
    setVaccines(pet.vaccinationDetails || '');
    setMedical(pet.medicalHistory || '');
    setPhotoFile(null);
    setPhotoPreview(pet.image ? `http://localhost:5000${pet.image}` : '');
    setModalOpen(true);
  };

  const handlePetSubmit = async (e) => {
    e.preventDefault();
    if (!name || !breed || !age) {
      addToast('Please fill out pet Name, Breed, and Age', 'warning', 3000);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('breed', breed);
    formData.append('age', age);
    formData.append('vaccinationDetails', vaccines);
    formData.append('medicalHistory', medical);
    if (photoFile) {
      formData.append('image', photoFile);
    }

    try {
      let res;
      if (editMode) {
        res = await API.put(`/pets/${selectedPetId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await API.post('/pets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        addToast(
          editMode ? 'Pet updated successfully!' : 'New pet added to your dashboard! 🐾',
          'success',
          3000
        );
        fetchPets();
        setModalOpen(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error processing pet card';
      addToast(errMsg, 'error', 4000);
    }
  };

  const handleDeletePet = async (id) => {
    if (confirm('Are you sure you want to delete this pet profile permanently?')) {
      try {
        const res = await API.delete(`/pets/${id}`);
        if (res.data.success) {
          addToast('Pet profile deleted successfully', 'success', 3000);
          fetchPets();
        }
      } catch (err) {
        addToast('Failed to delete pet', 'error', 3000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 relative select-none">
      {/* Welcome Banner */}
      <div className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden border border-white/5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Heart className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Ecosystem Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Welcome back, {user?.name}. You are logged in as a{' '}
              <strong className="text-brand-400 font-semibold">{user?.hasPet ? 'Pet Owner' : 'Community Volunteer'}</strong>.
            </p>
          </div>
        </div>

        {/* EMERGENCY CONTACT TRIGGER BUTTON */}
        <button
          onClick={() => setEmergencyOpen(true)}
          className="relative z-10 shrink-0 flex items-center gap-2 p-1.5 px-5 py-3 rounded-2xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 animate-pulse hover:animate-none shrink-0"
        >
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>Emergency Assistance</span>
        </button>
      </div>

      {/* CONDITIONAL ECOSYSTEM DASHBOARD CONTENT */}
      {user?.hasPet === true ? (
        // ==========================================
        //         PET OWNERecosystem VIEW
        // ==========================================
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Pet List (Left 2 columns) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                My Pets
                <span className="text-xs bg-brand-500/10 border border-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-bold">
                  {pets.length} Card{pets.length !== 1 ? 's' : ''}
                </span>
              </h2>
              
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 p-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-500 hover:bg-brand-400 shadow-md shadow-brand-500/10 hover:shadow-brand-500/25 transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                <Plus className="w-4 h-4" />
                Add Pet
              </button>
            </div>

            {loading ? (
              <div className="glass rounded-3xl p-16 flex items-center justify-center border border-white/5">
                <Spinner />
              </div>
            ) : pets.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-600 mb-2">
                  🐾
                </div>
                <h3 className="font-bold text-slate-300 text-lg">No pet profiles loaded yet</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Start logging your pet profiles here to track vaccination records and show dynamic vet support clinics in your vicinity.
                </p>
                <button
                  onClick={openAddModal}
                  className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300 underline decoration-brand-500/30 hover:decoration-brand-500 transition-all"
                >
                  Create your first pet profile card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pets.map((pet) => (
                  <div
                    key={pet._id}
                    className="glass rounded-3xl border border-white/5 hover:border-white/10 shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Pet Header Picture */}
                    <div className="h-44 relative bg-slate-900 overflow-hidden border-b border-white/5 flex items-center justify-center">
                      {pet.image ? (
                        <img
                          src={`http://localhost:5000${pet.image}`}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl select-none">🐾</div>
                      )}
                      
                      {/* Name capsule overlay */}
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-white/10 px-3.5 py-1 rounded-xl">
                        <h4 className="font-bold text-sm text-white">{pet.name}</h4>
                        <span className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider">{pet.breed}</span>
                      </div>

                      {/* Action buttons overlay */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(pet)}
                          className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet._id)}
                          className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-rose-400 hover:text-rose-300 transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Pet Content */}
                    <div className="p-5 flex flex-col gap-4 flex-1">
                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Age</p>
                          <p className="text-xs font-semibold text-slate-300 mt-0.5">{pet.age} year{pet.age !== 1 ? 's' : ''} old</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Health Index</p>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                            Stable
                          </span>
                        </div>
                      </div>

                      {/* Vaccination log */}
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Vaccination Schedule</p>
                        <p className="text-xs text-slate-400 leading-relaxed truncate-2-lines">
                          {pet.vaccinationDetails || 'No vaccination history logged yet.'}
                        </p>
                      </div>

                      {/* Medical History */}
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Medical Log</p>
                        <p className="text-xs text-slate-400 leading-relaxed truncate-2-lines">
                          {pet.medicalHistory || 'No recent clinical history recorded.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Support Column (Right column) */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-200">Owner Quick Actions</h2>
            
            <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-4">
              {/* Report Issue shortcut */}
              <div
                onClick={() => navigate('/report-issue')}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm group-hover:text-brand-400 transition-colors">Report Stray Issue</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Alert local corporations about injured strays</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-all duration-300 transform group-hover:translate-x-1" />
              </div>

              {/* Nearby Help Map shortcut */}
              <div
                onClick={() => navigate('/nearby-help')}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm group-hover:text-brand-400 transition-colors">Locate Nearby Help</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Plot vets, salons and accessory centers on map</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-all duration-300 transform group-hover:translate-x-1" />
              </div>

              {/* My reports shortcut */}
              <div
                onClick={() => navigate('/my-reports')}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm group-hover:text-brand-400 transition-colors">My Rescue Reports</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Track your submitted strays incident logs</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-all duration-300 transform group-hover:translate-x-1" />
              </div>
            </div>
            
            {/* Pet tips card */}
            <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-3">
              <h3 className="font-bold text-sm text-slate-200">💡 Stray Care Wisdom</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you encounter an unfamiliar stray dog or cat in distress, keep a safe distance of at least 3-4 feet. Speak in soft, reassuring tones and place food/water nearby to ease anxiety before attempting rescue.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        //      CITIZEN SUPPORTER (NO PETS) VIEW
        // ==========================================
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Supporters Guide */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-200">Volunteer Control Hub</h2>
            
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col gap-6">
              <h3 className="font-extrabold text-lg text-slate-100 leading-relaxed">
                Help Us Protect Local & Wild Wildlife
              </h3>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                As a community supporter, your vigilance is our greatest rescue asset. You have full access to our community reporting tools to coordinate response operations for stray or wild animals.
              </p>
              
              {/* Shortcut buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/report-issue')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-xs text-slate-950 bg-brand-500 hover:bg-brand-400 shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Report Animal Issue
                </button>
                <button
                  onClick={() => navigate('/my-reports')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl font-bold text-xs text-slate-200 bg-white/5 hover:bg-white/10 border border-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <FileText className="w-4 h-4" />
                  View My Reports
                </button>
              </div>
            </div>

            {/* Quick tips list */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col gap-4">
              <h3 className="font-bold text-sm text-slate-200">🐾 Citizens Stray Safety Steps</h3>
              <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2.5 leading-relaxed">
                <li>Always confirm coordinates on the map accurately before submitting reports.</li>
                <li>Capture clear pictures of injuries or wild animal targets from safe parameters.</li>
                <li>Specify accurate severity ratings so priority alerts route instantly to responders.</li>
                <li>Stay close to the incident scene if possible to guide municipality dispatch.</li>
              </ul>
            </div>
          </div>

          {/* Rescue Statistics & Info */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-slate-200">Community Stats</h2>
            
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl grid grid-cols-2 gap-6">
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-3xl font-extrabold text-brand-400">100%</h4>
                <p className="text-[10px] text-slate-500 tracking-wider font-bold uppercase mt-1">Smart Alert Route</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-3xl font-extrabold text-brand-400">&lt; 15m</h4>
                <p className="text-[10px] text-slate-500 tracking-wider font-bold uppercase mt-1">Responder Dispatch</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-3xl font-extrabold text-brand-400">2,480</h4>
                <p className="text-[10px] text-slate-500 tracking-wider font-bold uppercase mt-1">Animals Rescued</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="text-3xl font-extrabold text-brand-400">92%</h4>
                <p className="text-[10px] text-slate-500 tracking-wider font-bold uppercase mt-1">Resolution Rate</p>
              </div>
            </div>

            {/* Platform summary */}
            <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Your Reports Make a Difference</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  Every issue report logged immediately triggers geographic calculations matching local municipalities, forestry rangers, or veterinary centers. By keeping a lookout, you actively save stray animal lives daily.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
      //    EMERGENCY OVERLAY DRAWER MODAL
      // ========================================== */}
      {emergencyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-lg glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2 text-rose-500 font-extrabold text-lg">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>Emergency Hotlines Drawer</span>
              </div>
              <button
                onClick={() => setEmergencyOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If an animal is in critical danger (severe bleeding, active abuse, or wild animal attack), dial our responding bodies immediately:
            </p>

            {/* Numbers Grid */}
            <div className="flex flex-col gap-3">
              {/* Fire Force */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                    <Flame className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Rescue Requests / Fire Force</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Physical extractions & entrapments</p>
                  </div>
                </div>
                <a
                  href="tel:911"
                  className="flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  Dial 911
                </a>
              </div>

              {/* Vets */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Heart className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Veterinary Emergency Hospital</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Critical trauma & emergency clinical care</p>
                  </div>
                </div>
                <a
                  href="tel:+14155660540"
                  className="flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  Call Clinic
                </a>
              </div>

              {/* Forestry */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <TreePine className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">Wildlife Control / Forest Rangers</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dangerous wild animal sightings & intrusions</p>
                  </div>
                </div>
                <a
                  href="tel:18005550900"
                  className="flex items-center gap-1 text-xs font-extrabold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  Call Patrol
                </a>
              </div>
            </div>
            
            {/* Info warning */}
            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              * By dialing, you confirm that you will submit a formal incident log in PawLink afterwards to help us track local stray histories.
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
      //    PET PROFILE ADD/EDIT MODAL
      // ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto select-none">
          <div className="w-full max-w-xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                🐾 {editMode ? 'Edit Pet Profile Card' : 'Add New Pet Profile Card'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePetSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pet Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Pet Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bella"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                  />
                </div>

                {/* Breed */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Breed
                  </label>
                  <input
                    type="text"
                    required
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Golden Retriever"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
                  />
                </div>

                {/* Photo Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Pet Image
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 bg-slate-900 border border-white/10 hover:border-brand-500 focus-within:border-brand-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-sm font-semibold">
                      <Upload className="w-4 h-4 text-brand-400 shrink-0" />
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
              </div>

              {/* Vaccines */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Vaccination Details
                </label>
                <textarea
                  value={vaccines}
                  onChange={(e) => setVaccines(e.target.value)}
                  placeholder="e.g. Rabies vaccine administered on 02/05/2026, DHPP due next month"
                  rows="3"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm resize-none"
                />
              </div>

              {/* Medical History */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Medical History
                </label>
                <textarea
                  value={medical}
                  onChange={(e) => setMedical(e.target.value)}
                  placeholder="e.g. Recovered from minor skin allergy in early 2026. No active prescriptions."
                  rows="3"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              >
                {editMode ? 'Save Pet Details' : 'Register Pet Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
