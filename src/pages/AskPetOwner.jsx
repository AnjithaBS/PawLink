import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PawPrint, Heart, Eye, ArrowRight, ShieldAlert } from 'lucide-react';

const AskPetOwner = () => {
  const [updating, setUpdating] = useState(false);
  const { updatePetPreference, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSelection = async (hasPet) => {
    setUpdating(true);
    const res = await updatePetPreference(hasPet);
    setUpdating(false);

    if (res.success) {
      if (hasPet) {
        addToast('Welcome to the Pet Owner Support Ecosystem! 🐾', 'success', 4000);
      } else {
        addToast('Thank you for supporting community animal welfare! 💚', 'success', 4000);
      }
      navigate('/');
    } else {
      addToast(res.message, 'error', 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-2xl glass rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 animate-fade-in border border-white/10 text-center">
        {/* Welcome header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <PawPrint className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-brand-100 to-brand-400 bg-clip-text text-transparent">
            Welcome to PawLink, {user?.name}!
          </h2>
          <p className="text-slate-400 text-sm max-w-md mt-1 leading-relaxed">
            Let's customize your platform experience. Please answer the questionnaire below:
          </p>
        </div>

        {/* Core Question */}
        <h3 className="text-xl md:text-2xl font-bold text-slate-200 mb-8">
          Do you have pets?
        </h3>

        {/* Options grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* OPTION 1: YES */}
          <button
            onClick={() => handleSelection(true)}
            disabled={updating}
            className="group glass hover:bg-brand-500/10 border border-white/5 hover:border-brand-500/30 rounded-2xl p-6 flex flex-col items-center gap-4 text-center transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-full bg-brand-500/10 group-hover:bg-brand-500/20 flex items-center justify-center text-brand-400 transition-colors">
              <Heart className="w-7 h-7 fill-brand-400/20 group-hover:fill-brand-400/30" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-100 mb-1 group-hover:text-brand-400 transition-colors">
                Yes, I have pets
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add and manage your pet logs, track vaccination records, find nearby grooming, stores, and vets.
              </p>
            </div>
            <span className="mt-auto text-xs font-semibold text-brand-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Configure Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* OPTION 2: NO */}
          <button
            onClick={() => handleSelection(false)}
            disabled={updating}
            className="group glass hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 rounded-2xl p-6 flex flex-col items-center gap-4 text-center transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 flex items-center justify-center text-sky-400 transition-colors">
              <Eye className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-100 mb-1 group-hover:text-sky-400 transition-colors">
                No, I do not have pets
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                File incident reports, track injured or stray animals, coordinate rescue requests and wild animal sightings.
              </p>
            </div>
            <span className="mt-auto text-xs font-semibold text-sky-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Community Support
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        {/* Subtitle assurance */}
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-slate-600" />
          You can toggle or change this preference at any time from your Profile panel.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AskPetOwner;
