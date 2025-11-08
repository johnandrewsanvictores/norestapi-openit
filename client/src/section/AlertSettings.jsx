import React, { useState, useEffect } from 'react';
import { getUserCountry, getLocationsByCountry } from '../utils/locationData.js';
import { showSuccess, showError } from '../utils/alertHelper.js';

const AlertSettings = () => {
  const [minMagnitude, setMinMagnitude] = useState(3.0);
  const [detectionRadius, setDetectionRadius] = useState(100);
  const [location, setLocation] = useState('Default');
  const [locations, setLocations] = useState([]);
  const [notificationMethods, setNotificationMethods] = useState({
    browserPush: true,
    email: false,
    sms: false
  });

  useEffect(() => {
    try {
      const userCountry = getUserCountry();
      const countryLocations = getLocationsByCountry(userCountry);
      setLocations(['Default', ...countryLocations]);

      const settings = localStorage.getItem('alertSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setMinMagnitude(parseFloat(parsed.minMagnitude || 3.0));
        setDetectionRadius(parseFloat(parsed.alertRadius || 100));
        
        if (parsed.location && (parsed.location === 'Default' || countryLocations.includes(parsed.location))) {
          setLocation(parsed.location);
        } else {
          setLocation('Default');
        }
      } else {
        setLocation('Default');
      }
    } catch (error) {
      console.error('Error loading alert settings:', error);
      const userCountry = getUserCountry();
      const defaultLocations = getLocationsByCountry(userCountry);
      setLocations(['Default', ...defaultLocations]);
      setLocation('Default');
    }
  }, []);

  const handleNotificationToggle = (method) => {
    setNotificationMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const handleSave = () => {
    const magnitude = parseFloat(minMagnitude);
    const radius = parseFloat(detectionRadius);
    
    if (isNaN(magnitude) || magnitude < 0 || magnitude > 10) {
      showError('Minimum magnitude must be between 0 and 10');
      return;
    }
    
    if (isNaN(radius) || radius < 0 || radius > 10000) {
      showError('Alert radius must be between 0 and 10000 km');
      return;
    }
    
    if (!location || location === '') {
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
      console.log('Alert settings saved:', settings);
      
      window.dispatchEvent(new Event('alertSettingsUpdated'));
      
      showSuccess('Alert settings saved successfully!');
    } catch (error) {
      console.error('Error saving alert settings:', error);
      showError('Error saving settings. Please try again.');
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">Alert Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-3">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc} className="bg-[#1A1A1A]">
                {loc === 'Default' ? 'Default (Use GPS Location)' : loc}
              </option>
            ))}
          </select>
          <p className="text-gray-400 text-xs mt-2">
            {location === 'Default' 
              ? 'Alerts will be based on your current GPS location' 
              : `Alerts will be based on ${location}`}
          </p>
        </div>

        <div>
          <label className="block text-white font-medium mb-3">
            Minimum Magnitude
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${((minMagnitude - 0) / 10) * 100}%, #4A4A4A ${((minMagnitude - 0) / 10) * 100}%, #4A4A4A 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>0.0</span>
              <span className="text-[#FF7F00] font-semibold">{minMagnitude.toFixed(1)}</span>
              <span>10.0</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-3">
            Alert Radius
          </label>
          <div className="relative">
            <input
              type="range"
              min="5"
              max="10000"
              step="5"
              value={detectionRadius}
              onChange={(e) => setDetectionRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${((detectionRadius - 5) / 9995) * 100}%, #4A4A4A ${((detectionRadius - 5) / 9995) * 100}%, #4A4A4A 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>5 km</span>
              <span className="text-[#FF7F00] font-semibold">{detectionRadius} km</span>
              <span>10000 km</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-3">
            Notification Methods
          </label>
          <div className="space-y-3">
            {[
              { key: 'browserPush', label: 'Browser Push' },
              { key: 'email', label: 'Email' },
              { key: 'sms', label: 'SMS' }
            ].map((method) => (
              <label key={method.key} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationMethods[method.key]}
                  onChange={() => handleNotificationToggle(method.key)}
                  className="w-5 h-5 rounded border-gray-600 bg-[#1A1A1A] text-[#FF7F00] focus:ring-[#FF7F00] focus:ring-offset-0"
                />
                <span className="text-gray-300">{method.label}</span>
              </label>
            ))}
          </div>
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

export default AlertSettings;

