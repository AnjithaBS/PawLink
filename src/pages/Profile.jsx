import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Calendar,
  ToggleLeft,
  ToggleRight,
  Heart,
  AlertCircle
} from 'lucide-react';

const Profile = () => {
  const { user, updatePetPreference } = useAuth();
  const { addToast } = useToast();
  const [updating, setUpdating] = useState(false);

  const togglePetPreference = async () => {
    setUpdating(true);
    const newPreference = !user?.hasPet;
    const res = await updatePetPreference(newPreference);
    setUpdating(false);

    if (res.success) {
      addToast(
        `Ecosystem profile updated! ${
          newPreference 
            ? 'Pet Owner options are now unlocked. 🐾' 
            : 'Community volunteer profile active. 💚'
        }`,
        'success',
        4000
      );
    } else {
      addToast(res.message, 'error', 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal account credentials and ecosystem workspace modes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Left */}
        <div className="lg:col-span-1 glass rounded-3xl p-6 border border-white/5 flex flex-col items-center text-center shadow-xl">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center font-bold text-slate-950 text-4xl uppercase shadow-2xl mb-4">
            {user?.name?.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-slate-100">{user?.name}</h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-2 text-brand-300 bg-brand-500/10 border border-brand-500/20 uppercase tracking-wider">
            {user?.role} Account
          </span>
          <p className="text-xs text-slate-500 mt-6 leading-relaxed">
            Member of PawLink's community network to protect stray and domestic animals since{' '}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}.
          </p>
        </div>

        {/* Configurations Right */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Details Capsule */}
          <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-slate-200 border-b border-white/5 pb-3">
              Account Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Full Name</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Email Address</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <ShieldAlert className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Account Role</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Date Joined</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'May 2026'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Settings */}
          <div className="glass rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col gap-4">
            <h3 className="font-bold text-slate-200 border-b border-white/5 pb-3">
              Workspace Settings
            </h3>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                  <Heart className="w-5 h-5 fill-brand-400/20" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Pet Owner Ecosystem Mode</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                    Unlocks nearby veterinarian support, pet clinics locator map, grooming spas, food outlets, accessory shops, and custom pet health logging cards.
                  </p>
                </div>
              </div>

              <button
                disabled={updating}
                onClick={togglePetPreference}
                className="shrink-0 flex items-center gap-2 p-1 px-3.5 py-2 rounded-xl border transition-all duration-300 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10"
              >
                {user?.hasPet ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-brand-400 shrink-0" />
                    <span className="text-brand-400">Owner Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-slate-500 shrink-0" />
                    <span className="text-slate-400">Citizen Active</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Info warning */}
            <div className="flex gap-2.5 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10 mt-2">
              <AlertCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-brand-300 leading-relaxed">
                Toggling this preference changes your side navigation panel in real-time, enabling or disabling the "Nearby Help" and "Pet Cards" features to suit your current context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
