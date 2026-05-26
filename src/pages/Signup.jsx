import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { PawPrint, User, Mail, Lock, UserPlus } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      addToast('Please fill out all registration fields', 'warning', 3000);
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'warning', 3000);
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match! Please re-verify.', 'error', 3000);
      return;
    }

    setSubmitting(true);
    const res = await register(name, email, password);
    setSubmitting(false);

    if (res.success) {
      addToast('Account created successfully! Welcome to PawLink.', 'success', 3500);
      navigate('/ask-preference');
    } else {
      addToast(res.message, 'error', 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in border border-white/10">
        {/* Branding header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <PawPrint className="w-6 h-6 text-slate-950 fill-slate-950 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-brand-100 to-brand-400 bg-clip-text text-transparent">
            Join PawLink
          </h2>
          <p className="text-slate-400 text-sm max-w-xs mt-1">
            Create an account to protect pets and coordinate animal community rescues
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-500 px-1 mt-0.5">
              * Note: Registering with <strong>admin@pawlink.org</strong> will auto-grant Admin access.
            </p>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 pl-11 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center text-sm">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-semibold underline decoration-brand-500/30 hover:decoration-brand-500 transition-all"
            >
              Sign in here
            </Link>
          </p>
        </div>
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

export default Signup;
