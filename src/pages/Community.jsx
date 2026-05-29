import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import API from '../services/api.js';
import Spinner from '../components/Spinner.jsx';
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Users, 
  Share2, 
  BookOpen, 
  Flame, 
  Compass,
  X 
} from 'lucide-react';

const Community = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // New Post Form
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('general');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comments toggles by post ID
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/community');
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Error fetching feed:', err.message);
      addToast('Failed to load community feed', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!caption) {
      addToast('Please write a caption/story details', 'warning', 3000);
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('postType', postType);
    if (photoFile) {
      formData.append('image', photoFile);
    }

    try {
      const res = await API.post('/community', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        addToast('Post shared with the community! 🐾', 'success', 3000);
        setCaption('');
        setPostType('general');
        setPhotoFile(null);
        setPhotoPreview('');
        setModalOpen(false);
        fetchPosts();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error publishing post';
      addToast(errMsg, 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await API.put(`/community/${postId}/like`);
      if (res.data.success) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return { ...post, likes: res.data.likes };
          }
          return post;
        }));
      }
    } catch (err) {
      addToast('Error liking post', 'error', 3000);
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const res = await API.post(`/community/${postId}/comment`, { text: commentText });
      if (res.data.success) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return { ...post, comments: res.data.comments };
          }
          return post;
        }));
        setCommentText('');
      }
    } catch (err) {
      addToast('Error posting comment', 'error', 3000);
    }
  };

  const handleDeletePost = async (postId) => {
    if (confirm('Delete this community post permanently?')) {
      try {
        const res = await API.delete(`/community/${postId}`);
        if (res.data.success) {
          addToast('Post deleted', 'success', 3000);
          fetchPosts();
        }
      } catch (err) {
        addToast('Error deleting post', 'error', 3000);
      }
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'rescue_story':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'care_tip':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'experience':
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getPostTypeLabel = (type) => {
    switch (type) {
      case 'rescue_story': return 'Rescue Story';
      case 'care_tip': return 'Care Tip';
      case 'experience': return 'Experience';
      default: return 'General Post';
    }
  };

  return (
    <div className="flex flex-col gap-6 relative select-none">
      {/* Header section */}
      <div className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden border border-white/5 shadow-xl flex flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Pet Community Feed
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Connect with pet owners and rescuers. Share tips, emergency stories, and pet photos!
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="relative z-10 flex items-center gap-2 p-1.5 px-5 py-3 rounded-2xl font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-lg shadow-brand-500/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>New Post</span>
        </button>
      </div>

      {loading && posts.length === 0 ? (
        <div className="glass rounded-3xl p-16 flex items-center justify-center border border-white/5">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center gap-3">
          <div className="text-5xl mb-2">📣</div>
          <h3 className="font-bold text-slate-300 text-lg">No community posts yet</h3>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Be the first to share a post, care tip, or rescue experience with the community!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300 underline"
          >
            Share something now
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
          {posts.map((post) => (
            <div 
              key={post._id}
              className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-white/10"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center font-bold text-slate-950 uppercase shadow-md">
                    {post.author?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm leading-tight">{post.author?.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                        {post.author?.role}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    post.postType === 'rescue_story' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400' :
                    post.postType === 'care_tip' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                    post.postType === 'experience' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' :
                    'bg-slate-500/10 border border-slate-500/20 text-slate-400'
                  }`}>
                    {getPostTypeIcon(post.postType)}
                    {getPostTypeLabel(post.postType)}
                  </span>

                  {(post.author?._id === user?.id || user?.role === 'admin') && (
                    <button 
                      onClick={() => handleDeletePost(post._id)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="w-full bg-slate-900 border-b border-white/5 max-h-[450px] overflow-hidden flex items-center justify-center">
                  <img 
                    src={`http://localhost:5000${post.image}`} 
                    alt="Post attachment" 
                    className="w-full h-auto max-h-[450px] object-cover"
                  />
                </div>
              )}

              {/* Caption & content */}
              <div className="p-5 flex flex-col gap-4">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.caption}
                </p>

                {/* Interactions Row */}
                <div className="flex items-center gap-6 border-t border-white/5 pt-4 mt-1">
                  <button 
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 ${
                      post.likes?.includes(user?.id) 
                        ? 'text-rose-500 animate-pulse-once' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.likes?.includes(user?.id) ? 'fill-rose-500' : ''}`} />
                    <span>{post.likes?.length || 0} Likes</span>
                  </button>

                  <button 
                    onClick={() => setOpenCommentsPostId(openCommentsPostId === post._id ? null : post._id)}
                    className={`flex items-center gap-2 text-xs font-bold hover:text-slate-200 transition-colors ${
                      openCommentsPostId === post._id ? 'text-brand-400' : 'text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </button>

                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 ml-auto cursor-default">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Comments drawer */}
              {openCommentsPostId === post._id && (
                <div className="border-t border-white/5 bg-slate-900/30 p-4 flex flex-col gap-4">
                  {/* Comments list */}
                  <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment, index) => (
                        <div key={index} className="flex gap-2.5 items-start p-2 rounded-xl bg-white/[0.02] border border-white/5">
                          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-brand-300 uppercase shrink-0">
                            {comment.user?.name?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                              <span className="text-xs font-bold text-slate-300">{comment.user?.name}</span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-2">No comments yet. Start the conversation!</p>
                    )}
                  </div>

                  {/* Add comment form */}
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 bg-slate-950 border border-white/10 focus:border-brand-500 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500/20 text-xs"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(post._id); }}
                    />
                    <button 
                      onClick={() => handleCommentSubmit(post._id)}
                      className="bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
      //    CREATE POST MODAL
      // ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                ✍️ Share a Post
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="flex flex-col gap-4">
              {/* Type Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Post Category
                </label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
                >
                  <option value="general">General Community Post</option>
                  <option value="rescue_story">Rescue Story 🚨</option>
                  <option value="care_tip">Care Wisdom / Tip 💡</option>
                  <option value="experience">Pet Experience 🐾</option>
                </select>
              </div>

              {/* Caption */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Story details / Caption
                </label>
                <textarea
                  required
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tell the community about your rescue story, care tip, or upload a cute pet photo..."
                  rows="4"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Upload Photo (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 bg-slate-900 border border-white/10 hover:border-brand-500 focus-within:border-brand-500 rounded-xl py-3 px-4 flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition-all cursor-pointer text-sm font-semibold">
                    <Upload className="w-4 h-4 text-brand-400" />
                    <span>{photoFile ? 'Change Image' : 'Select Image'}</span>
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
                {submitting ? 'Sharing...' : 'Share to Feed'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
