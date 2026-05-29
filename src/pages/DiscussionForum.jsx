import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  X, 
  HelpCircle, 
  Search,
  MessageCircle,
  TrendingUp,
  Clock,
  ChevronRight
} from 'lucide-react';

const DiscussionForum = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Search & Filter
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(''); // Empty means All
  const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'popular'

  // Thread Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Pet Care');
  const [submitting, setSubmitting] = useState(false);

  // Thread details modal (when user opens a thread to reply)
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');

  const categoriesList = ['Health', 'Training', 'Rescue', 'Adoption', 'Pet Care'];

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory) params.category = activeCategory;
      if (sortBy) params.sortBy = sortBy;

      const res = await API.get('/forum', { params });
      if (res.data.success) {
        setThreads(res.data.threads);
        
        // If there's an open thread modal, sync it with updated data
        if (selectedThread) {
          const fresh = res.data.threads.find(t => t._id === selectedThread._id);
          if (fresh) setSelectedThread(fresh);
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to retrieve discussions', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, [search, activeCategory, sortBy]);

  const handleThreadSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !category) {
      addToast('Please fill out all fields', 'warning', 3000);
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/forum', { title, content, category });
      if (res.data.success) {
        addToast('Discussion thread started! 💬', 'success', 3000);
        setTitle('');
        setContent('');
        setCategory('Pet Care');
        setModalOpen(false);
        fetchThreads();
      }
    } catch (err) {
      addToast('Error starting discussion', 'error', 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeThread = async (threadId) => {
    try {
      const res = await API.put(`/forum/${threadId}/like`);
      if (res.data.success) {
        setThreads(threads.map(t => {
          if (t._id === threadId) {
            return { ...t, likes: res.data.likes };
          }
          return t;
        }));
        
        // Also update details modal
        if (selectedThread && selectedThread._id === threadId) {
          setSelectedThread(prev => ({ ...prev, likes: res.data.likes }));
        }
      }
    } catch (err) {
      addToast('Error upvoting thread', 'error', 3000);
    }
  };

  const handleReplySubmit = async (threadId) => {
    if (!replyText.trim()) return;

    try {
      const res = await API.post(`/forum/${threadId}/reply`, { content: replyText });
      if (res.data.success) {
        addToast('Reply shared!', 'success', 2000);
        setReplyText('');
        fetchThreads();
      }
    } catch (err) {
      addToast('Error posting reply', 'error', 3000);
    }
  };

  const handleLikeReply = async (threadId, replyId) => {
    try {
      const res = await API.put(`/forum/${threadId}/reply/${replyId}/like`);
      if (res.data.success) {
        // Refresh details
        fetchThreads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (confirm('Are you sure you want to delete this thread permanently?')) {
      try {
        const res = await API.delete(`/forum/${threadId}`);
        if (res.data.success) {
          addToast('Discussion thread removed', 'success', 3000);
          setSelectedThread(null);
          fetchThreads();
        }
      } catch (err) {
        addToast('Error deleting thread', 'error', 3000);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 relative select-none">
      {/* Header banner */}
      <div className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden border border-white/5 shadow-xl flex flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Discussion Forum
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Ask questions, offer advice, and participate in training, health, or rescue discussions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="relative z-10 flex items-center gap-2 p-1.5 px-5 py-3 rounded-2xl font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Start Discussion</span>
        </button>
      </div>

      {/* Categories & Sorting bar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Categories Tabs */}
        <div className="lg:col-span-3 glass p-1 rounded-2xl border border-white/5 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveCategory('')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              activeCategory === ''
                ? 'bg-brand-500/20 border border-brand-500/30 text-brand-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Topics
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-all ${
                activeCategory === cat
                  ? 'bg-brand-500/20 border border-brand-500/30 text-brand-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort and search */}
        <div className="lg:col-span-2 flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions..."
              className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Sort By Toggle */}
          <div className="glass rounded-xl p-1 border border-white/5 flex">
            <button
              onClick={() => setSortBy('recent')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'recent' ? 'bg-white/5 text-slate-200' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Recent Discussions"
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                sortBy === 'popular' ? 'bg-white/5 text-slate-200' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Trending Topics"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading && threads.length === 0 ? (
        <div className="glass rounded-3xl p-16 flex items-center justify-center border border-white/5">
          <Spinner />
        </div>
      ) : threads.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center gap-3">
          <div className="text-5xl mb-2">💬</div>
          <h3 className="font-bold text-slate-300 text-lg">No discussions found</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Choose a different category or ask the community a question by clicking "Start Discussion"!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {threads.map((thread) => (
            <div
              key={thread._id}
              onClick={() => setSelectedThread(thread)}
              className="glass rounded-2xl border border-white/5 hover:border-brand-500/20 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all duration-300"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-brand-500/10 border border-brand-500/20 text-brand-400">
                    {thread.category}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Started by {thread.author?.name} &bull; {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-200 mt-2 text-base md:text-lg hover:text-brand-400 transition-colors leading-tight">
                  {thread.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {thread.content}
                </p>
              </div>

              {/* Stats & indicator */}
              <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                {/* Likes count */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeThread(thread._id);
                  }}
                  className={`flex flex-col items-center p-2 px-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-brand-500/20 text-xs font-bold transition-all ${
                    thread.likes?.includes(user?.id) ? 'text-rose-500 border-rose-500/20' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="mt-1">{thread.likes?.length || 0}</span>
                </button>

                {/* Replies count */}
                <div className="flex flex-col items-center text-slate-400 text-xs font-bold p-2">
                  <MessageCircle className="w-4 h-4 text-slate-500" />
                  <span className="mt-1">{thread.replies?.length || 0} replies</span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-600 hidden md:block" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
      //    CREATE THREAD MODAL
      // ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                💬 Start a New Discussion
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleThreadSubmit} className="flex flex-col gap-4">
              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Discussion Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none text-sm"
                >
                  {categoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Discussion Question / Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. What is the best diet for a rescue pup?"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Describe what you want to discuss
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide context, share your current pet experiences, or list the specific questions you need help answering..."
                  rows="4"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'Creating Thread...' : 'Start Discussion'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
      //    THREAD DETAIL & REPLIES DRAWER
      // ========================================== */}
      {selectedThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto select-none">
          <div className="w-full max-w-2xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 uppercase">
                {selectedThread.category}
              </span>
              
              <div className="flex items-center gap-2">
                {(selectedThread.author?._id === user?.id || user?.role === 'admin') && (
                  <button
                    onClick={() => handleDeleteThread(selectedThread._id)}
                    className="p-1 text-rose-400 hover:text-rose-300"
                    title="Delete Thread"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedThread(null)}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content body */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-brand-300 uppercase">
                  {selectedThread.author?.name?.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-300 block">{selectedThread.author?.name}</span>
                  <span>{new Date(selectedThread.createdAt).toLocaleDateString()} at {new Date(selectedThread.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-100 mt-2 leading-snug">{selectedThread.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 p-4 rounded-2xl whitespace-pre-wrap">
                {selectedThread.content}
              </p>

              {/* Upvote button */}
              <div className="flex items-center gap-2 pt-2 border-b border-white/5 pb-4">
                <button
                  onClick={() => handleLikeThread(selectedThread._id)}
                  className={`flex items-center gap-2 text-xs font-bold p-2 px-4 rounded-xl border border-white/5 transition-all ${
                    selectedThread.likes?.includes(user?.id) ? 'bg-rose-500/10 border-rose-500/25 text-rose-500' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote ({selectedThread.likes?.length || 0})</span>
                </button>
                <span className="text-xs text-slate-500 font-medium">{selectedThread.replies?.length || 0} Replies</span>
              </div>
            </div>

            {/* Replies section */}
            <div className="flex flex-col gap-4">
              <h3 className="font-bold text-slate-200 text-sm">Community Advice & Replies</h3>

              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                {selectedThread.replies && selectedThread.replies.length > 0 ? (
                  selectedThread.replies.map((reply) => (
                    <div key={reply._id} className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-slate-300">{reply.author?.name} ({reply.author?.role})</span>
                        <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{reply.content}</p>

                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-white/5">
                        <button
                          onClick={() => handleLikeReply(selectedThread._id, reply._id)}
                          className={`flex items-center gap-1.5 text-[10px] font-bold ${
                            reply.likes?.includes(user?.id) ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{reply.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">No replies yet. Be the first to share advice!</p>
                )}
              </div>

              {/* Post Reply Box */}
              <div className="flex gap-2 border-t border-white/5 pt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Share your advice or reply here..."
                  rows="2"
                  className="flex-1 bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
                />
                <button
                  onClick={() => handleReplySubmit(selectedThread._id)}
                  className="bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0 self-end"
                >
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;
