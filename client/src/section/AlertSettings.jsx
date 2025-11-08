import React, { useState } from 'react';

const AlertSettings = () => {
  const [minMagnitude, setMinMagnitude] = useState(3.0);
  const [detectionRadius, setDetectionRadius] = useState(50);
  const [notificationMethods, setNotificationMethods] = useState({
    browserPush: true,
    email: false,
    sms: false
  });

  const handleNotificationToggle = (method) => {
    setNotificationMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Settings saved:', {
      minMagnitude,
      detectionRadius,
      notificationMethods
    });
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">Alert Settings</h2>

      <div className="space-y-6">
        {/* Minimum Magnitude */}
        <div>
          <label className="block text-white font-medium mb-3">
            Minimum Magnitude
          </label>
          <div className="relative">
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.1"
              value={minMagnitude}
              onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${((minMagnitude - 1.0) / 7.0) * 100}%, #4A4A4A ${((minMagnitude - 1.0) / 7.0) * 100}%, #4A4A4A 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>1.0</span>
              <span className="text-[#FF7F00] font-semibold">{minMagnitude.toFixed(1)}</span>
              <span>8.0</span>
            </div>
          </div>
        </div>

        {/* Detection Radius */}
        <div>
          <label className="block text-white font-medium mb-3">
            Detection Radius
          </label>
          <div className="relative">
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={detectionRadius}
              onChange={(e) => setDetectionRadius(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${((detectionRadius - 5) / 495) * 100}%, #4A4A4A ${((detectionRadius - 5) / 495) * 100}%, #4A4A4A 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>5 km</span>
              <span className="text-[#FF7F00] font-semibold">{detectionRadius} km</span>
              <span>500 km</span>
            </div>
          </div>
        </div>

        {/* Notification Methods */}
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

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-[#FF7F00] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default AlertSettings;

