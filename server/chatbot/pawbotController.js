import ChatHistory from '../models/ChatHistory.js';
import { detectEmergency } from './emergencyDetector.js';
import { detectIntent } from './intents.js';
import { offlineResponses } from './responses.js';
import { generateResponse } from './openaiService.js';

// @desc    Process chatbot message (Intelligent AI/Intent handler with DB history)
// @route   POST /api/pawbot/chat
// @access  Private
export const handlePawbotChat = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message content is required' });
  }

  try {
    // 1. Get or create chat history from DB
    let history = await ChatHistory.findOne({ userId });
    if (!history) {
      history = await ChatHistory.create({ userId, messages: [] });
    }

    // 2. Check for emergencies
    const emergencyCheck = detectEmergency(message);
    if (emergencyCheck && emergencyCheck.isEmergency) {
      // Save emergency exchange to DB
      history.messages.push({ sender: 'user', text: message });
      history.messages.push({ sender: 'bot', text: emergencyCheck.reply });
      await history.save();

      return res.json({
        success: true,
        reply: emergencyCheck.reply,
        isEmergency: true,
        priority: 'HIGH'
      });
    }

    // 3. Detect intent (names, food, training, vaccine, nearby)
    const intent = detectIntent(message);

    // 4. Try generating AI response (checks OpenAI/Gemini credentials internally)
    let reply = await generateResponse(message, history.messages, intent);

    // 5. Fallback to offline rule-based templates if AI response fails or is not configured
    if (!reply) {
      reply = offlineResponses[intent] || offlineResponses.general;
    }

    // 6. Save exchange to database
    history.messages.push({ sender: 'user', text: message });
    history.messages.push({ sender: 'bot', text: reply });
    await history.save();

    return res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('PawBot Chat Controller Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing chatbot query' });
  }
};

// @desc    Get user's chatbot history
// @route   GET /api/pawbot/history
// @access  Private
export const getPawbotHistory = async (req, res) => {
  try {
    const history = await ChatHistory.findOne({ userId: req.user.id });
    const messages = (history && history.messages && history.messages.length > 0)
      ? history.messages
      : [
          {
            sender: 'bot',
            text: `🐾 **Hi! I’m PawBot. How can I help your furry friend today?**\n\nYou can ask me questions about animal health, first aid, training, diets, or nearby veterinary clinics.`,
            timestamp: new Date()
          }
        ];

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('Get Chat History Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving chat history' });
  }
};

// @desc    Clear user's chatbot history
// @route   DELETE /api/pawbot/history
// @access  Private
export const clearPawbotHistory = async (req, res) => {
  try {
    const history = await ChatHistory.findOne({ userId: req.user.id });
    if (history) {
      history.messages = [];
      await history.save();
    }
    res.json({ success: true, message: 'Chat history cleared successfully!' });
  } catch (error) {
    console.error('Clear Chat History Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error clearing chat history' });
  }
};
