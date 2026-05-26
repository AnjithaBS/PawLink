import { mockPetServices } from '../utils/mockServices.js';

// Haversine distance helper in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Get nearby pet services grouped by category, sorted by distance
// @route   GET /api/nearby
// @access  Private
export const getNearbyServices = async (req, res) => {
  const { lat, lng, radius } = req.query;

  // Fallback default coordinates (San Francisco) if not provided by browser geolocation
  const userLat = lat ? parseFloat(lat) : 37.7749;
  const userLng = lng ? parseFloat(lng) : -122.4194;
  const maxRadius = radius ? parseFloat(radius) : 50; // default 50km radius

  try {
    // Map services, calculate distance, and sort
    const servicesWithDistance = mockPetServices.map(service => {
      const distance = calculateDistance(
        userLat,
        userLng,
        service.location.lat,
        service.location.lng
      );
      return {
        ...service,
        distance: parseFloat(distance.toFixed(2)) // 2 decimal precision
      };
    });

    // Sort by proximity
    const sortedServices = servicesWithDistance.sort((a, b) => a.distance - b.distance);

    // Group by service type
    const groupedServices = {
      veterinary: sortedServices.filter(s => s.type === 'Veterinary Hospital'),
      food: sortedServices.filter(s => s.type === 'Pet Food Store'),
      grooming: sortedServices.filter(s => s.type === 'Pet Grooming Salon'),
      accessories: sortedServices.filter(s => s.type === 'Pet Accessory Shop')
    };

    res.json({
      success: true,
      userLocation: { lat: userLat, lng: userLng },
      count: sortedServices.length,
      grouped: groupedServices,
      all: sortedServices
    });
  } catch (error) {
    console.error('Get Nearby Services Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error calculating nearby services' });
  }
};
