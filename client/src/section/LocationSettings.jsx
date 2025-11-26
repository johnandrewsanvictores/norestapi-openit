import React, { useState, useEffect } from 'react';
import { getAvailableLocations, getCoordinatesFromLocation } from '../utils/earthquakeAlert';
import { getUserLocationName } from '../utils/locationHelper';
import { showSuccess, showError } from '../utils/alertHelper';

const LocationSettings = () => {
  const [currentLocation, setCurrentLocation] = useState('Location not set');
  const [isUpdating, setIsUpdating] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
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
          setManualLocation(location.manualLocation);
        }
      } catch (error) {
        console.error('Error parsing user location:', error);
      }
    }
    
    setAvailableLocations(getAvailableLocations());
  }, []);

  const handleUpdateGPSLocation = () => {
    setIsUpdating(true);
    
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser');
      setIsUpdating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy,
          manualLocation: null // Clear manual location when using GPS
        };
        
        try {
          const { getLocationName } = await import('../utils/locationHelper.js');
          const locationName = getLocationName(locationData.latitude, locationData.longitude);
          locationData.locationName = locationName;
        } catch (error) {
          console.error('Error getting location name:', error);
          locationData.locationName = `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
        }
        
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        window.dispatchEvent(new Event('locationUpdated'));
        
        setCurrentLocation(locationData.locationName);
        setUseManualLocation(false);
        setManualLocation('');
        setIsUpdating(false);
        
        showSuccess(`Location updated: ${locationData.locationName}`);
      },
      (error) => {
        setIsUpdating(false);
        if (error.code === error.PERMISSION_DENIED) {
          showError('Location permission denied. Please enable location access in your browser settings.');
        } else if (error.code === error.TIMEOUT) {
          showError('Location request timed out. Please try again.');
        } else {
          showError('Unable to retrieve your location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleSaveManualLocation = () => {
    if (!manualLocation) {
      showError('Please select a location');
      return;
    }

    const coords = getCoordinatesFromLocation(manualLocation);
    const locationData = {
      latitude: coords[1],
      longitude: coords[0],
      locationName: manualLocation,
      timestamp: new Date().toISOString(),
      manualLocation: manualLocation
    };

    localStorage.setItem('userLocation', JSON.stringify(locationData));
    window.dispatchEvent(new Event('locationUpdated'));
    
    setCurrentLocation(manualLocation);
    setUseManualLocation(true);
    
    showSuccess(`Location set to: ${manualLocation}`);
  };

  const handleClearManualLocation = () => {
    setUseManualLocation(false);
    setManualLocation('');
    
    // If there's existing GPS location, keep it but remove manual flag
    const userLocation = localStorage.getItem('userLocation');
    if (userLocation) {
      try {
        const location = JSON.parse(userLocation);
        if (location.latitude && location.longitude) {
          delete location.manualLocation;
          localStorage.setItem('userLocation', JSON.stringify(location));
          setCurrentLocation(location.locationName || getUserLocationName());
        }
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
    
    showSuccess('Manual location cleared. Using GPS location.');
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
            Use this if your GPS location is inaccurate. This will request a fresh location from your device.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-white font-medium mb-4">Manual Location Selection</h3>
          <p className="text-gray-400 text-sm mb-4">
            If GPS is inaccurate, you can manually select your location from the list below.
          </p>
          
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">
              Select Location
            </label>
            <select
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
            >
              <option value="">Choose a location...</option>
              {availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveManualLocation}
              disabled={!manualLocation}
              className="flex-1 bg-[#FF7F00] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set Manual Location
            </button>
            {useManualLocation && (
              <button
                onClick={handleClearManualLocation}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
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

