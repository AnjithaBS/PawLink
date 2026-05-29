// @desc    Process chat message and return response (Smart offline symptom analyzer)
// @route   POST /api/chat
// @access  Public (or Private)
export const handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message content is required' });
  }

  const msg = message.toLowerCase().trim();
  let reply = '';

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
    reply = `🚨 **Emergency First Aid Alert:**
1. **Apply Gentle Pressure:** If there is active bleeding, use a clean cloth or bandage to apply constant pressure to the wound.
2. **Minimize Movement:** Keep the animal calm and restricted to avoid worsening fractures or internal injuries.
3. **Smart Routing:** Please use the **"Report Issue"** section in PawLink immediately. Pin the coordinates so the nearest **Fire Force** and **Animal Emergency Hospital** are dispatched instantly.
4. **Emergency Hotlines:** Dial **911** or click the **Emergency Assistance** button on your home dashboard to connect to responder dispatch.`;
  }

  // 2. Snake/Wild animal sightings
  else if (msg.includes('snake') || msg.includes('wild') || msg.includes('leopard') || msg.includes('fox') || msg.includes('ranger')) {
    reply = `🐍 **Wild Animal Sighting Guidance:**
1. **Keep Distance:** Do not approach, provoke, or try to capture the animal. Ensure children and domestic pets are kept indoors.
2. **File Report:** Use the **"Report Issue"** page and set the Category to **"Wild Animal Sighting"**.
3. **Forest Ranger Dispatch:** PawLink's routing engine will compute distances to alert the closest **Forest Ranger Office** for safe extraction.
4. **Emergency Line:** Dial **1-800-555-0900** immediately for Ranger Patrol.`;
  }

  // 3. Vomit & Diarrhea
  else if (msg.includes('vomit') || msg.includes('puke') || msg.includes('diarrhea') || msg.includes('loose motion')) {
    reply = `🐶 **Digestive Distress Symptoms:**
1. **Withhold Food:** Stop feeding solid food for 12 hours. Ensure they have access to small, frequent sips of fresh water to avoid dehydration.
2. **Check for Toxins:** Ensure they haven't ingested chocolate, grapes, onions, human medicine, or household chemicals.
3. **Medical Emergency:** If vomiting persists, contains blood, or is accompanied by severe lethargy, it could indicate parvovirus or poisoning.
4. **Next Steps:** Navigate to **"Nearby Help"** in PawLink to locate the closest veterinary hospital immediately.`;
  }

  // 4. Fever & Lethargy
  else if (msg.includes('fever') || msg.includes('hot') || msg.includes('temperature') || msg.includes('weak') || msg.includes('lazy') || msg.includes('lethargic') || msg.includes('not eating')) {
    reply = `🐱 **Fever / Lethargy Guidance:**
1. **Check Nose & Ears:** Dry, warm ears and a dry nose often indicate a fever. A dog's normal body temperature is 101°F-102.5°F (much warmer than humans).
2. **Hydration Check:** Gently pinch the skin on their neck. If the skin takes time to snap back, they are dehydrated. Provide cool water.
3. **No Human Meds:** **NEVER** give paracetamol (acetaminophen) or ibuprofen to dogs or cats—these are highly toxic and fatal.
4. **Appointment:** Set a reminder in the **"Health Scheduler"** or locate the nearest clinic using the **"Nearby Help"** page.`;
  }

  // 5. Nearby Help & Vets
  else if (msg.includes('vet') || msg.includes('clinic') || msg.includes('hospital') || msg.includes('doctor') || msg.includes('groom') || msg.includes('spa') || msg.includes('food') || msg.includes('shop')) {
    reply = `📍 **Locating Pet Services:**
I can help you find clinics, supermarkets, and groomers!
1. Go to the **"Nearby Help"** page from the sidebar menu.
2. If prompted, allow GPS access to fetch coordinates. Alternatively, the app will default to our localized hubs in **Neyyattinkara/Trivandrum**.
3. Use the top filters (vets, food, grooming, accessories) to filter markers on the map and view contact info.`;
  }

  // 6. Lost & Found
  else if (msg.includes('lost') || msg.includes('missing') || msg.includes('found') || msg.includes('sighting')) {
    reply = `🔍 **Lost & Found Guide:**
1. **Post a Report:** Go to the **"Lost & Found"** page in PawLink.
2. **Details Matter:** Upload a clear photo of the pet, state their breed/color markings, contact details, and the date/time they were last seen.
3. **Pin Location:** Click on the interactive map inside the report form to drop a pin at the exact location they went missing or were sighted.
4. **Check the Map:** Browse active pins color-coded red (Lost) and green (Found) to check matching reports in your area.`;
  }

  // 7. Adoption
  else if (msg.includes('adopt') || msg.includes('adoption')) {
    reply = `🏡 **Adoption Corner Assistance:**
Looking to adopt or rehome an animal?
1. Open the **"Adoption Corner"** from the sidebar.
2. **View Listings:** Browse available dogs, cats, and birds looking for forever homes, complete with vaccination status.
3. **Post an Ad:** If you rescued a stray and want to put them up for adoption, click **"List for Adoption"** and fill out the descriptive form with contact details.`;
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
    reply = `🐾 **About PawLink:**
PawLink is a community-centric pet rescue, care, and tracking portal.
Our key features include:
- **Emergency Reporter:** Map-based crisis alerts routing to Fire Force, Forest Rangers, or Vets.
- **Nearby Help:** A directory of local veterinary clinics, pet stores, and grooming services.
- **Lost & Found Tracker:** Report missing pets or stray animal sightings with interactive pins.
- **Adoption Corner:** Rehome rescued strays or find a new pet companion.
- **Community Feed & Forums:** Share updates, pet stories, and ask questions to fellow pet owners.
- **Health Scheduler:** Manage vaccines and appointments for your registered pets.`;
  }

  // 9. Pet Registration & Profile
  else if (
    msg.includes('register') || 
    msg.includes('add pet') || 
    msg.includes('create pet') || 
    msg.includes('profile') || 
    msg.includes('my pet')
  ) {
    reply = `🐶 **Managing Pet Profiles on PawLink:**
- **How to add a pet:** Navigate to your **"Profile"** page from the sidebar menu, scroll to the **"My Pets"** section, and click **"Add Pet"**.
- Fill in details like name, breed, age, and weight to customize vaccine timelines.
- Once registered, you will unlock the **"Health Scheduler"** to manage medical events.`;
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
    reply = `🍖 **Pet Nutrition & Diet Tips:**
- **Dogs:** High-quality kibble balanced with cooked lean meats and safe veggies (carrots, green beans). Avoid cooked bones, chocolate, grapes/raisins, onions, garlic, and xylitol (artificial sweetener).
- **Cats:** obligate carnivores requiring high-protein wet or dry food with taurine. Ensure they have fresh running water (cats love pet fountains).
- **Hydration:** Always keep a clean bowl of water accessible. If your pet stops eating/drinking for over 24 hours, seek veterinary advice immediately.`;
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
    reply = `🦮 **Pet Training & Behavior Advice:**
- **Potty Training:** Establish a strict routine (first thing in the morning, after meals, before bed). Reward success with treats instantly. For cats, place the litter box in a quiet, accessible location.
- **Excessive Barking/Meowing:** Identify the trigger (boredom, attention-seeking, anxiety). Avoid shouting; redirect their attention and reward quiet behavior.
- **Biting & Chewing:** Provide plenty of chew toys. If they bite during play, make a high-pitched 'ow' sound, stop playing, and walk away.
- **Forum:** Share your training challenges or ask advice in the **"Discussion Forum"** under the **"Training"** category!`;
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
    reply = `💉 **Vaccination & Parasite Control:**
- **Core Vaccinations:** For dogs, DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza) and Rabies are essential. For cats, FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia) and Rabies.
- **Deworming:** Puppies and kittens require deworming every few weeks, while adult pets should be dewormed every 3-6 months.
- **Ticks & Fleas:** Use monthly spot-on treatments, collars, or oral chews as recommended by your vet. Regularly inspect their coat.
- **Scheduler:** Log vaccine dates in the **"Health Scheduler"** to get automatic reminder alerts!`;
  }

  // 13. General Dog Care
  else if (
    msg.includes('dog') || 
    msg.includes('puppy') || 
    msg.includes('dogs') || 
    msg.includes('canine')
  ) {
    reply = `🐕 **General Dog Care Guide:**
- **Exercise:** Dogs need at least 30-60 minutes of daily exercise and mental stimulation (walks, play, training).
- **Grooming:** Brush their coat regularly, trim nails monthly, and clean their ears to prevent infections.
- **Socialization:** Expose puppies to new people, sounds, and other vaccinated dogs to build confidence.
- Use our **"Discussion Forum"** to connect with dog lovers!`;
  }

  // 14. General Cat Care
  else if (
    msg.includes('cat') || 
    msg.includes('kitten') || 
    msg.includes('cats') || 
    msg.includes('feline')
  ) {
    reply = `🐈 **General Cat Care Guide:**
- **Environment:** Cats need vertical spaces (cat trees, window perches) and scratching posts to stay happy.
- **Grooming:** While cats groom themselves, weekly brushing helps reduce hairballs.
- **Health:** Regular vet checkups are crucial, as cats are masters at hiding illness or pain.
- Visit the **"Discussion Forum"** and select **"Pet Care"** to chat about feline husbandry!`;
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
    reply = `🐹 **Small Pets & Exotic Animals:**
- **Rabbits:** Require unlimited fresh timothy hay, leafy greens, and a spacious enclosure.
- **Birds:** Need large cages, daily out-of-cage time, fresh water, and a diet of pellets, seeds, and fresh fruits.
- **Fish & Aquatics:** Monitor water quality parameters (pH, ammonia, nitrates) and ensure proper tank filtration and size.
- Have questions about small animals? Start a thread in our **"Discussion Forum"**!`;
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
    reply = `🐾 **Hello! I'm PawBot, your PawLink Assistant!** 
How can I help you today? You can ask me questions about:
- **First Aid Symptoms** (*"dog is vomiting"*, *"kitten has fever"*)
- **Street Emergencies** (*"found bleeding stray"*, *"snake sighting"*)
- **Pet Care & Training** (*"potty training"*, *"diet and food"*, *"vaccination dates"*)
- **Platform Navigation** (*"how to find a vet"*, *"post adoption listing"*, *"lost pet reports"*)

Feel free to click one of the quick prompts below or type your query!`;
  }

  // 17. Default Fallback
  else {
    reply = `🐾 I'm not completely sure about that. I can provide advice on:
- **First Aid Guidance** (*"vomiting"*, *"fever"*, *"wounds"*, *"lethargy"*)
- **Pet Care & Behavior** (*"training tips"*, *"vaccines"*, *"diet"*)
- **Wildlife Sightings** (*"snakes"*, *"wild animals"*)
- **App Navigation** (*"lost pets tracker"*, *"veterinary clinics"*, *"adoption ads"*)

If you are facing a critical animal crisis, please press the **"Emergency Assistance"** button on the Home Dashboard immediately to contact local municipalities, fire stations, or veterinarians directly.`;
  }

  try {
    // Artificial delay to make response feel natural / AI-like
    setTimeout(() => {
      res.json({ success: true, reply });
    }, 450);
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ success: false, message: 'Server error parsing query' });
  }
};
