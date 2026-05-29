// Classifies user message into specific conversational intents for customized AI steering or offline fallbacks.
export const detectIntent = (message) => {
  const msg = message.toLowerCase().trim();

  // 1. Pet Name Generator Intent
  if (
    msg.includes('name') || 
    msg.includes('names') || 
    msg.includes('rename') || 
    msg.includes('call my')
  ) {
    return 'pet_names';
  }

  // 2. Vaccination Intent
  if (
    msg.includes('vaccin') || 
    msg.includes('schedule') || 
    msg.includes('shot') || 
    msg.includes('booster') || 
    msg.includes('deworm') || 
    msg.includes('rabies') || 
    msg.includes('immuniz')
  ) {
    return 'vaccination';
  }

  // 3. Pet Food/Diet Intent
  if (
    msg.includes('food') || 
    msg.includes('diet') || 
    msg.includes('feed') || 
    msg.includes('eat') || 
    msg.includes('nutrition') || 
    msg.includes('treat') || 
    msg.includes('chocolate') || 
    msg.includes('toxic') || 
    msg.includes('poison')
  ) {
    return 'diet_food';
  }

  // 4. Training / Behavior Intent
  if (
    msg.includes('train') || 
    msg.includes('bark') || 
    msg.includes('bite') || 
    msg.includes('chew') || 
    msg.includes('potty') || 
    msg.includes('litter') || 
    msg.includes('housebreak') || 
    msg.includes('scratch') || 
    msg.includes('behavior') || 
    msg.includes('aggress')
  ) {
    return 'training_behavior';
  }

  // 5. Nearby Services / Vets Intent
  if (
    msg.includes('vet') || 
    msg.includes('clinic') || 
    msg.includes('hospital') || 
    msg.includes('doctor') || 
    msg.includes('shop') || 
    msg.includes('store') || 
    msg.includes('groom') || 
    msg.includes('salon') || 
    msg.includes('nearby') || 
    msg.includes('find a') || 
    msg.includes('locate')
  ) {
    return 'nearby_services';
  }

  // 6. General info about PawLink App
  if (
    msg.includes('pawlink') || 
    msg.includes('about') || 
    msg.includes('app') || 
    msg.includes('features') || 
    msg.includes('how to') || 
    msg.includes('support') || 
    msg.includes('help')
  ) {
    return 'app_info';
  }

  return 'general';
};
