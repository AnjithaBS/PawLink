import dotenv from 'dotenv';
dotenv.config();

/**
 * Generates an AI response from Gemini or OpenAI depending on available keys.
 * If no key is set or the API fails, returns null to fall back to the offline engine.
 */
export const generateResponse = async (message, chatHistory = [], intent = '') => {
  const systemPrompt = `You are PawBot, a smart AI assistant specialized in pets, animal care, rescue guidance, vaccinations, food suggestions, and emergency animal support. Give safe, friendly, practical advice. Never provide dangerous medical claims. Always recommend consulting a veterinarian for serious issues. Keep responses friendly, helpful, short, clear, and occasionally use emojis.`;

  // 1. Try Google Gemini API
  if (process.env.GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      // Structure chat context
      let promptText = `System Prompt: ${systemPrompt}\n\n`;
      
      // Append brief history to context
      if (chatHistory && chatHistory.length > 0) {
        promptText += `Previous conversation history:\n`;
        // Take the last 6 messages to keep context window compact
        const recentHistory = chatHistory.slice(-6);
        for (const msg of recentHistory) {
          promptText += `${msg.sender === 'user' ? 'User' : 'PawBot'}: ${msg.text}\n`;
        }
        promptText += `\n`;
      }
      
      promptText += `Intent Category: ${intent || 'general'}\n`;
      promptText += `User message: ${message}\nPawBot reply:`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text.trim();
      } else {
        console.warn('Gemini response format issue:', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Gemini API Error:', error.message);
    }
  }

  // 2. Try OpenAI API
  if (process.env.OPENAI_API_KEY) {
    try {
      const url = 'https://api.openai.com/v1/chat/completions';
      
      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add last 6 message history
      if (chatHistory && chatHistory.length > 0) {
        const recentHistory = chatHistory.slice(-6);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        }
      }

      // Add intent hints to the user query if applicable
      let userPrompt = message;
      if (intent && intent !== 'general') {
        userPrompt = `[Context Intent: ${intent}] ${message}`;
      }
      messages.push({ role: 'user', content: userPrompt });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 450
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      } else {
        console.warn('OpenAI response format issue:', JSON.stringify(data));
      }
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
    }
  }

  // If no API key is available or both failed
  return null;
};
