import api from '../../axios.js';

// Haversine formula to calculate distance in kilometers (kept as fallback)
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
 * Validates if a geolocation position is from GPS (not IP-based)
 * IP-based locations typically have accuracy > 1000m, while GPS should be < 100m
 * @param {GeolocationPosition} position - The geolocation position object
 * @returns {Object} - { isValid: boolean, isGPS: boolean, accuracy: number, message: string }
 */
export const validateGPSLocation = (position) => {
  if (!position || !position.coords) {
    return {
      isValid: false,
      isGPS: false,
      accuracy: Infinity,
      message: 'Invalid position data'
    };
  }

  const accuracy = position.coords.accuracy; // in meters
  const hasAltitude = position.coords.altitude !== null && position.coords.altitude !== undefined;
  const hasAltitudeAccuracy = position.coords.altitudeAccuracy !== null && position.coords.altitudeAccuracy !== undefined;
  const hasHeading = position.coords.heading !== null && position.coords.heading !== undefined;
  const hasSpeed = position.coords.speed !== null && position.coords.speed !== undefined;

  // GPS typically provides:
  // - Accuracy < 100m (usually 10-50m)
  // - Altitude information
  // - Heading and speed (when moving)
  
  // IP-based geolocation typically provides:
  // - Accuracy > 1000m (often 5000m+)
  // - No altitude, heading, or speed

  // Accept all locations, but classify them based on accuracy
  const MAX_GPS_ACCURACY = 500; // meters - locations with better accuracy are considered GPS
  const isGPS = accuracy < MAX_GPS_ACCURACY;
  const isHighAccuracy = accuracy < 100;
  
  // Always return valid, but provide information about accuracy
  if (isHighAccuracy) {
    return {
      isValid: true,
      isGPS: true,
      accuracy: accuracy,
      isHighAccuracy: true,
      message: `GPS location acquired (accuracy: ${Math.round(accuracy)}m)`
    };
  } else if (isGPS) {
    return {
      isValid: true,
      isGPS: true,
      accuracy: accuracy,
      isHighAccuracy: false,
      message: `Location acquired with moderate accuracy (${Math.round(accuracy)}m). For better accuracy, ensure GPS is enabled.`
    };
  } else {
    // IP-based or low accuracy location - accept it but inform user
    const accuracyKm = (accuracy / 1000).toFixed(1);
    return {
      isValid: true,
      isGPS: false,
      accuracy: accuracy,
      isHighAccuracy: false,
      message: `Location acquired (accuracy: ${accuracyKm} km). This appears to be IP-based location. For more accurate earthquake alerts, enable GPS or use manual location selection in Settings.`
    };
  }
};

/**
 * Gets GPS location with validation
 * @param {Object} options - Geolocation options
 * @returns {Promise<GeolocationPosition>}
 */
export const getGPSLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true, // Force GPS, not IP-based
      timeout: 20000, // Increased timeout to give GPS more time
      maximumAge: 0 // Always get fresh location
    };

    const geolocationOptions = { ...defaultOptions, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const validation = validateGPSLocation(position);
        
        if (!validation.isValid) {
          reject(new Error(validation.message));
          return;
        }

        // Log accuracy for debugging
        if (validation.isGPS) {
          console.log(`Location acquired: accuracy ${Math.round(validation.accuracy)}m (GPS)`);
        } else {
          const accuracyKm = (validation.accuracy / 1000).toFixed(1);
          console.log(`Location acquired: accuracy ${accuracyKm} km (IP-based)`);
        }
        
        resolve(position);
      },
      (error) => {
        let errorMessage = 'Unable to get GPS location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please ensure GPS is enabled on your device.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again and ensure GPS is enabled.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      geolocationOptions
    );
  });
};

