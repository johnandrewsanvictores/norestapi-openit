/**
 * List of evacuation centers in the Philippines
 * Format: { name, latitude, longitude, city }
 */
export const evacuationCenters = [
  // Metro Manila
  { name: 'Rizal Park (Luneta)', latitude: 14.5832, longitude: 120.9817, city: 'Manila' },
  { name: 'Quezon Memorial Circle', latitude: 14.6506, longitude: 121.0497, city: 'Quezon City' },
  { name: 'Araneta Coliseum', latitude: 14.6194, longitude: 121.0531, city: 'Quezon City' },
  { name: 'SM Mall of Asia', latitude: 14.5352, longitude: 120.9821, city: 'Pasay' },
  { name: 'Philippine International Convention Center', latitude: 14.5569, longitude: 121.0194, city: 'Pasay' },
  { name: 'Ninoy Aquino Stadium', latitude: 14.5569, longitude: 121.0194, city: 'Manila' },
  { name: 'Manila City Hall', latitude: 14.5942, longitude: 120.9822, city: 'Manila' },
  { name: 'Quezon City Hall', latitude: 14.6760, longitude: 121.0437, city: 'Quezon City' },
  
  // Cebu
  { name: 'Cebu City Sports Complex', latitude: 10.3157, longitude: 123.8854, city: 'Cebu City' },
  { name: 'Cebu Coliseum', latitude: 10.3157, longitude: 123.8854, city: 'Cebu City' },
  { name: 'Ayala Center Cebu', latitude: 10.3157, longitude: 123.8854, city: 'Cebu City' },
  
  // Davao
  { name: 'Davao City Sports Complex', latitude: 7.1907, longitude: 125.4553, city: 'Davao City' },
  { name: 'SM Lanang Premier', latitude: 7.1907, longitude: 125.4553, city: 'Davao City' },
  
  // Baguio
  { name: 'Burnham Park', latitude: 16.4023, longitude: 120.5960, city: 'Baguio' },
  { name: 'Baguio City Hall', latitude: 16.4023, longitude: 120.5960, city: 'Baguio' },
  
  // Iloilo
  { name: 'Iloilo Sports Complex', latitude: 10.7202, longitude: 122.5621, city: 'Iloilo City' },
  { name: 'SM City Iloilo', latitude: 10.7202, longitude: 122.5621, city: 'Iloilo City' },
  
  // Cagayan de Oro
  { name: 'Cagayan de Oro City Hall', latitude: 8.4542, longitude: 124.6319, city: 'Cagayan de Oro' },
  { name: 'SM CDO Downtown Premier', latitude: 8.4542, longitude: 124.6319, city: 'Cagayan de Oro' },
  
  // Bacolod
  { name: 'Bacolod City Government Center', latitude: 10.6407, longitude: 122.9689, city: 'Bacolod' },
  { name: 'SM City Bacolod', latitude: 10.6407, longitude: 122.9689, city: 'Bacolod' },
  
  // Batangas
  { name: 'Batangas City Plaza', latitude: 13.7565, longitude: 121.0583, city: 'Batangas City' },
  { name: 'SM City Batangas', latitude: 13.7565, longitude: 121.0583, city: 'Batangas City' },
  
  // Makati
  { name: 'Ayala Triangle Gardens', latitude: 14.5547, longitude: 121.0244, city: 'Makati' },
  { name: 'SM Makati', latitude: 14.5547, longitude: 121.0244, city: 'Makati' },
  
  // Taguig
  { name: 'Bonifacio Global City Open Field', latitude: 14.5176, longitude: 121.0509, city: 'Taguig' },
  { name: 'SM Aura Premier', latitude: 14.5176, longitude: 121.0509, city: 'Taguig' },
  
  // Pasig
  { name: 'Pasig City Hall', latitude: 14.5764, longitude: 121.0851, city: 'Pasig' },
  { name: 'SM Megamall', latitude: 14.5764, longitude: 121.0851, city: 'Pasig' },
  
  // Mandaluyong
  { name: 'Mandaluyong City Hall', latitude: 14.5832, longitude: 121.0409, city: 'Mandaluyong' },
  { name: 'SM Megamall', latitude: 14.5832, longitude: 121.0409, city: 'Mandaluyong' },
  
  // Marikina
  { name: 'Marikina Sports Center', latitude: 14.6500, longitude: 121.1000, city: 'Marikina' },
  { name: 'SM City Marikina', latitude: 14.6500, longitude: 121.1000, city: 'Marikina' },
  
  // Lucena
  { name: 'Lucena City Hall', latitude: 13.9314, longitude: 121.6174, city: 'Lucena' },
  { name: 'Lucena City Sports Complex', latitude: 13.9314, longitude: 121.6174, city: 'Lucena' },
  { name: 'Quezon Provincial Capitol', latitude: 13.9314, longitude: 121.6174, city: 'Lucena' },
  { name: 'SM City Lucena', latitude: 13.9314, longitude: 121.6174, city: 'Lucena' },
  { name: 'Lucena City Coliseum', latitude: 13.9314, longitude: 121.6174, city: 'Lucena' },
];

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find the nearest evacuation center to a given location
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Object|null} Nearest evacuation center with distance
 */
export const findNearestEvacuationCenter = (latitude, longitude) => {
  if (!latitude || !longitude) return null;
  
  let nearest = null;
  let minDistance = Infinity;
  
  evacuationCenters.forEach(center => {
    const distance = calculateDistance(latitude, longitude, center.latitude, center.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { ...center, distance };
    }
  });
  
  return nearest;
};

/**
 * Find multiple evacuation centers within a radius
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {number} radiusKm 
 * @returns {Array} Array of evacuation centers within radius, sorted by distance
 */
export const findEvacuationCentersInRadius = (latitude, longitude, radiusKm = 50) => {
  if (!latitude || !longitude) return [];
  
  const centers = evacuationCenters
    .map(center => ({
      ...center,
      distance: calculateDistance(latitude, longitude, center.latitude, center.longitude)
    }))
    .filter(center => center.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
  
  return centers;
};

