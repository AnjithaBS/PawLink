// Offline fallback responses for different intents when AI keys are not configured or are unreachable.

export const offlineResponses = {
  pet_names: `🎀 **PawBot's Pet Name Generator** 🐶🐱
Here are some popular pet name suggestions categorized by style:

- **🐾 Cute Names:**
  - Dogs: Coco, Bella, Teddy, Daisy, Bailey
  - Cats: Luna, Milo, Oliver, Cleo, Nala
- **👑 Royal Names:**
  - Duke, Duchess, Winston, Victoria, Rex, Cleo
- **🌴 Kerala-Style Names:**
  - Chinnu, Appu, Kuttu, Ammu, Mani, Pinky
- **🎭 Anime-Inspired Names:**
  - Naruto, Nezuko, Goku, Zoro, Yuki, Kiba
- **😂 Funny/Unique Names:**
  - Waffles, Sir Fluffington, Pip, Peanut, Captain Paw`,

  vaccination: `💉 **PawLink Pet Vaccination & Deworming Guide**
Regular immunization is vital for keeping your pets safe and healthy:

- **🐕 Core Dog Vaccinations:**
  - **DHPP:** Core booster for Distemper, Hepatitis, Parvovirus, Parainfluenza. Given at 6-8 weeks, 10-12 weeks, and 14-16 weeks.
  - **Rabies:** Given at 12-16 weeks, then boosted annually or every 3 years.
- **🐈 Core Cat Vaccinations:**
  - **FVRCP:** Protects against Rhinotracheitis, Calicivirus, Panleukopenia. Given at 6-8, 10-12, and 14-16 weeks.
  - **Rabies:** Given at 12-16 weeks, then boosted annually.
- **💊 Deworming Protocol:**
  - Puppies and kittens: Deworm at 2, 4, 6, 8 weeks of age, then monthly until 6 months old.
  - Adult pets: Deworm once every 3 to 6 months depending on lifestyle.
- **Action:** Open the **"Health Scheduler"** page in PawLink to log these dates and get reminders!`,

  diet_food: `🍖 **Pet Nutrition & Diet Guidelines**
Keeping a close eye on what your pets eat is the first step to a long, happy life:

- **✅ Healthy Dog Diet:** High-quality protein (chicken, turkey), sweet potatoes, carrots, green beans, and plain rice.
- **🚫 Toxic Foods for Dogs:** Avoid chocolate, grapes, raisins, onions, garlic, macadamia nuts, avocado, caffeine, and xylitol (sweetener).
- **✅ Healthy Cat Diet:** High-protein wet/dry food. Cats are obligate carnivores and require amino acids like taurine from meat.
- **🚫 Toxic Foods for Cats:** Avoid onions, garlic, raw eggs/fish, dairy products (most adult cats are lactose intolerant), and chocolate.
- **⚠️ Safety Tip:** If your pet has consumed a toxic food, seek veterinary help immediately!`,

  training_behavior: `🦮 **Pet Behavioral & Training Tips**
Positive reinforcement and routines are key to training:

- **🚽 Potty Training:** Keep a consistent feeding schedule. Take your puppy out first thing in the morning, after meals, and before bedtime. Reward them with treats instantly when they do it right.
- **🤫 Excessive Barking/Meowing:** Do not yell or respond with attention when they bark/meow. Wait until they are quiet, then reward them. Create a calm, safe space to reduce anxiety.
- **🦷 Chewing & Biting:** Gently redirect biting to chew toys. If they bite during play, make a high-pitched 'Ouch' sound, stop all interaction, and ignore them for 30 seconds.
- **Forum:** Share your training challenges or ask advice in the **"Discussion Forum"** under the **"Training"** category!`,

  nearby_services: `📍 **Locating Nearby Pet Services & Hospitals**
PawLink integrates your device location dynamically:

1. **Get Directions:** Head to the **"Nearby Help"** page on the sidebar.
2. **Enable GPS:** Grant location access when prompted. This centers the map around your current coordinates.
3. **Filter Services:** Use the filters at the top of the map to toggle markers for:
   - 🏥 Veterinary Clinics & Super Specialty Hospitals
   - 🐕 Pet Food & Accessories Supermarkets
   - ✂️ Grooming & Spa Salons
4. **Offline Mode:** If GPS is disabled, the map centers on our default localized Kerala hubs (**Neyyattinkara, Trivandrum**).`,

  app_info: `🐾 **Welcome to PawLink!**
Here is a quick overview of how you can utilize our application features:

- **🚨 Report Issue:** Drop map pins for injured strays or wildlife sightings. It alerts and routes to the closest Fire Force, Forest Rangers, or Vets.
- **🏥 Nearby Help:** Interactive map showing clinics, food, and grooming services.
- **🏡 Adoption Corner:** Rehome rescued strays or find a new pet to adopt.
- **🔍 Lost & Found:** Report lost or sighted missing pets with marker pins.
- **💬 Discussion Forum:** Participate in threads categorized under Health, Training, and Care.
- **📅 Health Scheduler:** Track vaccinations, medications, and set alerts (pet owners only).`,

  general: `🐾 **Hi! I’m PawBot. How can I help your furry friend today?**

I can help you with:
- **Natural language questions** about pets and animals
- **Emergency first aid guidance** (*"my dog is bleeding"*, *"snake bite"*)
- **Pet care recommendations** (*"what should a cat eat"*, *"potty training"*)
- **Vaccination schedules** (*"puppy vaccine guide"*)
- **Generating fun pet names** (*"suggest funny cat names"*)
- **Navigating PawLink features** (*"how to find a vet"*, *"how to report a stray"*)

Feel free to ask me anything or click one of the suggested tags below!`
};
