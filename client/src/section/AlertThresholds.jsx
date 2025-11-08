import React, { useState, useEffect } from 'react';
import { getUserCountry, getLocationsByCountry } from '../utils/locationData.js';
import { getUserLocationName } from '../utils/locationHelper.js';
import { showSuccess, showError } from '../utils/alertHelper.js';

const AlertThresholds = () => {
  const [minMagnitude, setMinMagnitude] = useState('3.0');
  const [alertRadius, setAlertRadius] = useState('100');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);

  // Load settings and detect country on mount
  useEffect(() => {
    try {
      // Get user's country and load appropriate locations
      const userCountry = getUserCountry();
      const countryLocations = getLocationsByCountry(userCountry);
      setLocations(countryLocations);

      // Load saved settings from localStorage
      const settings = localStorage.getItem('alertSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setMinMagnitude(parsed.minMagnitude?.toString() || '3.0');
        setAlertRadius(parsed.alertRadius?.toString() || '100');
        
        // Set location if saved, otherwise use user's current location
        if (parsed.location && countryLocations.includes(parsed.location)) {
          setLocation(parsed.location);
        } else {
          // Try to use user's current location name
          const userLocationName = getUserLocationName();
          if (userLocationName && userLocationName !== 'Location not set') {
            // Check if user location is in the list
            const matchingLocation = countryLocations.find(loc => 
              userLocationName.includes(loc.split(',')[0]) || 
              loc.includes(userLocationName.split(',')[0])
            );
            if (matchingLocation) {
              setLocation(matchingLocation);
            } else if (countryLocations.length > 0) {
              // Default to first location in list
              setLocation(countryLocations[0]);
            }
          } else if (countryLocations.length > 0) {
            setLocation(countryLocations[0]);
          }
        }
      } else {
        // No saved settings, use defaults
        const userLocationName = getUserLocationName();
        if (userLocationName && userLocationName !== 'Location not set') {
          const matchingLocation = countryLocations.find(loc => 
            userLocationName.includes(loc.split(',')[0]) || 
            loc.includes(userLocationName.split(',')[0])
          );
          if (matchingLocation) {
            setLocation(matchingLocation);
          } else if (countryLocations.length > 0) {
            setLocation(countryLocations[0]);
          }
        } else if (countryLocations.length > 0) {
          setLocation(countryLocations[0]);
        }
      }
    } catch (error) {
      console.error('Error loading alert settings:', error);
      // Set default locations
      const userCountry = getUserCountry();
      const defaultLocations = getLocationsByCountry(userCountry);
      setLocations(defaultLocations);
      if (defaultLocations.length > 0) {
        setLocation(defaultLocations[0]);
      }
    }
  }, []);

  const handleSave = () => {
    // Validate inputs
    const magnitude = parseFloat(minMagnitude);
    const radius = parseFloat(alertRadius);
    
    if (isNaN(magnitude) || magnitude < 0 || magnitude > 10) {
      showError('Minimum magnitude must be between 0 and 10');
      return;
    }
    
    if (isNaN(radius) || radius < 0 || radius > 10000) {
      showError('Alert radius must be between 0 and 10000 km');
      return;
    }
    
    if (!location) {
      showError('Please select a location');
      return;
    }
    
    const settings = {
      minMagnitude: magnitude,
      alertRadius: radius,
      location: location
    };
    
    try {
      localStorage.setItem('alertSettings', JSON.stringify(settings));
      console.log('Alert thresholds saved:', settings);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('alertSettingsUpdated'));
      
      showSuccess('Alert settings saved successfully!');
    } catch (error) {
      console.error('Error saving alert settings:', error);
      showError('Error saving settings. Please try again.');
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">Alert Thresholds</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc} className="bg-[#1A1A1A]">
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Minimum Magnitude to Alert
          </label>
          <input
            type="number"
            step="0.1"
            value={minMagnitude}
            onChange={(e) => setMinMagnitude(e.target.value)}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
            placeholder="3.0"
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Alert Radius (km)
          </label>
          <input
            type="number"
            value={alertRadius}
            onChange={(e) => setAlertRadius(e.target.value)}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
            placeholder="100"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#FF7F00] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AlertThresholds;
