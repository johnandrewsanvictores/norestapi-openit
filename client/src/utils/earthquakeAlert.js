/**
 * @param {number} lat1 
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} 
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
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
 * @returns {Object|null}
 */
export const getUserLocation = () => {
  try {
    const locationData = localStorage.getItem('userLocation');
    if (locationData) {
      return JSON.parse(locationData);
    }
  } catch (error) {
    console.error('Error getting user location:', error);
  }
  return null;
};

/**
 * @returns {Object} 
 */
export const getAlertSettings = () => {
  try {
    const settings = localStorage.getItem('alertSettings');
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Error getting alert settings:', error);
  }
  return {
    minMagnitude: 3.0,
    alertRadius: 100 
  };
};

/**
 * @param {string} location 
 * @returns {Array} [longitude, latitude]
 */
export const getCoordinatesFromLocation = (location) => {
  // Philippines locations
  const philippinesMap = {
    'Manila, Philippines': [120.9842, 14.5995],
    'Quezon City, Philippines': [121.0437, 14.6760],
    'Makati, Philippines': [121.0244, 14.5547],
    'Taguig, Philippines': [121.0509, 14.5176],
    'Pasig, Philippines': [121.0851, 14.5764],
    'Mandaluyong, Philippines': [121.0409, 14.5832],
    'Marikina, Philippines': [121.1000, 14.6500],
    'Las Piñas, Philippines': [120.9828, 14.4506],
    'Parañaque, Philippines': [121.0198, 14.4793],
    'Muntinlupa, Philippines': [121.0455, 14.4081],
    'Caloocan, Philippines': [120.9840, 14.6546],
    'Valenzuela, Philippines': [120.9833, 14.7000],
    'Malabon, Philippines': [120.9569, 14.6626],
    'Navotas, Philippines': [120.9500, 14.6500],
    'San Juan, Philippines': [121.0356, 14.6019],
    'Pasay, Philippines': [120.9969, 14.5378],
    'Pateros, Philippines': [121.0681, 14.5406],
    'Antipolo, Philippines': [121.1245, 14.6255],
    'Cebu City, Philippines': [123.8854, 10.3157],
    'Davao City, Philippines': [125.4553, 7.1907],
    'Baguio, Philippines': [120.5960, 16.4023],
    'Iloilo City, Philippines': [122.5621, 10.7202],
    'Cagayan de Oro, Philippines': [124.6319, 8.4542],
    'Bacolod, Philippines': [122.9689, 10.6407],
    'Zamboanga City, Philippines': [122.0790, 6.9214],
    'Batangas City, Philippines': [121.0583, 13.7565],
    'Lucena, Philippines': [121.6174, 13.9314],
    'Calamba, Philippines': [121.1653, 14.2117],
    'Tagaytay, Philippines': [120.9333, 14.1000],
    'Puerto Princesa, Philippines': [118.7369, 9.7392],
    'Legazpi, Philippines': [123.7344, 13.1394],
    'Naga, Philippines': [123.1833, 13.6192],
    'Angeles, Philippines': [120.5900, 15.1475],
    'Olongapo, Philippines': [120.2833, 14.8292],
    'San Fernando, Pampanga, Philippines': [120.6861, 15.0300],
    'Lipa, Philippines': [121.1631, 13.9411],
    'San Pablo, Philippines': [121.3256, 14.0703],
    'Tarlac City, Philippines': [120.5900, 15.4869],
    'Cabanatuan, Philippines': [120.9667, 15.4833],
    'Malolos, Philippines': [120.8111, 14.8431]
  };
  
  // USA locations (for reference)
  const usaMap = {
    'San Francisco, CA': [-122.4194, 37.7749],
    'Los Angeles, CA': [-118.2437, 34.0522],
    'Fresno, CA': [-119.7871, 36.7378],
    'San Jose, CA': [-121.8863, 37.3382],
    'San Diego, CA': [-117.1611, 32.7157],
    'Sacramento, CA': [-121.4944, 38.5816],
    'Oakland, CA': [-122.2711, 37.8044],
    'Long Beach, CA': [-118.1937, 33.7701],
    'Bakersfield, CA': [-119.0187, 35.3733],
    'Anaheim, CA': [-117.9143, 33.8353]
  };
  
  // Combine all location maps
  const locationMap = { ...philippinesMap, ...usaMap };
  
  // Try exact match first
  if (locationMap[location]) {
    return locationMap[location];
  }
  
  // Try partial match
  for (const [key, coords] of Object.entries(locationMap)) {
    const keyCity = key.split(',')[0].trim();
    const locationCity = location.split(',')[0].trim();
    
    if (location.toLowerCase().includes(keyCity.toLowerCase()) || 
        key.toLowerCase().includes(locationCity.toLowerCase())) {
      return coords;
    }
  }
  
  // Default to Manila, Philippines if no match
  return [120.9842, 14.5995];
};

/**
 * @param {Object} earthquake 
 * @returns {boolean} 
 */
export const shouldShowAlert = (earthquake) => {
  if (!earthquake || !earthquake.magnitude) return false;

  const userLocation = getUserLocation();
  const alertSettings = getAlertSettings();
  
  const magnitude = parseFloat(earthquake.magnitude);
  const minMagnitude = parseFloat(alertSettings.minMagnitude || 3.0);
  
  if (magnitude < minMagnitude) {
    return false;
  }

  // Get earthquake coordinates
  let earthquakeLat, earthquakeLon;
  
  if (earthquake.latitude && earthquake.longitude) {
    earthquakeLat = parseFloat(earthquake.latitude);
    earthquakeLon = parseFloat(earthquake.longitude);
  } else {
    const earthquakeCoords = getCoordinatesFromLocation(earthquake.location || '');
    earthquakeLon = earthquakeCoords[0];
    earthquakeLat = earthquakeCoords[1];
  }
  
  // Determine which location to use for distance calculation
  let alertLocationLat, alertLocationLon;
  
  // If alert settings have a location, use that
  if (alertSettings.location) {
    const alertCoords = getCoordinatesFromLocation(alertSettings.location);
    alertLocationLon = alertCoords[0];
    alertLocationLat = alertCoords[1];
  } 
  // Otherwise, use user's GPS location if available
  else if (userLocation && userLocation.latitude && userLocation.longitude) {
    alertLocationLat = userLocation.latitude;
    alertLocationLon = userLocation.longitude;
  }
  // If no location at all, show alert based on magnitude only
  else {
    return true;
  }
  
  // Calculate distance from alert location to earthquake
  const distance = calculateDistance(
    alertLocationLat,
    alertLocationLon,
    earthquakeLat,
    earthquakeLon
  );
  
  const alertRadius = parseFloat(alertSettings.alertRadius || 100);
  
  // Show alert if earthquake is within alert radius
  return distance <= alertRadius;
};

