import React, { useState, useEffect } from "react";
import { showSuccess, showError } from '../utils/alertHelper.js';

const NotificationSettings = () => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    // Load notification settings from localStorage
    try {
      const alertSettings = localStorage.getItem('alertSettings');
      if (alertSettings) {
        const parsed = JSON.parse(alertSettings);
        if (parsed.notificationMethods) {
          setPushNotifications(parsed.notificationMethods.browserPush !== undefined ? parsed.notificationMethods.browserPush : true);
          setSmsNotifications(parsed.notificationMethods.sms !== undefined ? parsed.notificationMethods.sms : false);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, []);

  const handleSave = () => {
    try {
      // Get existing alert settings
      const existingSettings = localStorage.getItem('alertSettings');
      const settings = existingSettings ? JSON.parse(existingSettings) : {};
      
      // Update notification methods
      settings.notificationMethods = {
        browserPush: pushNotifications,
        sms: smsNotifications,
      };
      
      // Save to localStorage
      localStorage.setItem('alertSettings', JSON.stringify(settings));
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('alertSettingsUpdated'));
      
      showSuccess('Notification settings saved successfully!');
      console.log("Notification settings saved:", {
        pushNotifications,
        smsNotifications,
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showError('Error saving settings. Please try again.');
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4 sm:p-6 border border-gray-800">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
        Notifications
      </h2>

      <div className="space-y-3 sm:space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pushNotifications}
            onChange={(e) => setPushNotifications(e.target.checked)}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-600 bg-[#1A1A1A] text-[#FF7F00] focus:ring-[#FF7F00] focus:ring-offset-0"
          />
          <span className="text-sm sm:text-base text-white">
            Push Notifications
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={smsNotifications}
            onChange={(e) => setSmsNotifications(e.target.checked)}
            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-600 bg-[#1A1A1A] text-[#FF7F00] focus:ring-[#FF7F00] focus:ring-offset-0"
          />
          <span className="text-sm sm:text-base text-white">
            SMS Notifications
          </span>
        </label>

        <button
          onClick={handleSave}
          className="w-full bg-[#FF7F00] text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors mt-4"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
