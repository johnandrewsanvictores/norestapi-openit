import React, { useState, useEffect } from 'react';

const AlertThresholds = () => {
  const [minMagnitude, setMinMagnitude] = useState('3.0');
  const [alertRadius, setAlertRadius] = useState('100');
  const [location, setLocation] = useState('San Francisco, CA');

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const settings = localStorage.getItem('alertSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setMinMagnitude(parsed.minMagnitude?.toString() || '3.0');
        setAlertRadius(parsed.alertRadius?.toString() || '100');
      }
    } catch (error) {
      console.error('Error loading alert settings:', error);
    }
  }, []);

  const locations = [
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

  const handleSave = () => {
    const settings = {
      minMagnitude: parseFloat(minMagnitude) || 3.0,
      alertRadius: parseFloat(alertRadius) || 100,
      location: location
    };
    
    try {
      localStorage.setItem('alertSettings', JSON.stringify(settings));
      console.log('Alert thresholds saved:', settings);
      alert('Alert settings saved successfully!');
    } catch (error) {
      console.error('Error saving alert settings:', error);
      alert('Error saving settings. Please try again.');
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
