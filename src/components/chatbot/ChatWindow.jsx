import React, { useState, useEffect, useRef } from 'react';
import API from '../../services/api.js';
import MessageBubble from './MessageBubble.jsx';
import QuickSuggestions from './QuickSuggestions.jsx';
import { 
  X, 
  Send, 
  Bot, 
  Trash2, 
  Sparkles 
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

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Append user message locally
    const userMsg = { sender: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await API.post('/pawbot/chat', { message: text.trim() });
      if (res.data.success) {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: res.data.reply, 
          timestamp: new Date() 
        }]);
      }
    } catch (err) {
      console.error('Chatbot request failed:', err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: '🐾 Sorry, my connection is lagging. Please try asking again in a moment!', 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear entire chat history?')) {
      try {
        const res = await API.delete('/pawbot/history');
        if (res.data.success) {
          setMessages([
            {
              sender: 'bot',
              text: `🐾 **Chat history cleared.**\n\nHow can I help you today? You can ask me questions about animal health, first aid, training, diets, or nearby veterinary clinics.`,
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-[360px] sm:w-[400px] h-[550px] glass rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fade-in relative z-20">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-brand-500/10">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
              PawBot
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Online AI Pet & Rescue Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button
              onClick={handleClearHistory}
              className="p-1.5 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
              title="Clear History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-950/20">
        {fetchingHistory ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500 gap-2">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            Loading conversations...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="flex flex-col gap-1">
              <MessageBubble message={msg} />
              <span className={`text-[9px] text-slate-600 px-10 ${
                msg.sender === 'user' ? 'self-end' : 'self-start'
              }`}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          ))
        )}

        {/* Simulated bouncing dots typing indicator */}
        {loading && (
          <div className="flex gap-2.5 max-w-[85%] items-start self-start">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/5 rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick reply prompt tags (render if conversation history is brief) */}
      {!loading && messages.length <= 2 && (
        <QuickSuggestions onSelect={handleSendMessage} />
      )}

      {/* Chat entry input box */}
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
