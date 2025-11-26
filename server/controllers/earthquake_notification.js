import User from '../models/User.js';
import Alert_threshold from '../models/Alert_threshold.js';
import { calculateDistance } from '../utils/distance.js';
import axios from 'axios';

/**
 * Fetch location-specific safety guide from pollination API
 */
const fetchSafetyGuide = async (place, coordinates) => {
  try {
    const coord0 = coordinates[0] || '121.0';
    const coord1 = coordinates[1] || '12.0';
    
    const prompt = `analyze the area_type of the given location of earthquakes with coordinates below,with x kilometer away from with direction like identify what type of location like "88 km NE of Dicabisagan, Philippines"   and return me the earthquake safety guide in the json format like below based on the earthquake proximity for example if near in coastal then evauate to the high lands. In generating safety guides follow the RULES  below.

                RULES:
                -Analyze the given location and coordinates to determine the area type (coastal, mountainous, urban, rural, etc.).
                - Safety guidelines MUST be relevant to the identified area type only
                - If coastal: include tsunami/storm surge evacuation procedures
                - If mountainous: include landslide warnings and stable ground identification
                - If urban: include building safety, structural hazards, and evacuation routes
                - If rural: include open area safety and distance from structures
                - Do NOT include coastal guidelines for non-coastal areas
                - Do NOT include mountain-specific advice for flat areas
                - Each guideline should be clear, concise, and immediately actionable.
                - Don't do "if its coastal then do this else do that"
                -It mustn't be null/empty
                -Safety guidelines should be atleast three but you can add more if you like, and don't append two sentences or more in one item.


                given:
                {
                place: "${place || 'Unknown location'}",
                coordinates: ["${coord0}", "${coord1}"]
                }   
                output (json only) formmated in this format only  nothing more, do that in one line without "\\n" or new line, safety guide is array with multiple items:
                {
                place: "Mauban Quezon",
                coordinates: ["14.267876275020605", "121.73146637692165"],
                area_type: "coastal",
                safety_guide: [
                    "Move to higher ground immediately to avoid potential tsunamis or storm surges. Keep emergency kits ready and stay updated with local advisories.",
                    "Evacuate to elevated areas and avoid low-lying zones prone to flooding. Ensure a safe route inland and inform family members of your location.",
                    ...
                ]}
                }`;
    
    const pollinationApiUrl = 'https://text.pollinations.ai/' + encodeURIComponent(prompt);
    
    const response = await axios.get(pollinationApiUrl, {
      timeout: 10000 // 10 second timeout
    });

    if (response.data && response.data.safety_guide && Array.isArray(response.data.safety_guide)) {
      return response.data.safety_guide;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching safety guide:', error.message);
    return null;
  }
};

/**
 * Shorten safety guide items for SMS (max 60 chars per item)
 */
const shortenForSMS = (guideItems) => {
  if (!guideItems || !Array.isArray(guideItems)) return [];
  
  return guideItems.map(item => {
    // Remove extra spaces and newlines
    let shortened = item.trim().replace(/\s+/g, ' ');
    
    // If too long, truncate at last complete sentence or word before 60 chars
    if (shortened.length > 60) {
      // Try to cut at sentence end
      const sentenceEnd = shortened.substring(0, 60).lastIndexOf('.');
      if (sentenceEnd > 40) {
        shortened = shortened.substring(0, sentenceEnd + 1);
      } else {
        // Cut at word boundary
        const wordEnd = shortened.substring(0, 57).lastIndexOf(' ');
        if (wordEnd > 30) {
          shortened = shortened.substring(0, wordEnd) + '...';
        } else {
          shortened = shortened.substring(0, 57) + '...';
        }
      }
    }
    
    return shortened;
  });
};

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

      // Normalize phone number before checking to prevent duplicates
      const normalizedThresholdPhone = normalizePhoneNumber(threshold.user_id.phone_number);
      if (!normalizedThresholdPhone) {
        continue;
      }
      
      // Check if this normalized phone number is already in the Set
      if (phoneNumbers.has(normalizedThresholdPhone)) {
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
        // Use the already normalized phone number
        usersInRange.push({
          userId: threshold.user_id._id,
          username: threshold.user_id.username,
          phoneNumber: normalizedThresholdPhone,
          distance: distance.toFixed(2),
          location: threshold.location_name
        });
        phoneNumbers.add(normalizedThresholdPhone);
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

    
    // Get location-specific immediate actions (same as website)
    const getImmediateActions = async (magnitude, location, latitude, longitude) => {
      try {
        // Try to fetch location-specific safety guide
        const coordinates = [longitude?.toString() || '121.0', latitude?.toString() || '12.0'];
        const safetyGuide = await fetchSafetyGuide(location, coordinates);
        
        if (safetyGuide && safetyGuide.length > 0) {
          // Shorten for SMS and return
          return shortenForSMS(safetyGuide).slice(0, 5); // Max 5 items for SMS
        }
      } catch (error) {
        console.error('Error getting location-specific actions:', error);
      }
      
      // Fallback to default actions based on magnitude (same as website default)
      const mag = parseFloat(magnitude);
      const actions = [];
      
      if (mag >= 6.0) {
        actions.push('Drop, Cover, and Hold On if indoors');
        actions.push('Move away from buildings if outdoors');
        actions.push('Do not use elevators');
        actions.push('Check for injuries after shaking stops');
        actions.push('Be prepared for aftershocks');
      } else if (mag >= 4.5) {
        actions.push('Drop, Cover, and Hold On if indoors');
        actions.push('Move away from buildings if outdoors');
        actions.push('Do not use elevators');
        actions.push('Check for injuries after shaking stops');
      } else {
        actions.push('Stay calm and take cover');
        actions.push('Move away from falling objects');
        actions.push('Monitor for stronger aftershocks');
      }
      
      return actions;
    };

    // Format time in Philippines timezone (UTC+8, Asia/Manila)
    const formatTimeForSMS = (timeValue) => {
      if (!timeValue) return 'Just now';
      
      try {
        const date = new Date(timeValue);
        if (isNaN(date.getTime())) return 'Just now';
        
        // Use Intl.DateTimeFormat to properly convert to Philippines timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        const parts = formatter.formatToParts(date);
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const year = parts.find(p => p.type === 'year').value;
        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;
        const ampm = parts.find(p => p.type === 'dayPeriod').value.toUpperCase();
        
        return `${month}/${day}/${year}, ${hour}:${minute} ${ampm}`;
      } catch (error) {
        console.error('Error formatting time:', error);
        return 'Just now';
      }
    };
    
    const locationText = location || `${earthquakeLat.toFixed(4)}, ${earthquakeLon.toFixed(4)}`;
    const immediateActions = await getImmediateActions(earthquakeMagnitude, location, earthquakeLat, earthquakeLon);
    const actionsText = immediateActions.map((action, index) => `${index + 1}. ${action}`).join('\n');
    const formattedTime = formatTimeForSMS(time);
    
    const smsText = `🚨 EARTHQUAKE ALERT 🚨\n\nMagnitude: ${earthquakeMagnitude.toFixed(1)}\nLocation: ${locationText}\nDepth: ${depth ? depth + ' km' : 'N/A'}\nTime: ${formattedTime}\n\n⚡ IMMEDIATE ACTIONS:\n${actionsText}\n\nStay safe!`;

    
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

