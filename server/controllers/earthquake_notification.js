import User from '../models/User.js';
import Alert_threshold from '../models/Alert_threshold.js';
import { calculateDistance } from '../utils/distance.js';
import axios from 'axios';

/**
 * Normalize phone number to international format
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} - Normalized phone number with country code
 */
const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  
  
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  
  if (cleaned.startsWith('0')) {
    return '+63' + cleaned.substring(1);
  }
  
  
  if (cleaned.startsWith('63')) {
    return '+' + cleaned;
  }
  
  
  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    return '+63' + cleaned;
  }
  
  
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '+63' + cleaned.substring(1);
  }
  
  
  if (cleaned.length >= 10) {
    
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    return '+63' + cleaned;
  }
  
  return null;
};

/**
 * Find all users in range of an earthquake and send SMS notifications
 */
export const notifyUsersInRange = async (req, res) => {
  try {
    const { latitude, longitude, magnitude, location, depth, time, currentUserSettings } = req.body;

    if (!latitude || !longitude || !magnitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: latitude, longitude, magnitude' 
      });
    }

    const earthquakeLat = parseFloat(latitude);
    const earthquakeLon = parseFloat(longitude);
    const earthquakeMagnitude = parseFloat(magnitude);

    
    const alertThresholds = await Alert_threshold.find({ 
      enable_sms_alerts: true 
    }).populate('user_id', 'phone_number username');

    const usersInRange = [];
    const phoneNumbers = new Set(); 

    
    if (currentUserSettings && currentUserSettings.latitude && currentUserSettings.longitude) {
      
      const currentUser = req.user;
      
      if (currentUser) {
        const user = await User.findById(currentUser._id).select('phone_number username');
        
        if (user && user.phone_number) {
          
          if (earthquakeMagnitude >= currentUserSettings.minimum_magnitude) {
            
            const distance = calculateDistance(
              currentUserSettings.latitude,
              currentUserSettings.longitude,
              earthquakeLat,
              earthquakeLon
            );

            
            if (distance <= currentUserSettings.alert_radius) {
              const normalizedPhone = normalizePhoneNumber(user.phone_number);
              if (normalizedPhone) {
                usersInRange.push({
                  userId: user._id,
                  username: user.username,
                  phoneNumber: normalizedPhone,
                  distance: distance.toFixed(2),
                  location: 'User Location'
                });
                phoneNumbers.add(normalizedPhone);
              }
            }
          }
        }
      }
    }

    
    for (const threshold of alertThresholds) {
      if (!threshold.user_id || !threshold.user_id.phone_number) {
        continue;
      }

      
      if (phoneNumbers.has(threshold.user_id.phone_number)) {
        continue;
      }

      
      if (earthquakeMagnitude < threshold.minimum_magnitude) {
        continue;
      }

      
      const distance = calculateDistance(
        threshold.latitude,
        threshold.longitude,
        earthquakeLat,
        earthquakeLon
      );

      
      if (distance <= threshold.alert_radius) {
        const normalizedPhone = normalizePhoneNumber(threshold.user_id.phone_number);
        if (normalizedPhone) {
          usersInRange.push({
            userId: threshold.user_id._id,
            username: threshold.user_id.username,
            phoneNumber: normalizedPhone,
            distance: distance.toFixed(2),
            location: threshold.location_name
          });
          phoneNumbers.add(normalizedPhone);
        }
      }
    }

    
    const phoneNumbersArray = Array.from(phoneNumbers);

    
    if (phoneNumbersArray.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users in range to notify',
        usersNotified: 0
      });
    }

    
    const locationText = location || `${earthquakeLat.toFixed(4)}, ${earthquakeLon.toFixed(4)}`;
    const smsText = `🚨 EARTHQUAKE ALERT 🚨\n\nMagnitude: ${earthquakeMagnitude.toFixed(1)}\nLocation: ${locationText}\nDepth: ${depth ? depth + ' km' : 'N/A'}\nTime: ${time ? new Date(time).toLocaleString() : 'Just now'}\n\nPlease stay safe and follow safety guidelines.`;

    
    try {
      const smsApiUrl = 'https://api.sms-gate.app/3rdparty/v1/message';
      const smsApiUsername = process.env.SMS_API_USERNAME;
      const smsApiPassword = process.env.SMS_API_PASSWORD;

      await axios.post(smsApiUrl, {
        textMessage: { text: smsText },
        phoneNumbers: phoneNumbersArray,
        "simNumber": 1,
      }, {
        auth: {
          username: smsApiUsername,
          password: smsApiPassword
        }
      });

      console.log(`SMS sent to ${phoneNumbersArray.length} users for earthquake at ${locationText}`);

      return res.status(200).json({
        success: true,
        message: `SMS notifications sent to ${phoneNumbersArray.length} user(s)`,
        usersNotified: phoneNumbersArray.length,
        usersInRange: usersInRange.map(u => ({
          username: u.username,
          distance: u.distance + ' km',
          location: u.location
        }))
      });
    } catch (smsError) {
      console.error('Error sending SMS:', smsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send SMS notifications',
        error: smsError.message,
        usersInRange: usersInRange.length
      });
    }
  } catch (error) {
    console.error('Error in notifyUsersInRange:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

