/**
 * Location data organized by country
 */

// Detect country from coordinates
export const detectCountry = (latitude, longitude) => {
  // Philippines bounds: approximately 5°N to 20°N, 115°E to 130°E
  if (latitude >= 5 && latitude <= 20 && longitude >= 115 && longitude <= 130) {
    return 'Philippines';
  }
  
  // USA bounds: approximately 25°N to 50°N, 125°W to 65°W
  if (latitude >= 25 && latitude <= 50 && longitude >= -125 && longitude <= -65) {
    return 'USA';
  }
  
  // Default to Philippines for this app
  return 'Philippines';
};

// Philippines major cities and regions
export const philippinesLocations = [
  'Manila, Philippines',
  'Quezon City, Philippines',
  'Makati, Philippines',
  'Taguig, Philippines',
  'Pasig, Philippines',
  'Mandaluyong, Philippines',
  'Marikina, Philippines',
  'Las Piñas, Philippines',
  'Parañaque, Philippines',
  'Muntinlupa, Philippines',
  'Caloocan, Philippines',
  'Valenzuela, Philippines',
  'Malabon, Philippines',
  'Navotas, Philippines',
  'San Juan, Philippines',
  'Pasay, Philippines',
  'Pateros, Philippines',
  'Antipolo, Philippines',
  'Cebu City, Philippines',
  'Davao City, Philippines',
  'Baguio, Philippines',
  'Iloilo City, Philippines',
  'Cagayan de Oro, Philippines',
  'Bacolod, Philippines',
  'Zamboanga City, Philippines',
  'Batangas City, Philippines',
  'Lucena, Philippines',
  'Calamba, Philippines',
  'Tagaytay, Philippines',
  'Puerto Princesa, Philippines',
  'Legazpi, Philippines',
  'Naga, Philippines',
  'Angeles, Philippines',
  'Olongapo, Philippines',
  'San Fernando, Pampanga, Philippines',
  'Lipa, Philippines',
  'San Pablo, Philippines',
  'Tarlac City, Philippines',
  'Cabanatuan, Philippines',
  'Malolos, Philippines'
];

// USA locations (for reference, though app is focused on Philippines)
export const usaLocations = [
  'San Francisco, CA',
  'Los Angeles, CA',
  'San Diego, CA',
  'San Jose, CA',
  'Fresno, CA',
  'Sacramento, CA',
  'Oakland, CA',
  'Long Beach, CA',
  'Bakersfield, CA',
  'Anaheim, CA'
];

// Get locations based on country
export const getLocationsByCountry = (country) => {
  switch (country) {
    case 'Philippines':
      return philippinesLocations;
    case 'USA':
      return usaLocations;
    default:
      return philippinesLocations; // Default to Philippines
  }
};

// Get user's country from their location
export const getUserCountry = () => {
  try {
    const locationData = localStorage.getItem('userLocation');
    if (locationData) {
      const location = JSON.parse(locationData);
      if (location.latitude && location.longitude) {
        return detectCountry(location.latitude, location.longitude);
      }
    }
  } catch (error) {
    console.error('Error getting user country:', error);
  }
  return 'Philippines'; // Default
};

