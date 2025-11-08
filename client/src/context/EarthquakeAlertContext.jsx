import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { shouldShowAlert, getCoordinatesFromLocation } from '../utils/earthquakeAlert';
import api from '../../axios';

const EarthquakeAlertContext = createContext();

export const useEarthquakeAlert = () => {
  const context = useContext(EarthquakeAlertContext);
  if (!context) {
    throw new Error('useEarthquakeAlert must be used within EarthquakeAlertProvider');
  }
  return context;
};

export const EarthquakeAlertProvider = ({ children }) => {
  const [alertEarthquake, setAlertEarthquake] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const viewMapCallbackRef = useRef(null);

  const checkAndShowAlert = useCallback(async (earthquake) => {
    // Show alert to user
    setAlertEarthquake(earthquake);
    setIsAlertOpen(true);

    // Notify all users in range via SMS
    try {
      // Get current user's alert settings from localStorage
      const alertSettings = JSON.parse(localStorage.getItem('alertSettings') || '{}');
      const userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');
      
      // Get coordinates for user's alert location
      let userAlertLat = null;
      let userAlertLon = null;
      
      if (alertSettings.location && alertSettings.location !== 'Default') {
        const coords = getCoordinatesFromLocation(alertSettings.location);
        userAlertLat = coords[1];
        userAlertLon = coords[0];
      } else if (userLocation && userLocation.latitude && userLocation.longitude) {
        userAlertLat = userLocation.latitude;
        userAlertLon = userLocation.longitude;
      }

      const earthquakeData = {
        latitude: earthquake.latitude,
        longitude: earthquake.longitude,
        magnitude: earthquake.magnitude,
        location: earthquake.location,
        depth: earthquake.depth,
        time: earthquake.timestamp || earthquake.time,
        // Include current user's alert settings if available
        currentUserSettings: (userAlertLat && userAlertLon) ? {
          latitude: userAlertLat,
          longitude: userAlertLon,
          minimum_magnitude: parseFloat(alertSettings.minMagnitude || 3.0),
          alert_radius: parseFloat(alertSettings.alertRadius || 100),
          enable_sms_alerts: true // Default to true if user is being alerted
        } : null
      };

      await api.post('/earthquake/notify-users', earthquakeData, {
        withCredentials: true
      });

      console.log('SMS notifications sent to users in range');
    } catch (error) {
      console.error('Error sending SMS notifications:', error);
      // Don't block the alert if SMS fails
    }

    return true;
  }, []);

  const closeAlert = useCallback(() => {
    setIsAlertOpen(false);
    setAlertEarthquake(null);
    viewMapCallbackRef.current = null;
  }, []);

  const setViewMapHandler = useCallback((callback) => {
    viewMapCallbackRef.current = callback;
  }, []);

  const handleViewMap = useCallback(() => {
    if (viewMapCallbackRef.current) {
      viewMapCallbackRef.current(alertEarthquake);
    }
    closeAlert();
  }, [closeAlert, alertEarthquake]);

  return (
    <EarthquakeAlertContext.Provider
      value={{
        alertEarthquake,
        isAlertOpen,
        checkAndShowAlert,
        closeAlert,
        setViewMapHandler,
        handleViewMap
      }}
    >
      {children}
    </EarthquakeAlertContext.Provider>
  );
};

