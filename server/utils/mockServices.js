// Static list of mock pet services to serve to pet owners with distance calculations

export const mockPetServices = [
  // Veterinary Hospitals
  {
    id: 'vet-1',
    name: 'Paws & Claws Veterinary Hospital',
    type: 'Veterinary Hospital',
    contact: '+1 (415) 555-0101',
    email: 'info@pawsclaws.com',
    rating: 4.8,
    address: '1420 Valencia St, San Francisco, CA',
    location: { lat: 37.7483, lng: -122.4208 }
  },
  {
    id: 'vet-2',
    name: 'Presidio Pet Emergency Center',
    type: 'Veterinary Hospital',
    contact: '+1 (415) 555-0102',
    email: 'contact@presidiopets.com',
    rating: 4.9,
    address: '812 Marina Blvd, San Francisco, CA',
    location: { lat: 37.8055, lng: -122.4430 }
  },
  {
    id: 'vet-3',
    name: 'Brooklyn Veterinary Center',
    type: 'Veterinary Hospital',
    contact: '+1 (212) 555-0301',
    email: 'nyc@brooklynvet.com',
    rating: 4.7,
    address: '356 Fulton St, Brooklyn, NY',
    location: { lat: 40.6912, lng: -73.9845 }
  },

  // Pet Food Stores
  {
    id: 'food-1',
    name: 'Healthy Pets Organic Food Store',
    type: 'Pet Food Store',
    contact: '+1 (415) 555-0201',
    rating: 4.6,
    address: '2230 Fillmore St, San Francisco, CA',
    location: { lat: 37.7892, lng: -122.4341 }
  },
  {
    id: 'food-2',
    name: 'The Daily Bowl - Custom Dog Food',
    type: 'Pet Food Store',
    contact: '+1 (415) 555-0202',
    rating: 4.8,
    address: '584 Castro St, San Francisco, CA',
    location: { lat: 37.7588, lng: -122.4350 }
  },
  {
    id: 'food-3',
    name: 'Central Park Pet Nutrition Shop',
    type: 'Pet Food Store',
    contact: '+1 (212) 555-0302',
    rating: 4.5,
    address: '150 Columbus Ave, New York, NY',
    location: { lat: 40.7742, lng: -73.9801 }
  },

  // Pet Grooming Salons
  {
    id: 'groom-1',
    name: 'Furry Tails Luxury Pet Grooming',
    type: 'Pet Grooming Salon',
    contact: '+1 (415) 555-0301',
    rating: 4.9,
    address: '400 Gough St, San Francisco, CA',
    location: { lat: 37.7758, lng: -122.4230 }
  },
  {
    id: 'groom-2',
    name: 'Dapper Dog Salon & Spa',
    type: 'Pet Grooming Salon',
    contact: '+1 (415) 555-0302',
    rating: 4.7,
    address: '1802 Divisadero St, San Francisco, CA',
    location: { lat: 37.7865, lng: -122.4402 }
  },
  {
    id: 'groom-3',
    name: 'Broadway Pups Grooming & Spa',
    type: 'Pet Grooming Salon',
    contact: '+1 (212) 555-0303',
    rating: 4.8,
    address: '2105 Broadway, New York, NY',
    location: { lat: 40.7812, lng: -73.9818 }
  },

  // Pet Accessory Shops
  {
    id: 'acc-1',
    name: 'PawShop Modern Collars & Leashes',
    type: 'Pet Accessory Shop',
    contact: '+1 (415) 555-0401',
    rating: 4.7,
    address: '3434 Geary Blvd, San Francisco, CA',
    location: { lat: 37.7818, lng: -122.4555 }
  },
  {
    id: 'acc-2',
    name: 'Barks & Bows Designer Pet Accessories',
    type: 'Pet Accessory Shop',
    contact: '+1 (415) 555-0402',
    rating: 4.5,
    address: '1944 Union St, San Francisco, CA',
    location: { lat: 37.7972, lng: -122.4308 }
  },
  {
    id: 'acc-3',
    name: 'SoHo Pet Boutique & Accessory Center',
    type: 'Pet Accessory Shop',
    contact: '+1 (212) 555-0304',
    rating: 4.9,
    address: '92 Prince St, New York, NY',
    location: { lat: 40.7245, lng: -73.9982 }
  }
];
