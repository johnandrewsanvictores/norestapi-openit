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
  const locationMap = {
    'Pacific Ocean, 45km west of San Francisco': [-122.8, 37.7],
    'East Bay Hills, California': [-122.2, 37.8],
    'Hayward Fault, California': [-122.1, 37.6],
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
  
  for (const [key, coords] of Object.entries(locationMap)) {
    if (location.includes(key.split(',')[0]) || key.includes(location.split(',')[0])) {
      return coords;
    }
  }
  
  return [-122.4194, 37.7749]; 
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

  if (userLocation && userLocation.latitude && userLocation.longitude) {
    const earthquakeCoords = getCoordinatesFromLocation(earthquake.location);
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      earthquakeCoords[1], 
      earthquakeCoords[0]  
    );
    
    const alertRadius = parseFloat(alertSettings.alertRadius || 100);
    

    if (distance <= alertRadius) {
      return true;
    }
  }

  return true;
};

