import ChatHistory from '../models/ChatHistory.js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Safely initialize the Google Gen AI client (prevent startup crashes if GEMINI_API_KEY is not defined)
let ai = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.error("Failed to initialize Google Gen AI:", err.message);
  }
}

// @desc    Process chatbot message and return Gemini AI response
// @route   POST /api/pawbot/chat
// @access  Private
export const handlePawbotChat = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message content is required' });
  }

  try {
    // 1. Fetch user-scoped chat history from Mongo or build a new one
    let history = await ChatHistory.findOne({ userId });
    if (!history) {
      history = new ChatHistory({ userId, messages: [] });
    } else {
      const rawDoc = await ChatHistory.findOne({ userId }).lean();
      if (rawDoc && rawDoc.messages && rawDoc.messages.length > 0) {
        let migrated = false;
        const migratedMessages = rawDoc.messages.map(msgObj => {
          const role = msgObj.role || (msgObj.sender === 'user' ? 'user' : 'assistant');
          const content = msgObj.content || msgObj.text || '';
          const timestamp = msgObj.timestamp || new Date();
          if (msgObj.role !== role || msgObj.content !== content) {
            migrated = true;
          }
          return { role, content, timestamp };
        }).filter(m => m.role && m.content.trim() !== '');

        if (migrated || rawDoc.messages.length !== migratedMessages.length) {
          history.messages = migratedMessages;
          await history.save();
        }
      }
    }

    const msg = message.toLowerCase().trim();

    // ==========================================
    // LAYER 1: EMERGENCY DETECTION SYSTEM
    // ==========================================
    const emergencyKeywords = [
      'bleeding', 'unconscious', 'seizure', 'snake bite', 'snakebite',
      'hit by vehicle', 'hit by a vehicle', 'not breathing', 'severe injury', 'severely injured'
    ];
    const isEmergency = emergencyKeywords.some(keyword => msg.includes(keyword));

    if (isEmergency) {
      const reply = `🚨 **Emergency Detected**\n\nYour message suggests a potentially serious animal emergency.\n\nPlease:\n1. Contact a veterinary hospital immediately.\n2. Keep the animal safe and calm.\n3. Submit a rescue report through PawLink.`;
      
      // Save user prompt and emergency reply to MongoDB
      history.messages.push({ role: 'user', content: message });
      history.messages.push({ role: 'assistant', content: reply });
      await history.save();
      
      return res.status(200).json({ success: true, reply });
    }

    // ==========================================
    // LAYER 2: INTERACTIVE AI BACKUP (GEMINI 2.5 FLASH)
    // ==========================================
    const systemInstruction = 
      "You are PawBot, an intelligent AI assistant for PawLink.\n\n" +
      "You are an expert in:\n" +
      "- Pet care\n" +
      "- Veterinary guidance\n" +
      "- Animal rescue\n" +
      "- Pet nutrition\n" +
      "- Pet training\n" +
      "- Vaccination schedules\n" +
      "- Wildlife safety\n" +
      "- Animal adoption\n" +
      "- Lost and found pets\n" +
      "- Emergency animal response\n\n" +
      "Your responses should be:\n" +
      "- Friendly\n" +
      "- Accurate\n" +
      "- Helpful\n" +
      "- Easy to understand\n" +
      "- Conversational\n\n" +
      "Never claim to be a veterinarian.\n" +
      "Never provide dangerous medical advice.\n" +
      "For serious situations always recommend consulting a licensed veterinarian or emergency animal service.\n\n" +
      "Use emojis occasionally to make conversations engaging.";

    // Build multi-turn conversational contents for Gemini API
    const contents = [];
    if (history.messages && history.messages.length > 0) {
      // Send the last 10 exchanges as context
      const recentHistory = history.messages.slice(-10);
      for (const msgObj of recentHistory) {
        contents.push({
          role: msgObj.role === 'user' ? 'user' : 'model',
          parts: [{ text: msgObj.content }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    let reply = '';

    // Send conversation to Gemini API if the client is safely initialized
    if (ai) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.4
          }
        });
        reply = aiResponse.text;
      } catch (err) {
        console.error("Gemini API Pipeline Error:", err.message);
      }
    }

    // Fallback to rule-based offline symptom analyzer if AI response fails or is not configured
    if (!reply) {
      // 1. Emergency & Injuries
      if (
        msg.includes('bleed') || 
        msg.includes('blood') || 
        msg.includes('wound') || 
        msg.includes('cut') || 
        msg.includes('injured') || 
        msg.includes('hurt') || 
        msg.includes('fracture') || 
        msg.includes('accident')
      ) {
        reply = `🚨 **Emergency First Aid Alert:**\n1. **Apply Gentle Pressure:** If there is active bleeding, use a clean cloth or bandage to apply constant pressure to the wound.\n2. **Minimize Movement:** Keep the animal calm and restricted to avoid worsening fractures or internal injuries.\n3. **Smart Routing:** Please use the **"Report Issue"** section in PawLink immediately. Pin the coordinates so the nearest **Fire Force** and **Animal Emergency Hospital** are dispatched instantly.\n4. **Emergency Hotlines:** Dial **911** or click the **Emergency Assistance** button on your home dashboard to connect to responder dispatch.`;
      }

      // 2. Snake/Wild animal sightings
      else if (msg.includes('snake') || msg.includes('wild') || msg.includes('leopard') || msg.includes('fox') || msg.includes('ranger')) {
        reply = `🐍 **Wild Animal Sighting Guidance:**\n1. **Keep Distance:** Do not approach, provoke, or try to capture the animal. Ensure children and domestic pets are kept indoors.\n2. **File Report:** Use the **"Report Issue"** page and set the Category to **"Wild Animal Sighting"**.\n3. **Forest Ranger Dispatch:** PawLink's routing engine will compute distances to alert the closest **Forest Ranger Office** for safe extraction.\n4. **Emergency Line:** Dial **1-800-555-0900** immediately for Ranger Patrol.`;
      }

      // 3. Vomit & Diarrhea
      else if (msg.includes('vomit') || msg.includes('puke') || msg.includes('diarrhea') || msg.includes('loose motion')) {
        reply = `🐶 **Digestive Distress Symptoms:**\n1. **Withhold Food:** Stop feeding solid food for 12 hours. Ensure they have access to small, frequent sips of fresh water to avoid dehydration.\n2. **Check for Toxins:** Ensure they haven't ingested chocolate, grapes, onions, human medicine, or household chemicals.\n3. **Medical Emergency:** If vomiting persists, contains blood, or is accompanied by severe lethargy, it could indicate parvovirus or poisoning.\n4. **Next Steps:** Navigate to **"Nearby Help"** in PawLink to locate the closest veterinary hospital immediately.`;
      }

      // 4. Fever & Lethargy
      else if (msg.includes('fever') || msg.includes('hot') || msg.includes('temperature') || msg.includes('weak') || msg.includes('lazy') || msg.includes('lethargic') || msg.includes('not eating')) {
        reply = `🐱 **Fever / Lethargy Guidance:**\n1. **Check Nose & Ears:** Dry, warm ears and a dry nose often indicate a fever. A dog's normal body temperature is 101°F-102.5°F (much warmer than humans).\n2. **Hydration Check:** Gently pinch the skin on their neck. If the skin takes time to snap back, they are dehydrated. Provide cool water.\n3. **No Human Meds:** **NEVER** give paracetamol (acetaminophen) or ibuprofen to dogs or cats—these are highly toxic and fatal.\n4. **Appointment:** Set a reminder in the **"Health Scheduler"** or locate the nearest clinic using the **"Nearby Help"** page.`;
      }

      // 5. Nearby Help & Vets
      else if (msg.includes('vet') || msg.includes('clinic') || msg.includes('hospital') || msg.includes('doctor') || msg.includes('groom') || msg.includes('spa') || msg.includes('food') || msg.includes('shop')) {
        reply = `📍 **Locating Pet Services:**\nI can help you find clinics, supermarkets, and groomers!\n1. Go to the **"Nearby Help"** page from the sidebar menu.\n2. If prompted, allow GPS access to fetch coordinates. Alternatively, the app will default to our localized hubs in **Neyyattinkara/Trivandrum**.\n3. Use the top filters (vets, food, grooming, accessories) to filter markers on the map and view contact info.`;
      }

      // 6. Lost & Found
      else if (msg.includes('lost') || msg.includes('missing') || msg.includes('found') || msg.includes('sighting')) {
        reply = `🔍 **Lost & Found Guide:**\n1. **Post a Report:** Go to the **"Lost & Found"** page in PawLink.\n2. **Details Matter:** Upload a clear photo of the pet, state their breed/color markings, contact details, and the date/time they were last seen.\n3. **Pin Location:** Click on the interactive map inside the report form to drop a pin at the exact location they went missing or were sighted.\n4. **Check the Map:** Browse active pins color-coded red (Lost) and green (Found) to check matching reports in your area.`;
      }

      // 7. Adoption
      else if (msg.includes('adopt') || msg.includes('adoption')) {
        reply = `🏡 **Adoption Corner Assistance:**\nLooking to adopt or rehome an animal?\n1. Open the **"Adoption Corner"** from the sidebar.\n2. **View Listings:** Browse available dogs, cats, and birds looking for forever homes, complete with vaccination status.\n3. **Post an Ad:** If you rescued a stray and want to put them up for adoption, click **"List for Adoption"** and fill out the descriptive form with contact details.`;
      }

      // 8. General App Info & Support / Features
      else if (
        msg.includes('pawlink') || 
        msg.includes('about') || 
        msg.includes('app') || 
        msg.includes('features') || 
        msg.includes('who made') || 
        msg.includes('support') || 
        msg.includes('contact') || 
        msg.includes('bug')
      ) {
        reply = `🐾 **About PawLink:**\nPawLink is a community-centric pet rescue, care, and tracking portal.\nOur key features include:\n- **Emergency Reporter:** Map-based crisis alerts routing to Fire Force, Forest Rangers, or Vets.\n- **Nearby Help:** A directory of local veterinary clinics, pet stores, and grooming services.\n- **Lost & Found Tracker:** Report missing pets or stray animal sightings with interactive pins.\n- **Adoption Corner:** Rehome rescued strays or find a new pet companion.\n- **Community Feed & Forums:** Share updates, pet stories, and ask questions to fellow pet owners.\n- **Health Scheduler:** Manage vaccines and appointments for your registered pets.`;
      }

      // 9. Pet Registration & Profile
      else if (
        msg.includes('register') || 
        msg.includes('add pet') || 
        msg.includes('create pet') || 
        msg.includes('profile') || 
        msg.includes('my pet')
      ) {
        reply = `🐶 **Managing Pet Profiles on PawLink:**\n- **How to add a pet:** Navigate to your **"Profile"** page from the sidebar menu, scroll to the **"My Pets"** section, and click **"Add Pet"**.\n- Fill in details like name, breed, age, and weight to customize vaccine timelines.\n- Once registered, you will unlock the **"Health Scheduler"** to manage medical events.`;
      }

      // 10. Pet Diet, Nutrition & Food
      else if (
        msg.includes('diet') || 
        msg.includes('food') || 
        msg.includes('nutrition') || 
        msg.includes('feed') || 
        msg.includes('eat') || 
        msg.includes('water') || 
        msg.includes('treat') || 
        msg.includes('chocolate') || 
        msg.includes('toxic')
      ) {
        reply = `🍖 **Pet Nutrition & Diet Tips:**\n- **Dogs:** High-quality kibble balanced with cooked lean meats and safe veggies (carrots, green beans). Avoid cooked bones, chocolate, grapes/raisins, onions, garlic, and xylitol (artificial sweetener).\n- **Cats:** obligate carnivores requiring high-protein wet or dry food with taurine. Ensure they have fresh running water (cats love pet fountains).\n- **Hydration:** Always keep a clean bowl of water accessible. If your pet stops eating/drinking for over 24 hours, seek veterinary advice immediately.`;
      }

      // 11. Pet Training & Behavior
      else if (
        msg.includes('train') || 
        msg.includes('bark') || 
        msg.includes('bite') || 
        msg.includes('chew') || 
        msg.includes('aggressive') || 
        msg.includes('pee') || 
        msg.includes('poop') || 
        msg.includes('potty') || 
        msg.includes('litter') || 
        msg.includes('scratch') || 
        msg.includes('howl')
      ) {
        reply = `🦮 **Pet Training & Behavior Advice:**\n- **Potty Training:** Establish a strict routine (first thing in the morning, after meals, before bed). Reward success with treats instantly. For cats, place the litter box in a quiet, accessible location.\n- **Excessive Barking/Meowing:** Identify the trigger (boredom, attention-seeking, anxiety). Avoid shouting; redirect their attention and reward quiet behavior.\n- **Biting & Chewing:** Provide plenty of chew toys. If they bite during play, make a high-pitched 'ow' sound, stop playing, and walk away.\n- **Forum:** Share your training challenges or ask advice in the **"Discussion Forum"** under the **"Training"** category!`;
      }

      // 12. Vaccines & Parasites
      else if (
        msg.includes('vaccine') || 
        msg.includes('shot') || 
        msg.includes('rabies') || 
        msg.includes('deworm') || 
        msg.includes('tick') || 
        msg.includes('flea') || 
        msg.includes('worm') || 
        msg.includes('bug') || 
        msg.includes('parasite')
      ) {
        reply = `💉 **Vaccination & Parasite Control:**\n- **Core Vaccinations:** For dogs, DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) and Rabies are essential. For cats, FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) and Rabies.\n- **Deworming:** Puppies and kittens require deworming every few weeks, while adult pets should be dewormed every 3-6 months.\n- **Ticks & Fleas:** Use monthly spot-on treatments, collars, or oral chews as recommended by your vet. Regularly inspect their coat.\n- **Scheduler:** Log vaccine dates in the **"Health Scheduler"** to get automatic reminder alerts!`;
      }

      // 13. General Dog Care
      else if (
        msg.includes('dog') || 
        msg.includes('puppy') || 
        msg.includes('dogs') || 
        msg.includes('canine')
      ) {
        reply = `🐕 **General Dog Care Guide:**\n- **Exercise:** Dogs need at least 30-60 minutes of daily exercise and mental stimulation (walks, play, training).\n- **Grooming:** Brush their coat regularly, trim nails monthly, and clean their ears to prevent infections.\n- **Socialization:** Expose puppies to new people, sounds, and other vaccinated dogs to build confidence.\n- Use our **"Discussion Forum"** to connect with dog lovers!`;
      }

      // 14. General Cat Care
      else if (
        msg.includes('cat') || 
        msg.includes('kitten') || 
        msg.includes('cats') || 
        msg.includes('feline')
      ) {
        reply = `🐈 **General Cat Care Guide:**\n- **Environment:** Cats need vertical spaces (cat trees, window perches) and scratching posts to stay happy.\n- **Grooming:** While cats groom themselves, weekly brushing helps reduce hairballs.\n- **Health:** Regular vet checkups are crucial, as cats are masters at hiding illness or pain.\n- Visit the **"Discussion Forum"** and select **"Pet Care"** to chat about feline husbandry!`;
      }

      // 15. Other Animals & Pets
      else if (
        msg.includes('rabbit') || 
        msg.includes('bird') || 
        msg.includes('fish') || 
        msg.includes('hamster') || 
        msg.includes('turtle') || 
        msg.includes('animal') || 
        msg.includes('pet')
      ) {
        reply = `🐹 **Small Pets & Exotic Animals:**\n- **Rabbits:** Require unlimited fresh timothy hay, leafy greens, and a spacious enclosure.\n- **Birds:** Need large cages, daily out-of-cage time, fresh water, and a diet of pellets, seeds, and fresh fruits.\n- **Fish & Aquatics:** Monitor water quality parameters (pH, ammonia, nitrates) and ensure proper tank filtration and size.\n- Have questions about small animals? Start a thread in our **"Discussion Forum"**!`;
      }

      // 16. Greetings & Welcomes
      else if (
        msg.includes('hi') || 
        msg.includes('hello') || 
        msg.includes('hey') || 
        msg.includes('sup') || 
        msg.includes('greetings') || 
        msg.includes('good morning') || 
        msg.includes('good afternoon')
      ) {
        reply = `🐾 **Hello! I'm PawBot, your PawLink Assistant!** \nHow can I help you today? You can ask me questions about:\n- **First Aid Symptoms** (*"dog is vomiting"*, *"kitten has fever"*)\n- **Street Emergencies** (*"found bleeding stray"*, *"snake sighting"*)\n- **Pet Care & Training** (*"potty training"*, *"diet and food"*, *"vaccination dates"*)\n- **Platform Navigation** (*"how to find a vet"*, *"post adoption listing"*, *"lost pet reports"*)\n\nFeel free to click one of the quick prompts below or type your query!`;
      }

      // 17. Default Fallback
      else {
        reply = `🐾 I'm not completely sure about that. I can provide advice on:\n- **First Aid Guidance** (*"vomiting"*, *"fever"*, *"wounds"*, *"lethargy"*)\n- **Pet Care & Behavior** (*"training tips"*, *"vaccines"*, *"diet"*)\n- **Wildlife Sightings** (*"snakes"*, *"wild animals"*)\n- **App Navigation** (*"lost pets tracker"*, *"veterinary clinics"*, *"adoption ads"*)\n\nIf you are facing a critical animal crisis, please press the **"Emergency Assistance"** button on the Home Dashboard immediately to contact local municipalities, fire stations, or veterinarians directly.`;
      }
    }

    // Save exchange to user's database record
    history.messages.push({ role: 'user', content: message });
    history.messages.push({ role: 'assistant', content: reply });
    await history.save();

    return res.status(200).json({
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
    
    // If a session exists with messages, return them
    if (history) {
      const rawDoc = await ChatHistory.findOne({ userId: req.user.id }).lean();
      if (rawDoc && rawDoc.messages && rawDoc.messages.length > 0) {
        let migrated = false;
        const migratedMessages = rawDoc.messages.map(msgObj => {
          const role = msgObj.role || (msgObj.sender === 'user' ? 'user' : 'assistant');
          const content = msgObj.content || msgObj.text || '';
          const timestamp = msgObj.timestamp || new Date();
          if (msgObj.role !== role || msgObj.content !== content) {
            migrated = true;
          }
          return { role, content, timestamp };
        }).filter(m => m.role && m.content.trim() !== '');

        if (migrated || rawDoc.messages.length !== migratedMessages.length) {
          history.messages = migratedMessages;
          await history.save();
        }
        return res.status(200).json({ success: true, messages: history.messages });
      }
    }

    // Default Greeting
    const defaultGreeting = [
      {
        role: 'assistant',
        content: "Hi! I'm PawBot, your AI pet care assistant. How can I help you and your furry friends today? 🐾",
        timestamp: new Date()
      }
    ];

    return res.status(200).json({ success: true, messages: defaultGreeting });
  } catch (error) {
    console.error('Get Chat History Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
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
