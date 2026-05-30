import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api.js';
import MessageBubble from './MessageBubble.jsx';
import QuickSuggestions from './QuickSuggestions.jsx';
import { 
  X, 
  Send, 
  Trash2, 
  Sparkles,
  PawPrint
} from 'lucide-react';

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  const chatEndRef = useRef(null);

  // Fetch conversation history from MongoDB on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get('/pawbot/history');
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setFetchingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  // Auto-scroll to bottom of chat when new messages or loading state updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const sendNormalMessage = async (text) => {
    try {
      const res = await API.post('/pawbot/chat', { message: text });
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, timestamp: new Date() }]);
      }
    } catch (err) {
      console.error('PawBot API message pipeline failed:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ **Connection Error:** I failed to process that request. Please ensure your backend server is online.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setInputText('');
    setLoading(true);

    const lowerText = text.toLowerCase().trim();
    const isLocationQuery = lowerText.includes('nearest') || lowerText.includes('nearby') || lowerText.includes('find a') || lowerText.includes('locate');
    const isVet = lowerText.includes('vet') || lowerText.includes('clinic') || lowerText.includes('hospital') || lowerText.includes('doctor');
    const isGroomer = lowerText.includes('groom') || lowerText.includes('salon') || lowerText.includes('spa');
    const isStore = lowerText.includes('store') || lowerText.includes('shop') || lowerText.includes('food') || lowerText.includes('accessories');

    if (isLocationQuery && (isVet || isGroomer || isStore)) {
      // Access browser geolocation
      setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const nearbyRes = await API.get(`/nearby?lat=${latitude}&lng=${longitude}`);
              if (nearbyRes.data.success && nearbyRes.data.all) {
                let label = 'Veterinary Clinics & Hospitals';
                
                const services = nearbyRes.data.all.filter(s => {
                  if (isGroomer) {
                    label = 'Grooming Salons & Spas';
                    return s.type === 'Pet Grooming Salon';
                  }
                  if (isStore) {
                    label = 'Pet Supplies & Accessory Shops';
                    return s.type === 'Pet Food Store' || s.type === 'Pet Accessory Shop';
                  }
                  return s.type === 'Veterinary Hospital';
                }).slice(0, 3);

                let clinicReply = `📍 **Here are the nearest ${label} based on your coordinates:**\n\n`;
                if (services.length > 0) {
                  services.forEach((c, i) => {
                    clinicReply += `${i + 1}. **${c.name}**\n   - 🏥 Distance: ${c.distance} km\n   - 📞 Contact: ${c.contact}\n   - ⭐ Rating: ${c.rating}/5.0\n   - 📍 Address: *${c.address}*\n\n`;
                  });
                } else {
                  clinicReply += `No matching services found in your area.\n\n`;
                }
                clinicReply += `*This is general guidance and not a veterinary diagnosis.*`;

                setMessages(prev => [...prev, { role: 'assistant', content: clinicReply, timestamp: new Date() }]);
                setLoading(false);

                // Sync and log query to database history
                await API.post('/pawbot/chat', { message: text });
              }
            } catch (err) {
              console.error('Nearby API lookup failed:', err);
              await sendNormalMessage(text);
            }
          },
          async (error) => {
            console.warn('Geolocation access denied. Redirecting query to model fallback:', error.message);
            await sendNormalMessage(text);
          }
        );
      } else {
        await sendNormalMessage(text);
      }
    } else {
      // Standard AI conversation path
      setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }]);
      await sendNormalMessage(text);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear entire chat history?')) {
      try {
        const res = await API.delete('/pawbot/history');
        if (res.data.success) {
          setMessages([
            {
              role: 'assistant',
              content: "🐾 Chat history cleared. How can I help you today?",
              timestamp: new Date()
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to clear chat history:', err);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="w-[380px] h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] glass border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden animate-fade-in relative z-[99999]">
      
      {/* Header bar */}
      <div className="p-4 bg-slate-900/80 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center text-[#0B0F1A] shadow-md shadow-sky-400/25 animate-pulse">
            <PawPrint className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-100 flex items-center gap-1.5 leading-none">
              PawBot
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            </h4>
            <span className="text-[10px] text-slate-400 mt-1 block">Online AI Pet & Rescue Assistant</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={handleClearHistory}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/5 rounded-lg transition-colors"
            title="Close Drawer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-950/20">
        {fetchingHistory ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-sky-400 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Syncing database logs...</span>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))
        )}

        {/* Bouncing typing indicator dots */}
        {loading && (
          <div className="flex gap-2.5 max-w-[85%] items-start self-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center shrink-0">
              <PawPrint className="w-4 h-4 fill-current text-[#0B0F1A]" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompt suggestions */}
      {!loading && messages.length <= 2 && (
        <QuickSuggestions onSelect={handleSendMessage} />
      )}

      {/* Input box */}
      <div className="p-3 border-t border-white/5 bg-slate-950/80 backdrop-blur-md flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about training, vaccines, toxic food..."
          className="flex-1 bg-slate-900 border border-white/10 focus:border-brand-500 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || !inputText.trim()}
          className="bg-brand-500 hover:bg-brand-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default ChatWindow;
