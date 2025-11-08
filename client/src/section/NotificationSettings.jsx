import React, { useState } from 'react';

const NotificationSettings = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const handleSave = () => {
    console.log('Notification settings saved:', {
      pushNotifications,
      emailNotifications,
      smsNotifications
    });
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
      <h2 className="text-xl font-bold text-white mb-6">Notifications</h2>

      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={(e) => setPushNotifications(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-[#1A1A1A] text-[#FF7F00] focus:ring-[#FF7F00] focus:ring-offset-0"
          />
          <span className="text-white">Push Notifications</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-[#1A1A1A] text-[#FF7F00] focus:ring-[#FF7F00] focus:ring-offset-0"
          />
          <span className="text-white">Email Notifications</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={smsNotifications}
            onChange={(e) => setSmsNotifications(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-[#1A1A1A] text-[#FF7F00] focus:ring-[#FF7F00] focus:ring-offset-0"
          />
          <span className="text-white">SMS Notifications</span>
        </label>

        <button
          onClick={handleSave}
          className="w-full bg-[#FF7F00] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors mt-4"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;