// Fallback function using hardcoded regions (used when API fails)
const getLocationNameFallback = (latitude, longitude) => {
  const regions = [
    { name: 'Manila, Philippines', lat: 14.5995, lon: 120.9842 },
    { name: 'Quezon City, Philippines', lat: 14.6760, lon: 121.0437 },
    { name: 'Makati, Philippines', lat: 14.5547, lon: 121.0244 },
    { name: 'Cebu City, Philippines', lat: 10.3157, lon: 123.8854 },
    { name: 'Davao City, Philippines', lat: 7.1907, lon: 125.4553 },
    { name: 'Baguio, Philippines', lat: 16.4023, lon: 120.5960 },
    { name: 'Iloilo City, Philippines', lat: 10.7202, lon: 122.5621 },
    { name: 'Cagayan de Oro, Philippines', lat: 8.4542, lon: 124.6319 },
    { name: 'Bacolod, Philippines', lat: 10.6407, lon: 122.9689 },
    { name: 'Zamboanga City, Philippines', lat: 6.9214, lon: 122.0790 },
    { name: 'Batangas City, Philippines', lat: 13.7565, lon: 121.0583 },
    { name: 'Lucena, Philippines', lat: 13.9314, lon: 121.6174 },
    { name: 'Calamba, Philippines', lat: 14.2117, lon: 121.1653 },
    { name: 'Antipolo, Philippines', lat: 14.6255, lon: 121.1245 },
    { name: 'Pasig, Philippines', lat: 14.5764, lon: 121.0851 },
    { name: 'Taguig, Philippines', lat: 14.5176, lon: 121.0509 },
    { name: 'Las Piñas, Philippines', lat: 14.4506, lon: 120.9828 },
    { name: 'Parañaque, Philippines', lat: 14.4793, lon: 121.0198 },
    { name: 'Valenzuela, Philippines', lat: 14.7000, lon: 120.9833 },
    { name: 'Caloocan, Philippines', lat: 14.6546, lon: 120.9840 },
    { name: 'Malabon, Philippines', lat: 14.6626, lon: 120.9569 },
    { name: 'Navotas, Philippines', lat: 14.6500, lon: 120.9500 },
    { name: 'Muntinlupa, Philippines', lat: 14.4081, lon: 121.0455 },
    { name: 'Marikina, Philippines', lat: 14.6500, lon: 121.1000 },
    { name: 'San Juan, Philippines', lat: 14.6019, lon: 121.0356 },
    { name: 'Mandaluyong, Philippines', lat: 14.5832, lon: 121.0409 },
    { name: 'Pasay, Philippines', lat: 14.5378, lon: 120.9969 },
    { name: 'Pateros, Philippines', lat: 14.5406, lon: 121.0681 }
  ];

  let closestRegion = regions[0];
  let minDistance = Infinity;

  // Use Haversine formula for accurate distance calculation
  regions.forEach(region => {
    const distance = calculateDistance(latitude, longitude, region.lat, region.lon);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  });

  // Use 25km threshold for city matching (more accurate)
  if (minDistance < 25) {
    return closestRegion.name;
  } else {
    if (latitude >= 14.0 && latitude <= 15.0 && longitude >= 120.0 && longitude <= 121.5) {
      return 'Metro Manila Area, Philippines';
    } else if (latitude >= 13.5 && latitude <= 14.5 && longitude >= 120.5 && longitude <= 122.0) {
      return 'Calabarzon Region, Philippines';
    } else if (latitude >= 10.0 && latitude <= 11.0 && longitude >= 123.0 && longitude <= 124.0) {
      return 'Cebu Area, Philippines';
    } else if (latitude >= 6.0 && latitude <= 8.0 && longitude >= 124.0 && longitude <= 126.0) {
      return 'Mindanao Region, Philippines';
    } else if (latitude >= 16.0 && latitude <= 18.0 && longitude >= 120.0 && longitude <= 121.0) {
      return 'Northern Luzon, Philippines';
    } else {
      return `Philippines (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
    }
  }
};

// Main function using OpenCage API for accurate reverse geocoding
export const getLocationName = async (latitude, longitude) => {
  try {
    // Call the backend API endpoint for reverse geocoding
    const response = await api.get('/geocoding/reverse-geocode', {
      params: {
        latitude,
        longitude
      }
    });

    if (response.data && response.data.success && response.data.locationName) {
      return response.data.locationName;
    } else {
      // Fallback to hardcoded regions if API returns no result
      console.warn('OpenCage API returned no location, using fallback');
      return getLocationNameFallback(latitude, longitude);
    }
  } catch (error) {
    // Fallback to hardcoded regions if API call fails
    console.error('Error calling reverse geocoding API:', error);
    return getLocationNameFallback(latitude, longitude);
  }
};

// Synchronous version for backward compatibility (uses cached location name)
export const getUserLocationName = () => {
  try {
    const locationData = localStorage.getItem('userLocation');
    if (locationData) {
      const location = JSON.parse(locationData);
      
      if (location.locationName) {
        return location.locationName;
      }
      
      // If location name is not cached, return coordinates as fallback
      if (location.latitude && location.longitude) {
        return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
      }
    }
  } catch (error) {
    console.error('Error getting user location name:', error);
  }
  return 'Location not set';
};
