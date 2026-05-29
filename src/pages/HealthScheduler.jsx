import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Activity, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  Bell,
  Heart
} from 'lucide-react';

const HealthScheduler = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [reminders, setReminders] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [petName, setPetName] = useState('');
  const [type, setType] = useState('Vaccination');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [vetName, setVetName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPets = async () => {
    try {
      const res = await API.get('/pets');
      if (res.data.success) {
        setPets(res.data.pets);
        if (res.data.pets.length > 0) {
          setPetName(res.data.pets[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await API.get('/scheduler');
      if (res.data.success) {
        setReminders(res.data.reminders);
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading scheduler timeline', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
    fetchReminders();
  }, []);

  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    if (!petName || !type || !title || !dueDate) {
      addToast('Please fill out all required fields', 'warning', 3000);
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/scheduler', {
        petName,
        type,
        title,
        dueDate,
        vetName,
        notes
      });

      if (res.data.success) {
        addToast('Reminder scheduled successfully! 💉', 'success', 3000);
        setModalOpen(false);
        // Clear
        setTitle('');
        setVetName('');
        setNotes('');
        setDueDate('');
        fetchReminders();
      }
    } catch (err) {
      addToast('Error scheduling reminder', 'error', 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (reminderId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await API.put(`/scheduler/${reminderId}`, { reminderStatus: nextStatus });
      if (res.data.success) {
        addToast(`Reminder marked as ${nextStatus}!`, 'success', 3000);
        fetchReminders();
      }
    } catch (err) {
      addToast('Error updating status', 'error', 3000);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (confirm('Are you sure you want to remove this reminder?')) {
      try {
        const res = await API.delete(`/scheduler/${reminderId}`);
        if (res.data.success) {
          addToast('Reminder removed', 'success', 3000);
          fetchReminders();
        }
      } catch (err) {
        addToast('Error deleting reminder', 'error', 3000);
      }
    }
  };

  // Group alerts
  const upcomingReminders = reminders.filter(r => r.reminderStatus === 'Pending');
  const overdueReminders = reminders.filter(r => r.reminderStatus === 'Overdue');
  const completedReminders = reminders.filter(r => r.reminderStatus === 'Completed');

  const getTypeColor = (type) => {
    switch (type) {
      case 'Vaccination': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medicine': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Vet Appointment': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/20'; // Feeding
    }
  };

  return (
    <div className="flex flex-col gap-6 relative select-none">
      {/* Header */}
      <div className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden border border-white/5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Pet Health Scheduler
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Track vaccinations, veterinary appointments, feeding times, and custom clinical medicines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="relative z-10 flex items-center gap-2 p-1.5 px-5 py-3 rounded-2xl font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Alerts Row */}
      {(overdueReminders.length > 0 || upcomingReminders.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueReminders.length > 0 && (
            <div className="glass rounded-2xl border border-rose-500/20 p-4 bg-rose-500/5 flex gap-3 items-start animate-pulse">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-400">Overdue Reminders ({overdueReminders.length})</h4>
                <p className="text-xs text-rose-300 mt-1">
                  You have pending schedules that require immediate attention: {overdueReminders.map(r => r.title).join(', ')}.
                </p>
              </div>
            </div>
          )}

          {upcomingReminders.length > 0 && (
            <div className="glass rounded-2xl border border-amber-500/20 p-4 bg-amber-500/5 flex gap-3 items-start">
              <Bell className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-400">Upcoming Schedule Tasks</h4>
                <p className="text-xs text-amber-300 mt-1">
                  Next scheduled event: <strong>{upcomingReminders[0].title}</strong> for {upcomingReminders[0].petName} on {new Date(upcomingReminders[0].dueDate).toLocaleDateString()}.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Layout Columns (Timeline left, statistics / pet profiles right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timeline (Left 3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <span>Health & Vaccination Timeline</span>
          </h2>

          {loading && reminders.length === 0 ? (
            <div className="glass rounded-3xl p-16 flex items-center justify-center border border-white/5">
              <Spinner />
            </div>
          ) : reminders.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center gap-3">
              <div className="text-5xl mb-2">🗓️</div>
              <h3 className="font-bold text-slate-300 text-lg">No reminders scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Add a vaccination reminder or vet checkup to populate this interactive timeline.
              </p>
            </div>
          ) : (
            <div className="relative border-l border-white/10 pl-6 ml-4 flex flex-col gap-6">
              {reminders.map((reminder) => (
                <div key={reminder._id} className="relative">
                  {/* Timeline step dot indicator */}
                  <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-slate-950 ${
                    reminder.reminderStatus === 'Completed' ? 'bg-emerald-500' :
                    reminder.reminderStatus === 'Overdue' ? 'bg-rose-500 animate-ping' :
                    'bg-amber-500'
                  }`} />

                  {/* Reminder Card */}
                  <div className="glass rounded-2xl border border-white/5 p-4 flex justify-between gap-4 items-start hover:border-white/10 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getTypeColor(reminder.type)}`}>
                          {reminder.type}
                        </span>

                        <span className="text-[10px] text-slate-500 font-bold uppercase">
                          Pet: {reminder.petName}
                        </span>
                      </div>

                      <h3 className={`font-bold text-slate-200 mt-2 text-sm md:text-base leading-tight ${
                        reminder.reminderStatus === 'Completed' ? 'line-through text-slate-500' : ''
                      }`}>
                        {reminder.title}
                      </h3>

                      {reminder.vetName && (
                        <p className="text-xs text-slate-400 mt-1 leading-normal font-medium">
                          <strong>Vet:</strong> {reminder.vetName}
                        </p>
                      )}

                      {reminder.notes && (
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed italic">
                          "{reminder.notes}"
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due: {new Date(reminder.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleComplete(reminder._id, reminder.reminderStatus)}
                        className={`p-2 rounded-xl border border-white/5 transition-all ${
                          reminder.reminderStatus === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                        title={reminder.reminderStatus === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="p-2 rounded-xl bg-white/5 border border-white/5 text-rose-400 hover:text-rose-300 transition-colors"
                        title="Delete reminder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics & Guides (Right 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-200">Scheduled Stats</h2>
          
          <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
              <span className="text-slate-400 font-bold uppercase tracking-wide">Pending Reminders</span>
              <span className="text-brand-400 font-bold bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                {upcomingReminders.length} tasks
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-3">
              <span className="text-slate-400 font-bold uppercase tracking-wide">Overdue Items</span>
              <span className="text-rose-400 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                {overdueReminders.length} tasks
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wide">Completed Logs</span>
              <span className="text-slate-400 font-bold bg-slate-800 px-2.5 py-0.5 rounded-full border border-white/5">
                {completedReminders.length} tasks
              </span>
            </div>
          </div>

          <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm">Vaccines matter!</h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Keep vaccines like DHPP (parvovirus) and Rabies up-to-date. Tracking them properly avoids vet emergency consults and secures your pet's life indices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
      //    CREATE REMINDER MODAL
      // ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                💉 Schedule Reminder
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReminderSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Pet */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Select Target Pet
                  </label>
                  {pets.length > 0 ? (
                    <select
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                    >
                      {pets.map((p) => (
                        <option key={p._id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="e.g. Bella"
                      className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                    />
                  )}
                </div>

                {/* Reminder Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Reminder Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                  >
                    <option value="Vaccination">Vaccination 💉</option>
                    <option value="Medicine">Medicine 💊</option>
                    <option value="Vet Appointment">Vet Appointment 🗓️</option>
                    <option value="Feeding">Feeding Schedule 🍖</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Reminder Title / Detail
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Parvovirus Vaccine Dose 2"
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Due Date & Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Vet Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Vet Clinic / Doctor Name (Optional)
                </label>
                <input
                  type="text"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Miller (Mission District Vet)"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Reminder Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Remember to carry vaccination booklet and checkup cards."
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
                {submitting ? 'Scheduling...' : 'Set Reminder Schedule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthScheduler;
