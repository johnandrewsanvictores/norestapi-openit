export const getLocationName = (latitude, longitude) => {
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

  regions.forEach(region => {
    const latDiff = latitude - region.lat;
    const lonDiff = longitude - region.lon;
    const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  });

  
  if (minDistance < 0.45) {
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


export const getUserLocationName = () => {
  try {
    const locationData = localStorage.getItem('userLocation');
    if (locationData) {
      const location = JSON.parse(locationData);
      
      if (location.locationName) {
        return location.locationName;
      }
      
      if (location.latitude && location.longitude) {
        const calculatedName = getLocationName(location.latitude, location.longitude);
        
        location.locationName = calculatedName;
        localStorage.setItem('userLocation', JSON.stringify(location));
        
        return calculatedName;
      }
    }
  } catch (error) {
    console.error('Error getting user location name:', error);
  }
  return 'Location not set';
};

