import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAvailableLocations, getCoordinatesFromLocation } from '../utils/earthquakeAlert';
import { getUserLocationName, getGPSLocation, validateGPSLocation } from '../utils/locationHelper';
import { showSuccess, showError } from '../utils/alertHelper';
import api from '../../axios';

const LocationSettings = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState('Location not set');
  const [isUpdating, setIsUpdating] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ latitude: '', longitude: '' });
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    const locationName = getUserLocationName();
    setCurrentLocation(locationName);
    
    const userLocation = localStorage.getItem('userLocation');
    if (userLocation) {
      try {
        const location = JSON.parse(userLocation);
        if (location.manualLocation) {
          setUseManualLocation(true);
        }
        if (location.latitude && location.longitude) {
          setMapCoordinates({
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString()
          });
        }
      } catch (error) {
        console.error('Error parsing user location:', error);
      }
    }
    
    setAvailableLocations(getAvailableLocations());
    initializeMap();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const mapToken = import.meta.env.VITE_MAP_TOKEN || 'pk.eyJ1IjoiamRyZXd3IiwiYSI6ImNtaHB3eWpnYTBjc3EycnF6ZWY4NmJqOHkifQ.tomWXBmHn5UgNicCIlRukQ';
    mapboxgl.accessToken = mapToken;

    setMapLoading(true);
    
    // Get current location or default to Philippines center
    const userLocation = localStorage.getItem('userLocation');
    let center = [121.0, 14.5]; // Default to Philippines center
    let zoom = 6;
    
    if (userLocation) {
      try {
        const location = JSON.parse(userLocation);
        if (location.latitude && location.longitude) {
          center = [location.longitude, location.latitude];
          zoom = 12;
        }
      } catch (error) {
        console.error('Error parsing location for map:', error);
      }
    }
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
      attributionControl: false
    });

    mapRef.current.on('load', () => {
      setMapLoading(false);
      
      // Add click handler to place marker
      mapRef.current.on('click', handleMapClick);
      
      // Show current location marker if available
      if (userLocation) {
        try {
          const location = JSON.parse(userLocation);
          if (location.latitude && location.longitude) {
            placeMarker(location.longitude, location.latitude);
          }
        } catch (error) {
          console.error('Error showing current location on map:', error);
        }
      }
    });

    mapRef.current.on('error', (e) => {
      console.error('Map error:', e);
      setMapLoading(false);
    });
  };

  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;
    
    // Update coordinates
    setMapCoordinates({
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    });

    // Place marker on map
    placeMarker(lng, lat);

    // Fetch address and city automatically
    await fetchAddressFromCoordinates(lat, lng);
  };

  const placeMarker = (lng, lat) => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'custom-location-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#3b82f6';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    }
  };

  const fetchAddressFromCoordinates = async (lat, lng) => {
    setFetchingAddress(true);
    try {
      const response = await api.get('/geocoding/reverse-geocode', {
        params: { latitude: lat, longitude: lng },
        withCredentials: true
      });

      if (response.data.success) {
        const locationName = response.data.locationName || '';
        const components = response.data.components || {};
        const city = components.city || components.town || components.village || components.county || '';
        
        // Save location
        await saveLocationFromMap(lat, lng, locationName, city);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      showError('Failed to fetch address. Location coordinates saved.');
      // Still save the coordinates even if address fetch fails
      await saveLocationFromMap(lat, lng, '', '');
    } finally {
      setFetchingAddress(false);
    }
  };

  const saveLocationFromMap = async (lat, lng, locationName, city) => {
    const locationData = {
      latitude: lat,
      longitude: lng,
      locationName: locationName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      timestamp: new Date().toISOString(),
      manualLocation: locationName || null,
      isGPS: false // Map-selected location is not GPS
    };

    localStorage.setItem('userLocation', JSON.stringify(locationData));
    window.dispatchEvent(new Event('locationUpdated'));
    
    setCurrentLocation(locationData.locationName);
    setUseManualLocation(true);
    
    showSuccess(`Location set to: ${locationData.locationName}`);
  };

  const handleUpdateGPSLocation = () => {
    setIsUpdating(true);
    
    getGPSLocation({
      timeout: 20000, // Give GPS more time to acquire signal
      enableHighAccuracy: true,
      maximumAge: 0
    })
      .then(async (position) => {
        const validation = validateGPSLocation(position);
        
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy,
          isGPS: validation.isGPS, // Use validation result, not hardcoded true
          manualLocation: null // Clear manual location when using GPS
        };
        
        try {
          const { getLocationName } = await import('../utils/locationHelper.js');
          const locationName = await getLocationName(locationData.latitude, locationData.longitude);
          locationData.locationName = locationName;
        } catch (error) {
          console.error('Error getting location name:', error);
          locationData.locationName = `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
        }
        
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        window.dispatchEvent(new Event('locationUpdated'));
        
        setCurrentLocation(locationData.locationName);
        setUseManualLocation(false);
        setMapCoordinates({
          latitude: locationData.latitude.toString(),
          longitude: locationData.longitude.toString()
        });
        setIsUpdating(false);
        
        // Update map to show GPS location
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [locationData.longitude, locationData.latitude],
            zoom: 14,
            duration: 1000
          });
          placeMarker(locationData.longitude, locationData.latitude);
        }
        
        // Show appropriate message based on location type
        let successMessage;
        if (validation.isHighAccuracy) {
          successMessage = `Location updated: ${locationData.locationName} (accuracy: ${Math.round(validation.accuracy)}m - GPS)`;
        } else if (validation.isGPS) {
          successMessage = `Location updated: ${locationData.locationName} (accuracy: ${Math.round(validation.accuracy)}m - moderate GPS accuracy)`;
        } else {
          const accuracyKm = (validation.accuracy / 1000).toFixed(1);
          successMessage = `Location updated: ${locationData.locationName} (accuracy: ${accuracyKm} km - IP-based). For better accuracy, enable GPS or use manual location selection.`;
        }
        showSuccess(successMessage);
      })
      .catch((error) => {
        setIsUpdating(false);
        const errorMsg = error.message || 'Unable to retrieve location. Please try again.';
          showError(errorMsg);
      });
  };

  const handleClearManualLocation = () => {
    setUseManualLocation(false);
    setMapCoordinates({ latitude: '', longitude: '' });
    
    // Remove placement marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    
    // If there's existing GPS location, keep it but remove manual flag
    const userLocation = localStorage.getItem('userLocation');
    if (userLocation) {
      try {
        const location = JSON.parse(userLocation);
        if (location.latitude && location.longitude && !location.manualLocation) {
          // It's a GPS location, keep it
          setCurrentLocation(location.locationName || getUserLocationName());
        } else {
          // Clear the location entirely
          localStorage.removeItem('userLocation');
          setCurrentLocation('Location not set');
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
    
    showSuccess('Manual location cleared. Use "Update GPS Location" to set a new location.');
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4 sm:p-6 border border-gray-800">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
        Location Settings
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">
            Current Location
          </label>
          <div className="bg-[#1A1A1A] border border-gray-600 rounded-lg p-4">
            <p className="text-white font-semibold">{currentLocation}</p>
            {useManualLocation && (
              <p className="text-[#FF7F00] text-xs mt-1">Manually set location</p>
            )}
          </div>
        </div>

        <div>
          <button
            onClick={handleUpdateGPSLocation}
            disabled={isUpdating}
            className="w-full bg-[#FF7F00] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Location...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Update GPS Location</span>
              </>
            )}
          </button>
          <p className="text-gray-400 text-xs mt-2">
            This will request a fresh location from your device. GPS locations are preferred for accuracy, but IP-based locations will also be accepted if GPS is unavailable. For best results, ensure GPS is enabled on your device.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-white font-medium mb-4">Set Location on Map</h3>
          <p className="text-gray-400 text-sm mb-4">
            If your GPS location is inaccurate, click on the map below to set your location. Address and city will be automatically detected.
          </p>
          
          <div className="mb-4">
            <div className="relative h-96 rounded-lg overflow-hidden border border-gray-600 bg-[#1A1A1A]">
              {mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
                  <p className="text-gray-400">Loading map...</p>
                </div>
              )}
              <div ref={mapContainerRef} className="w-full h-full" />
              {fetchingAddress && (
                <div className="absolute top-4 left-4 bg-[#2A2A2A] px-4 py-2 rounded-lg border border-gray-600 z-10">
                  <p className="text-white text-sm">Fetching address...</p>
                </div>
              )}
            </div>
            {(mapCoordinates.latitude && mapCoordinates.longitude) && (
              <div className="mt-2 text-sm text-gray-400">
                Selected: {mapCoordinates.latitude}, {mapCoordinates.longitude}
              </div>
            )}
          </div>

          {useManualLocation && (
            <div className="flex gap-3">
              <button
                onClick={handleClearManualLocation}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Clear Manual Location
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-900/30 border border-blue-800/50 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> Manual location selection overrides GPS location. 
            To use GPS again, click "Update GPS Location" or clear the manual location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationSettings;

