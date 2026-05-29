// Scans user messages for critical keywords and returns immediate first-aid instructions.
export const detectEmergency = (message) => {
  const msg = message.toLowerCase().trim();

  // Emergency keywords mapping to specific emergency responses
  const emergencyKeywords = [
    {
      keywords: ['bleed', 'blood', 'hemorrhage', 'gash'],
      title: 'Active Bleeding / Deep Wounds',
      instructions: [
        'Apply gentle, steady pressure directly to the wound using a clean cloth, bandage, or sanitary pad.',
        'Elevate the injured limb if possible and keep the animal calm and restricted to slow heart rate.',
        'Do not apply a tight tourniquet unless bleeding is severe and life-threatening, as it can cause tissue death.'
      ]
    },
    {
      keywords: ['unconscious', 'passed out', 'faint', 'collapsed', 'unresponsive'],
      title: 'Unconscious Animal',
      instructions: [
        'Keep the animal\'s neck straight and gently pull the tongue out slightly to ensure a clear airway.',
        'Keep them warm by wrapping them in a blanket and transport them immediately to a vet.',
        'Do not try to feed or force water down the throat of an unresponsive animal.'
      ]
    },
    {
      keywords: ['snake', 'snake bite', 'cobra', 'viper'],
      title: 'Snake Sighting or Snake Bite',
      instructions: [
        'Keep the animal extremely quiet and still to prevent the venom from circulating through the bloodstream.',
        'Do NOT try to cut the bite wound or suck out venom. Note the snake\'s appearance if safe.',
        'Avoid approaching the snake. Report the sighting in PawLink so the Forest Ranger is dispatched immediately.'
      ]
    },
    {
      keywords: ['breath', 'suffocat', 'chok', 'gasp'],
      title: 'Respiratory Distress / Choking',
      instructions: [
        'Carefully open the mouth to check for foreign objects. Only remove it if it can be done safely without being bitten.',
        'If the animal is not breathing, check for a pulse. Perform gentle chest compressions if required.',
        'Minimize stress; keep the area cool and transport them immediately.'
      ]
    },
    {
      keywords: ['seizure', 'convuls', 'fit', 'shak'],
      title: 'Seizure Event',
      instructions: [
        'Do NOT place your hands near or in the animal\'s mouth to prevent severe bite injuries.',
        'Clear the surrounding area of sharp objects or furniture to protect the animal from self-injury.',
        'Keep the lights dim, minimize noise, and time the duration of the seizure for the veterinarian.'
      ]
    },
    {
      keywords: ['fracture', 'broken bone', 'limp', 'accident', 'run over', 'hit by car'],
      title: 'Trauma / Fractured Bone',
      instructions: [
        'Minimize all movement. Do not attempt to splint the bone yourself as this can cause excruciating pain.',
        'Use a rigid board, stretcher, or thick blanket to carefully support and lift the animal.',
        'Muzzle the dog or handle the cat with a towel if they show signs of defensive aggression due to extreme pain.'
      ]
    },
    {
      keywords: ['poison', 'chemical', 'toxic', 'chocolate', 'grapes', 'paracetamol'],
      title: 'Poisoning / Toxin Ingestion',
      instructions: [
        'Identify the chemical, plant, or food ingested. Keep the packaging/label to show the veterinarian.',
        'Do NOT induce vomiting unless explicitly directed by a veterinary professional.',
        'Rinse the mouth with water if the substance was corrosive.'
      ]
    }
  ];

  for (const item of emergencyKeywords) {
    if (item.keywords.some(keyword => msg.includes(keyword))) {
      return {
        isEmergency: true,
        priority: 'HIGH',
        title: item.title,
        reply: `🚨 **HIGH PRIORITY EMERGENCY: ${item.title}**\n\nFirst-aid instructions:\n${item.instructions.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}\n\n📍 **ACTION REQUIRED:**\n- Contact the nearest veterinary hospital immediately.\n- Submit a rescue request or sighting pin under the **"Report Issue"** page of PawLink to notify responders.`
      };
    }
  }

  return null;
};
