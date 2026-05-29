// Static list of mock pet services across Kerala
// Localized Hubs: Vizhinjam, Balaramapuram, Uchakkada, Neyyattinkara, Trivandrum City, Kochi, Calicut, Thrissur

export const mockPetServices = [
  // ==========================================
  // VETERINARY HOSPITALS & CLINICS
  // ==========================================
  {
    id: 'vet-neyyattinkara',
    name: 'Neyyattinkara Veterinary Super Specialty Hospital',
    type: 'Veterinary Hospital',
    contact: '+91 471 222 2244',
    email: 'nyr@keralavet.gov.in',
    rating: 4.7,
    address: 'Hospital Road, Near Alummoodu Junction, Neyyattinkara, Kerala 695121',
    location: { lat: 8.4024, lng: 77.0822 }
  },
  {
    id: 'vet-vizhinjam',
    name: 'Vizhinjam Harbour Pet Clinic',
    type: 'Veterinary Hospital',
    contact: '+91 471 248 0200',
    email: 'vizhinjam@vets.in',
    rating: 4.5,
    address: 'Harbour Road, Near Transit Terminal, Vizhinjam, Thiruvananthapuram, Kerala 695521',
    location: { lat: 8.3768, lng: 76.9912 }
  },
  {
    id: 'vet-balaramapuram',
    name: 'Balaramapuram Animal Wellness Center',
    type: 'Veterinary Hospital',
    contact: '+91 94470 88991',
    email: 'balaramapuram.vet@gmail.com',
    rating: 4.6,
    address: 'Main Road, Near Handloom Junction, Balaramapuram, Kerala 695501',
    location: { lat: 8.4312, lng: 77.0375 }
  },
  {
    id: 'vet-uchakada',
    name: 'Uchakkada Community Veterinary Clinic',
    type: 'Veterinary Hospital',
    contact: '+91 98460 33221',
    email: 'uchakkada.vet@kerala.gov.in',
    rating: 4.3,
    address: 'Uchakkada Junction, Kanjiramkulam-Poovar Road, Uchakkada, Kerala 695506',
    location: { lat: 8.3514, lng: 77.0628 }
  },
  {
    id: 'vet-tvm-city',
    name: 'Government Chief Veterinary Hospital',
    type: 'Veterinary Hospital',
    contact: '+91 471 232 0101',
    rating: 4.6,
    address: 'Palayam, Thiruvananthapuram, Kerala 695033',
    location: { lat: 8.5061, lng: 76.9515 }
  },
  {
    id: 'vet-ekm',
    name: 'Cochin Pet Hospital & Research Centre',
    type: 'Veterinary Hospital',
    contact: '+91 484 234 5678',
    rating: 4.8,
    address: 'Kadavanthra, Ernakulam, Kochi, Kerala 682020',
    location: { lat: 9.9674, lng: 76.2998 }
  },

  // ==========================================
  // PET FOOD & SUPPLIES STORES
  // ==========================================
  {
    id: 'food-balaramapuram',
    name: 'Sree Bhadra Pet Feeds & Accessories',
    type: 'Pet Food Store',
    contact: '+91 90482 11223',
    rating: 4.4,
    address: 'National Highway 66, Near Junction, Balaramapuram, Kerala 695501',
    location: { lat: 8.4320, lng: 77.0390 }
  },
  {
    id: 'food-neyyattinkara',
    name: 'Neyyar Pet Food Zone',
    type: 'Pet Food Store',
    contact: '+91 97441 55667',
    rating: 4.6,
    address: 'TB Junction, Near KSRTC Depot, Neyyattinkara, Kerala 695121',
    location: { lat: 8.4065, lng: 77.0864 }
  },
  {
    id: 'food-uchakada',
    name: 'Manna Pet Mart Uchakkada',
    type: 'Pet Food Store',
    contact: '+91 80862 77889',
    rating: 4.2,
    address: 'Market Road, Uchakkada, Kerala 695506',
    location: { lat: 8.3520, lng: 77.0642 }
  },
  {
    id: 'food-vizhinjam',
    name: 'Coastal Pet Feeds & Aquarium Supplies',
    type: 'Pet Food Store',
    contact: '+91 95625 44332',
    rating: 4.3,
    address: 'Mathipuram Road, Vizhinjam, Thiruvananthapuram, Kerala 695521',
    location: { lat: 8.3812, lng: 76.9885 }
  },
  {
    id: 'food-tvm-city',
    name: 'Royal Pet Food & Nutrition Center',
    type: 'Pet Food Store',
    contact: '+91 94460 54321',
    rating: 4.4,
    address: 'MG Road, Thiruvananthapuram, Kerala 695001',
    location: { lat: 8.4925, lng: 76.9472 }
  },
  {
    id: 'food-ekm',
    name: 'Kerala Pet Supermarket',
    type: 'Pet Food Store',
    contact: '+91 98470 12345',
    rating: 4.5,
    address: 'Vyttila Bypass, Kochi, Kerala 682019',
    location: { lat: 9.9692, lng: 76.3214 }
  },

  // ==========================================
  // PET GROOMING SALONS & SPAS
  // ==========================================
  {
    id: 'groom-neyyattinkara',
    name: 'Royal Paws Pet Grooming Hub',
    type: 'Pet Grooming Salon',
    contact: '+91 85920 12121',
    rating: 4.7,
    address: 'Krishna Nagar, Near Municipal Office, Neyyattinkara, Kerala 695121',
    location: { lat: 8.3995, lng: 77.0810 }
  },
  {
    id: 'groom-balaramapuram',
    name: 'Smart Tails Dog Grooming Studio',
    type: 'Pet Grooming Salon',
    contact: '+91 70129 44556',
    rating: 4.5,
    address: 'Ooruttambalam Road, Balaramapuram, Kerala 695501',
    location: { lat: 8.4355, lng: 77.0421 }
  },
  {
    id: 'groom-vizhinjam',
    name: 'Ocean Breeze Pet Spa',
    type: 'Pet Grooming Salon',
    contact: '+91 91882 66778',
    rating: 4.6,
    address: 'Kovalam-Vizhinjam Road, Thiruvananthapuram, Kerala 695521',
    location: { lat: 8.3884, lng: 76.9823 }
  },
  {
    id: 'groom-uchakada',
    name: 'Village Pet Care & Bath',
    type: 'Pet Grooming Salon',
    contact: '+91 94951 88990',
    rating: 4.1,
    address: 'Near Uchakkada Post Office, Uchakkada, Kerala 695506',
    location: { lat: 8.3502, lng: 77.0610 }
  },
  {
    id: 'groom-tvm-city',
    name: 'Scooby Doo Grooming Studio',
    type: 'Pet Grooming Salon',
    contact: '+91 98952 77889',
    rating: 4.7,
    address: 'Kazhakkoottam, Thiruvananthapuram, Kerala 695582',
    location: { lat: 8.5686, lng: 76.8731 }
  },
  {
    id: 'groom-ekm',
    name: 'Paws & Tails Luxury Grooming Salon',
    type: 'Pet Grooming Salon',
    contact: '+91 484 405 2211',
    rating: 4.9,
    address: 'Panampilly Nagar, Ernakulam, Kochi, Kerala 682036',
    location: { lat: 9.9622, lng: 76.2941 }
  },

  // ==========================================
  // PET ACCESSORY SHOPS
  // ==========================================
  {
    id: 'acc-neyyattinkara',
    name: 'Neyyar Pet Styles & Fancy Boutique',
    type: 'Pet Accessory Shop',
    contact: '+91 75610 33445',
    rating: 4.6,
    address: 'Main Road, Opposite Girls High School, Neyyattinkara, Kerala 695121',
    location: { lat: 8.4038, lng: 77.0840 }
  },
  {
    id: 'acc-balaramapuram',
    name: 'Handloom & Leash Pet Boutique',
    type: 'Pet Accessory Shop',
    contact: '+91 81390 99887',
    rating: 4.8,
    address: 'Chalai Bazaar Road, Balaramapuram, Kerala 695501',
    location: { lat: 8.4305, lng: 77.0350 }
  },
  {
    id: 'acc-vizhinjam',
    name: 'Port-Side Premium Pet Accessories',
    type: 'Pet Accessory Shop',
    contact: '+91 97471 22334',
    rating: 4.4,
    address: 'Adimalathura-Vizhinjam Road, Vizhinjam, Kerala 695521',
    location: { lat: 8.3695, lng: 76.9988 }
  },
  {
    id: 'acc-uchakada',
    name: 'Border Pets Outpost',
    type: 'Pet Accessory Shop',
    contact: '+91 90612 11002',
    rating: 4.3,
    address: 'Kaliyakkavilai Road, Uchakkada, Kerala 695506',
    location: { lat: 8.3535, lng: 77.0660 }
  },
  {
    id: 'acc-tvm-city',
    name: 'Kowdiar Pet Luxury & Accessories',
    type: 'Pet Accessory Shop',
    contact: '+91 81290 88776',
    rating: 4.5,
    address: 'Kowdiar Avenue, Thiruvananthapuram, Kerala 695003',
    location: { lat: 8.5243, lng: 76.9632 }
  },
  {
    id: 'acc-ekm',
    name: 'Wagging Tails Premium Pet Boutique',
    type: 'Pet Accessory Shop',
    contact: '+91 70120 99001',
    rating: 4.7,
    address: 'Lulu Mall Road, Edappally, Kochi, Kerala 682024',
    location: { lat: 10.0261, lng: 76.3125 }
  }
];
