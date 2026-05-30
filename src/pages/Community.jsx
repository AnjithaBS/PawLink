import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  AlertCircle,
  MapPin,
  Sparkles,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Smile,
  Info
} from 'lucide-react';

const Community = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

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

  // Story state with LocalStorage persistence
  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('pawlink_stories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stories:', e);
      }
    }
    return [
      { id: '1', name: 'Luna', emoji: '🐶', color: 'border-sky-400', glow: 'shadow-[0_0_15px_rgba(56,189,248,0.25)]', text: 'Luna learned to fetch her leash today! Ready for walkies anytime. 🐾', author: 'Sarah Jenkins', time: '2h ago' },
      { id: '2', name: 'Milo', emoji: '🐱', color: 'border-purple-400', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.25)]', text: 'Sunbeam tracking: 95% complete. nap mode: fully engaged. ☀️', author: 'Alex Rivera', time: '4h ago' },
      { id: '3', name: 'Rocky', emoji: '🐹', color: 'border-amber-400', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.25)]', text: 'Rocky is speed! Clocked 3.4 miles on the wheel tonight. 🐹⚡', author: 'David Chen', time: '6h ago' },
      { id: '4', name: 'Bella', emoji: '🐰', color: 'border-emerald-400', glow: 'shadow-[0_0_15px_rgba(110,231,183,0.25)]', text: 'Organic mint leaf snack time. Crunch crunch! 🐰🍃', author: 'Emma Watson', time: '8h ago' },
      { id: '5', name: 'Daisy', emoji: '🦊', color: 'border-rose-400', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]', text: 'Welcomed a stray kitten into our home. They are already best friends! 🐈❤️', author: 'Chris Evans', time: '10h ago' },
      { id: '6', name: 'Coco', emoji: '🦜', color: 'border-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.25)]', text: 'Coco copy-pasted my laugh today. Now the house laughs at everything! 🦜😂', author: 'Mia Thorne', time: '12h ago' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('pawlink_stories', JSON.stringify(stories));
  }, [stories]);

  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyPetName, setStoryPetName] = useState('');
  const [storyPetEmoji, setStoryPetEmoji] = useState('🐶');
  const [storyGlowColor, setStoryGlowColor] = useState('sky');
  const [storyText, setStoryText] = useState('');
  const [activeStory, setActiveStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);

  // Filter tag
  const [selectedTag, setSelectedTag] = useState(null);

  // Tip of the Day index
  const [tipIndex, setTipIndex] = useState(0);

  // Adoption available widget listings
  const [adoptions, setAdoptions] = useState([]);

  const storyColorMap = {
    sky: { color: 'border-sky-400', glow: 'shadow-[0_0_15px_rgba(56,189,248,0.25)] hover:border-sky-300' },
    purple: { color: 'border-purple-400', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.25)] hover:border-purple-300' },
    orange: { color: 'border-amber-400', glow: 'shadow-[0_0_15px_rgba(251,191,36,0.25)] hover:border-amber-300' },
    mint: { color: 'border-emerald-400', glow: 'shadow-[0_0_15px_rgba(110,231,183,0.25)] hover:border-emerald-300' },
    rose: { color: 'border-rose-400', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)] hover:border-rose-300' },
    yellow: { color: 'border-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.25)] hover:border-yellow-300' }
  };

  const PET_TIPS = [
    { text: "Keep water bowls away from cat food! Cats prefer water far from their food source because in the wild, prey can contaminate drinking water.", category: "Cat Care" },
    { text: "Chocolate, grapes, onions, garlic, and raisins are highly toxic to dogs. Keep them out of reach!", category: "Dog Care" },
    { text: "Rabbits need unlimited fresh grass hay (like Timothy hay) every day to keep their digestive systems working properly.", category: "Rabbit Care" },
    { text: "Birds have extremely sensitive respiratory systems. Avoid using non-stick Teflon pans or aerosols around them.", category: "Bird Care" },
    { text: "Hamsters are nocturnal and need large wheels (at least 8-11 inches) to avoid curved backs while running.", category: "Hamster Care" },
    { text: "Microchip your pets! Collars can break or fall off, but a microchip is a permanent form of identification.", category: "General Tip" }
  ];

  const RESCUE_ALERTS = [
    { id: 1, pet: "Rocky (Ginger Cat)", issue: "Severe leg fracture", loc: "Sector 4 Area", time: "2m ago", status: "Responding", glow: "border-orange-500/20 text-orange-400 bg-orange-500/10" },
    { id: 2, pet: "Senior Golden Retriever", issue: "Lost/No Collar", loc: "Lake View Park", time: "15m ago", status: "Patrol Dispatched", glow: "border-sky-500/20 text-sky-400 bg-sky-500/10" },
    { id: 3, pet: "Abandoned Puppies (3)", issue: "Left in a box", loc: "Highway 9 Bridge", time: "1h ago", status: "Shelter Team Route", glow: "border-rose-500/20 text-rose-400 bg-rose-500/10" }
  ];

  const handleNextStory = () => {
    setActiveStory(prev => {
      if (!prev) return null;
      const currentIndex = stories.findIndex(s => s.id === prev.id);
      if (currentIndex < stories.length - 1) {
        return stories[currentIndex + 1];
      } else {
        return null;
      }
    });
  };

  const handlePrevStory = () => {
    setActiveStory(prev => {
      if (!prev) return null;
      const currentIndex = stories.findIndex(s => s.id === prev.id);
      if (currentIndex > 0) {
        return stories[currentIndex - 1];
      } else {
        return null;
      }
    });
  };

  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }
    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [activeStory?.id]);

  const handleStorySubmit = (e) => {
    e.preventDefault();
    if (!storyPetName.trim()) {
      addToast('Please enter a pet name', 'warning', 3000);
      return;
    }
    if (!storyText.trim()) {
      addToast('Please write a pet story update', 'warning', 3000);
      return;
    }

    const colorConfig = storyColorMap[storyGlowColor] || storyColorMap.sky;

    const newStory = {
      id: Date.now().toString(),
      name: storyPetName.trim(),
      emoji: storyPetEmoji,
      color: colorConfig.color,
      glow: colorConfig.glow,
      text: storyText.trim(),
      author: user?.name || 'Pet Owner',
      time: 'Just now'
    };

    setStories([newStory, ...stories]);
    addToast(`${storyPetName}'s story shared! 🐾`, 'success', 3000);
    
    // Reset Form
    setStoryPetName('');
    setStoryText('');
    setStoryPetEmoji('🐶');
    setStoryGlowColor('sky');
    setStoryModalOpen(false);
  };

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

  const fetchAdoptions = async () => {
    try {
      const res = await API.get('/adoption', { params: { status: 'Available' } });
      if (res.data.success) {
        setAdoptions(res.data.listings.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching adoptions in community page:', err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchAdoptions();
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

  const filteredPosts = selectedTag 
    ? posts.filter(post => {
        if (selectedTag === '#RescueStories') return post.postType === 'rescue_story';
        if (selectedTag === '#CareTips') return post.postType === 'care_tip';
        if (selectedTag === '#PetExperiences') return post.postType === 'experience';
        if (selectedTag === '#GeneralPosts') return post.postType === 'general';
        return true;
      })
    : posts;
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

      {/* Main Dual-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Story Carousel + Feed (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 w-full">
          
          {/* Pet Stories Carousel */}
          <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Recent Pet Stories</h3>
              <button 
                onClick={() => setStoryModalOpen(true)}
                className="text-[10px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Story</span>
              </button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
              {/* Add Story Button in carousel */}
              <div 
                onClick={() => setStoryModalOpen(true)}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-start group"
              >
                <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-slate-700 hover:border-brand-400 flex items-center justify-center bg-slate-900/50 hover:bg-slate-900 transition-all duration-300 transform group-hover:scale-105">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-brand-400 group-hover:rotate-90 transition-all duration-300" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-400 transition-colors">Add Story</span>
              </div>

              {/* Stories Render */}
              {stories.map((story) => (
                <div 
                  key={story.id}
                  onClick={() => {
                    setActiveStory(story);
                    setStoryProgress(0);
                  }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 snap-start group"
                >
                  <div className={`relative w-16 h-16 rounded-full border-2 ${story.color} p-0.5 flex items-center justify-center bg-slate-900 ${story.glow} transition-all duration-300 transform group-hover:scale-105`}>
                    <span className="absolute inset-0.5 rounded-full border border-white/5 animate-pulse" />
                    <div className="w-full h-full rounded-full bg-[#1E293B] flex items-center justify-center text-2xl select-none">
                      {story.emoji}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 group-hover:text-brand-400 transition-colors">
                    {story.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Tag Notification Bar */}
          {selectedTag && (
            <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold animate-fade-in shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
                <span>Showing posts categorised as: <span className="underline">{selectedTag.replace('#', '')}</span></span>
              </div>
              <button 
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-1 p-1 px-2.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 transition-colors text-[10px]"
              >
                <span>Clear Filter</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Feed Posts */}
          {loading && posts.length === 0 ? (
            <div className="glass rounded-3xl p-16 flex items-center justify-center border border-white/5">
              <Spinner />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center border border-white/5 flex flex-col items-center gap-3">
              <div className="text-5xl mb-2">📣</div>
              <h3 className="font-bold text-slate-300 text-lg">No community posts found</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {selectedTag 
                  ? `No posts found under the ${selectedTag} category yet. Create one or try a different filter!`
                  : "Be the first to share a post, care tip, or rescue experience with the community!"}
              </p>
              <button
                onClick={() => {
                  if (selectedTag) setSelectedTag(null);
                  else setModalOpen(true);
                }}
                className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300 underline"
              >
                {selectedTag ? "View all posts" : "Share something now"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              {filteredPosts.map((post) => (
                <div 
                  key={post._id}
                  className="glass rounded-3xl border border-white/5 shadow-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-white/10 hover-tilt-lift"
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

                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/community`);
                          addToast('Link copied to clipboard! 🐾', 'success', 2000);
                        }}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 ml-auto transition-colors"
                      >
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
        </div>

        {/* Right Column: Sticky Sidebar Widgets (4 cols) */}
        <div className="lg:col-span-4 hidden lg:flex flex-col gap-6 w-full sticky top-24">
          
          {/* Adoption Available List */}
          <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-4 relative overflow-hidden bg-gradient-to-br from-slate-900/40 via-slate-900/50 to-purple-500/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-200 text-sm tracking-tight">Available for Adoption</h3>
                  <p className="text-[10px] text-slate-500">Find them a forever home</p>
                </div>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {adoptions.length > 0 ? (
                adoptions.map(listing => (
                  <div 
                    key={listing._id}
                    onClick={() => {
                      addToast(`Viewing ${listing.breed} details... 🏡`, 'info', 2000);
                      navigate('/adoption');
                    }}
                    className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-3 hover:border-purple-500/25 hover:bg-purple-500/[0.02] transition-all duration-300 cursor-pointer items-center"
                  >
                    {listing.image ? (
                      <img 
                        src={`http://localhost:5000${listing.image}`} 
                        alt={listing.breed} 
                        className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl shrink-0">
                        🐾
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-200 truncate">{listing.breed}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{listing.location}</p>
                      <span className="text-[8px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                        {listing.age} Year{listing.age !== 1 ? 's' : ''} old
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                // Fallbacks/Mocks so it's always filled
                [
                  { id: 'mock1', name: 'Bella', breed: 'Golden Retriever Mix', age: '1', loc: 'Oak Park', emoji: '🐶' },
                  { id: 'mock2', name: 'Oliver', breed: 'Siamese Tabby Kitten', age: '0.5', loc: 'Sector 4 Area', emoji: '🐱' },
                  { id: 'mock3', name: 'Pip', breed: 'Green Parakeet / Budgie', age: '1', loc: 'Downtown', emoji: '🦜' }
                ].map(pet => (
                  <div 
                    key={pet.id}
                    onClick={() => {
                      addToast(`Viewing ${pet.name} details... 🏡`, 'info', 2000);
                      navigate('/adoption');
                    }}
                    className="p-3 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-3 hover:border-purple-500/25 hover:bg-purple-500/[0.02] transition-all duration-300 cursor-pointer items-center"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/10 flex items-center justify-center text-3xl shrink-0">
                      {pet.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-200 truncate">{pet.name}</h4>
                        <span className="text-[8px] text-slate-500 italic">({pet.breed})</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{pet.loc}</p>
                      <span className="text-[8px] font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {pet.age} Year{pet.age !== '1' ? 's' : ''} old
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => {
                addToast('Navigating to Adoption Corner... 🏡', 'info', 2000);
                navigate('/adoption');
              }}
              className="w-full py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
            >
              <span>Explore Adoption Corner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Explore categories / filter tags */}
          <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-200 text-sm tracking-tight">Explore Categories</h3>
                <p className="text-[10px] text-slate-500">Filter community knowledge</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { name: '#RescueStories', type: 'rescue_story', label: 'Rescue Stories 🚨', color: 'hover:text-orange-400 hover:bg-orange-500/5 hover:border-orange-500/20' },
                { name: '#CareTips', type: 'care_tip', label: 'Care wisdom / Tips 💡', color: 'hover:text-emerald-400 hover:bg-emerald-500/5 hover:border-emerald-500/20' },
                { name: '#PetExperiences', type: 'experience', label: 'Pet Experiences 🐾', color: 'hover:text-cyan-400 hover:bg-cyan-500/5 hover:border-cyan-500/20' },
                { name: '#GeneralPosts', type: 'general', label: 'General Updates 💬', color: 'hover:text-purple-400 hover:bg-purple-500/5 hover:border-purple-500/20' }
              ].map(tag => {
                const count = posts.filter(p => p.postType === tag.type).length;
                const isActive = selectedTag === tag.name;
                return (
                  <button
                    key={tag.name}
                    onClick={() => setSelectedTag(isActive ? null : tag.name)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all duration-300 ${
                      isActive 
                        ? 'bg-brand-500/15 border-brand-500 text-brand-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]' 
                        : `bg-white/[0.01] border-white/5 text-slate-400 ${tag.color}`
                    }`}
                  >
                    <span>{tag.label}</span>
                    <span className="text-[9px] bg-slate-800 border border-white/5 rounded-full px-2 py-0.5 text-slate-400">
                      {count} posts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Care Tip */}
          <div className="glass rounded-3xl p-5 border border-white/5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-200 text-sm tracking-tight">Care Tip of the Day</h3>
                  <p className="text-[10px] text-slate-500">{PET_TIPS[tipIndex].category}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/10 flex flex-col gap-3 min-h-[100px] justify-center">
              <p className="text-xs text-slate-300 leading-relaxed italic text-center">
                "{PET_TIPS[tipIndex].text}"
              </p>
            </div>

            <button 
              onClick={() => setTipIndex((prev) => (prev + 1) % PET_TIPS.length)}
              className="w-full py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300"
            >
              <span>Next Care Tip</span>
              <Lightbulb className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* ==========================================
      //    CREATE POST MODAL
      // ========================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none animate-fade-in">
          <div className="w-full max-w-xl glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-6">
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

      {/* ==========================================
      //    CREATE STORY MODAL
      // ========================================== */}
      {storyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none animate-fade-in animate-duration-200">
          <div className="w-full max-w-md glass rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                📸 Share Pet Story
              </h3>
              <button
                onClick={() => setStoryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStorySubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Pet Name
                </label>
                <input
                  type="text"
                  required
                  maxLength="15"
                  value={storyPetName}
                  onChange={(e) => setStoryPetName(e.target.value)}
                  placeholder="e.g. Luna, Milo, Rocky..."
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
                />
              </div>

              {/* Emoji Picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Choose Pet Avatar
                </label>
                <div className="grid grid-cols-6 gap-2 p-2.5 rounded-xl bg-slate-900/50 border border-white/5">
                  {['🐶', '🐱', '🐹', '🐰', '🦊', '🦜', '🐢', '🐠', '🐼', '🐨', '🐷', '🐸'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setStoryPetEmoji(emoji)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-200 ${
                        storyPetEmoji === emoji 
                          ? 'bg-brand-500 border border-brand-400 scale-105 shadow-md shadow-brand-500/20 text-slate-950 font-bold' 
                          : 'bg-slate-800 border border-transparent hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glow Color Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Glow Theme
                </label>
                <div className="flex gap-3 justify-center p-2 rounded-xl bg-slate-900/50 border border-white/5">
                  {[
                    { name: 'sky', bg: 'bg-sky-400' },
                    { name: 'purple', bg: 'bg-purple-400' },
                    { name: 'orange', bg: 'bg-amber-400' },
                    { name: 'mint', bg: 'bg-emerald-400' },
                    { name: 'rose', bg: 'bg-rose-400' },
                    { name: 'yellow', bg: 'bg-yellow-400' }
                  ].map(colorOpt => (
                    <button
                      key={colorOpt.name}
                      type="button"
                      onClick={() => setStoryGlowColor(colorOpt.name)}
                      className={`w-6 h-6 rounded-full ${colorOpt.bg} transition-all duration-200 relative flex items-center justify-center ${
                        storyGlowColor === colorOpt.name ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Story text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase pl-1">
                  Story Update (Max 120 chars)
                </label>
                <textarea
                  required
                  maxLength="120"
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="What is your pet doing? e.g. Just learned a new command! 🐾"
                  rows="3"
                  className="w-full bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-1 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              >
                Post Pet Story
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
      //    STORY VIEWER OVERLAY
      // ========================================== */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-fade-in select-none">
          <div className="w-full max-w-md flex flex-col gap-4 relative">
            
            {/* Progress Bars */}
            <div className="w-full flex gap-1.5 h-1 bg-white/10 rounded-full overflow-hidden px-1">
              {stories.map((story) => {
                const isCurrent = story.id === activeStory.id;
                const isPassed = stories.findIndex(s => s.id === story.id) < stories.findIndex(s => s.id === activeStory.id);
                return (
                  <div key={story.id} className="h-full flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-400 transition-all duration-50 ease-linear rounded-full"
                      style={{ 
                        width: isPassed ? '100%' : isCurrent ? `${storyProgress}%` : '0%' 
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full border-2 ${activeStory.color || 'border-brand-400'} flex items-center justify-center bg-slate-900 text-lg`}>
                  {activeStory.emoji}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-200 leading-tight">
                    {activeStory.name} <span className="text-[10px] font-normal text-slate-400">by {activeStory.author}</span>
                  </h4>
                  <p className="text-[9px] text-slate-500 font-semibold">{activeStory.time}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveStory(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Central Story Card */}
            <div className="relative w-full aspect-[9/16] max-h-[70vh] rounded-3xl bg-gradient-to-b from-[#111827] to-[#030712] border border-white/10 flex flex-col justify-center items-center text-center p-8 overflow-hidden shadow-2xl">
              {/* Decorative Neon Blurs */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-brand-500/10 blur-[50px] pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-purple-500/10 blur-[50px] pointer-events-none" />

              {/* Navigation Tap Overlays (Left/Right zones) */}
              <div 
                onClick={handlePrevStory}
                className="absolute top-0 left-0 w-1/4 h-full cursor-pointer active:bg-white/[0.01] transition-colors z-10" 
                title="Previous"
              />
              <div 
                onClick={handleNextStory}
                className="absolute top-0 right-0 w-1/4 h-full cursor-pointer active:bg-white/[0.01] transition-colors z-10" 
                title="Next"
              />

              {/* Story Content */}
              <div className="flex flex-col items-center gap-6 relative z-20 select-text">
                <div className="text-7xl animate-float-slow select-none">{activeStory.emoji}</div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest pl-1">
                    🐾 Pet Story
                  </span>
                  <p className="text-slate-200 text-lg md:text-xl font-bold leading-relaxed max-w-xs px-2 select-text italic">
                    "{activeStory.text}"
                  </p>
                </div>
              </div>
            </div>

            {/* Manual Nav Controls under card */}
            <div className="flex items-center justify-between px-4 mt-2">
              <button
                onClick={handlePrevStory}
                disabled={stories.findIndex(s => s.id === activeStory.id) === 0}
                className="flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none bg-slate-900/60 border border-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={handleNextStory}
                disabled={stories.findIndex(s => s.id === activeStory.id) === stories.length - 1}
                className="flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none bg-slate-900/60 border border-white/5 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
