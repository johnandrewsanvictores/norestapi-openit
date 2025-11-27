import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { shouldShowAlert, getCoordinatesFromLocation } from '../utils/earthquakeAlert';
import { saveAlertToCache } from '../utils/cacheHelper';
import { useAuth } from './AuthContext';
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
  const { user } = useAuth();
  const location = useLocation();
  const [alertEarthquake, setAlertEarthquake] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const viewMapCallbackRef = useRef(null);
  
  // Load processed earthquakes from localStorage on initialization to prevent duplicate alerts after refresh
  const loadProcessedEarthquakesForRef = () => {
    try {
      const stored = localStorage.getItem('processedEarthquakes');
      if (stored) {
        const data = JSON.parse(stored);
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filtered = data.filter(item => item.timestamp >= sevenDaysAgo);
        return new Set(filtered.map(item => item.id));
      }
    } catch (error) {
      console.error('Error loading processed earthquakes for ref:', error);
    }
    return new Set();
  };
  
  // Track which earthquakes have been shown as alerts to prevent duplicates
  // Initialize from localStorage to persist across page refreshes
  const alertedEarthquakesRef = useRef(loadProcessedEarthquakesForRef());
  // Track when alert was closed to prevent immediate re-triggering
  const alertClosedTimeRef = useRef(0);

  const checkAndShowAlert = useCallback(async (earthquake) => {
    // Only show alerts if user is authenticated and on dashboard routes
    const isAuthenticated = !!user;
    const isDashboardRoute = location.pathname.startsWith('/dashboard');
    
    if (!isAuthenticated || !isDashboardRoute) {
      console.log('Skipping alert: user not authenticated or not on dashboard route');
      return false;
    }
    // Normalize timestamp to ensure consistent ID generation
    const normalizeTimestamp = (timeValue) => {
      if (!timeValue) return null;
      if (typeof timeValue === 'number') return timeValue;
      if (typeof timeValue === 'string') {
        // Check if it's a numeric string
        if (/^\d+$/.test(timeValue)) {
          return parseInt(timeValue);
        }
        // Try to parse as date
        const parsed = new Date(timeValue).getTime();
        return isNaN(parsed) ? null : parsed;
      }
      if (timeValue instanceof Date) return timeValue.getTime();
      return null;
    };

    // Normalize magnitude to ensure consistent ID generation (e.g., 5.0 vs 5)
    const normalizeMagnitude = (magValue) => {
      if (magValue === null || magValue === undefined) return '0.0';
      const mag = parseFloat(magValue);
      if (isNaN(mag)) return '0.0';
      // Use toFixed(1) to ensure consistent format (e.g., 5.0 not 5)
      return mag.toFixed(1);
    };

    const normalizedTime = normalizeTimestamp(earthquake.timestamp || earthquake.time);
    if (!normalizedTime) {
      console.warn('Cannot generate earthquake ID: invalid timestamp', earthquake);
      return false;
    }

    const normalizedMagnitude = normalizeMagnitude(earthquake.magnitude);

    // Generate unique ID for this earthquake with normalized timestamp and magnitude
    const earthquakeId = earthquake.isSimulated 
      ? `SIMULATED-${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`
      : `${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`;
    
    // Check if we've already shown an alert for this earthquake in this session
    if (alertedEarthquakesRef.current.has(earthquakeId)) {
      console.log('Earthquake alert already shown in this session, skipping:', earthquakeId);
      return false;
    }
    
    // Check if this earthquake has already been processed to prevent duplicate alerts
    // Now also check for simulated earthquakes
    const loadProcessedEarthquakes = () => {
      try {
        const stored = localStorage.getItem('processedEarthquakes');
        if (stored) {
          const data = JSON.parse(stored);
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          const filtered = data.filter(item => item.timestamp >= sevenDaysAgo);
          return new Set(filtered.map(item => item.id));
        }
      } catch (error) {
        console.error('Error loading processed earthquakes:', error);
      }
      return new Set();
    };

    // For simulated earthquakes, only check session ref (not localStorage)
    // This allows each user session to see simulated earthquakes independently
    // For regular earthquakes, check localStorage to prevent duplicates across sessions
    if (earthquake.isSimulated) {
      // Simulated earthquakes: only check session ref
      // Don't check localStorage as it's shared across users
      // This allows each user to see the same simulated earthquake
    } else {
      // Regular earthquakes: check localStorage
      const processedEarthquakes = loadProcessedEarthquakes();
      
      // If already processed, don't show alert or send SMS again
      if (processedEarthquakes.has(earthquakeId)) {
        console.log('Earthquake already processed, skipping alert:', earthquakeId);
        // Also mark it in the session ref to prevent future checks
        alertedEarthquakesRef.current.add(earthquakeId);
        return false;
      }
    }
    
    // Mark as alerted to prevent duplicates
    alertedEarthquakesRef.current.add(earthquakeId);
    
    // Save to localStorage ONLY for regular earthquakes (not simulated)
    // Simulated earthquakes are tracked only in session ref to allow each user to see them
    if (!earthquake.isSimulated) {
      try {
        const stored = localStorage.getItem('processedEarthquakes');
        const data = stored ? JSON.parse(stored) : [];
        
        const exists = data.find(item => item.id === earthquakeId);
        if (!exists) {
          data.push({ 
            id: earthquakeId, 
            timestamp: normalizedTime, 
            isSimulated: false 
          });
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          const filtered = data.filter(item => item.timestamp >= sevenDaysAgo);
          localStorage.setItem('processedEarthquakes', JSON.stringify(filtered));
        }
      } catch (error) {
        console.error('Error saving earthquake to processed list:', error);
      }
    }
    
    // Check notification preferences before showing browser push alert
    const alertSettings = JSON.parse(localStorage.getItem('alertSettings') || '{}');
    const notificationMethods = alertSettings.notificationMethods || { browserPush: true, sms: false };
    
    // Show browser push notification (alert modal) only if enabled
    if (notificationMethods.browserPush !== false) {
      saveAlertToCache(earthquake);
      setAlertEarthquake(earthquake);
      setIsAlertOpen(true);
    }

    
    // Send SMS only if enabled in notification preferences
    if (notificationMethods.sms === true) {
      try {
        const userLocation = JSON.parse(localStorage.getItem('userLocation') || 'null');
        
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
          
          currentUserSettings: (userAlertLat && userAlertLon) ? {
            latitude: userAlertLat,
            longitude: userAlertLon,
            minimum_magnitude: parseFloat(alertSettings.minMagnitude || 3.0),
            alert_radius: parseFloat(alertSettings.alertRadius || 100),
            enable_sms_alerts: true 
          } : null
        };

        await api.post('/earthquake/notify-users', earthquakeData, {
          withCredentials: true
        });

        console.log('SMS notifications sent to users in range');
      } catch (error) {
        console.error('Error sending SMS notifications:', error);
      }
    }

    return true; // Return true to indicate alert was shown successfully
  }, [user, location.pathname]);

  const closeAlert = useCallback(() => {
    setIsAlertOpen(false);
    setAlertEarthquake(null);
    viewMapCallbackRef.current = null;
    // Record when alert was closed to prevent immediate re-triggering
    alertClosedTimeRef.current = Date.now();
  }, []);
  
  // Function to check if an earthquake is already alerted
  const isEarthquakeAlerted = useCallback((earthquakeId) => {
    return alertedEarthquakesRef.current.has(earthquakeId);
  }, []);
  
  // Clean up old alerted earthquakes periodically (keep last 50)
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (alertedEarthquakesRef.current.size > 50) {
        const entries = Array.from(alertedEarthquakesRef.current);
        alertedEarthquakesRef.current = new Set(entries.slice(-50));
      }
    }, 60000); // Every minute
    
    return () => clearInterval(cleanup);
  }, []);

  const setViewMapHandler = useCallback((callback) => {
    viewMapCallbackRef.current = callback;
  }, []);

  const handleViewMap = useCallback(() => {
    // Save the callback and earthquake before closing the alert
    const callback = viewMapCallbackRef.current;
    const earthquake = alertEarthquake;
    
    if (!earthquake) return;
    
    // Normalize timestamp (same as in checkAndShowAlert)
    const normalizeTimestamp = (timeValue) => {
      if (!timeValue) return null;
      if (typeof timeValue === 'number') return timeValue;
      if (typeof timeValue === 'string') {
        if (/^\d+$/.test(timeValue)) {
          return parseInt(timeValue);
        }
        const parsed = new Date(timeValue).getTime();
        return isNaN(parsed) ? null : parsed;
      }
      if (timeValue instanceof Date) return timeValue.getTime();
      return null;
    };

    // Normalize magnitude (same as in checkAndShowAlert)
    const normalizeMagnitude = (magValue) => {
      if (magValue === null || magValue === undefined) return '0.0';
      const mag = parseFloat(magValue);
      if (isNaN(mag)) return '0.0';
      return mag.toFixed(1);
    };

    const normalizedTime = normalizeTimestamp(earthquake.timestamp || earthquake.time);
    if (!normalizedTime) {
      console.warn('Cannot generate earthquake ID in handleViewMap: invalid timestamp', earthquake);
      return;
    }
    
    const normalizedMagnitude = normalizeMagnitude(earthquake.magnitude);
    
    // Generate earthquake ID to ensure it stays marked as processed
    const earthquakeId = earthquake.isSimulated 
      ? `SIMULATED-${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`
      : `${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`;
    
    // Ensure this earthquake stays marked as alerted to prevent re-triggering
    // This is critical - we don't want the monitor to re-trigger this earthquake
    if (!alertedEarthquakesRef.current.has(earthquakeId)) {
      alertedEarthquakesRef.current.add(earthquakeId);
    }
    
    // Also mark it in localStorage immediately so the monitor sees it
    try {
      const stored = localStorage.getItem('processedEarthquakes');
      const data = stored ? JSON.parse(stored) : [];
      
      const exists = data.find(item => item.id === earthquakeId);
      if (!exists) {
        data.push({ 
          id: earthquakeId, 
          timestamp: normalizedTime, 
          isSimulated: earthquake.isSimulated || false 
        });
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const filtered = data.filter(item => item.timestamp >= sevenDaysAgo);
        localStorage.setItem('processedEarthquakes', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Error saving processed earthquake in handleViewMap:', error);
    }
    
    // Close the alert modal first to prevent it from reopening
    setIsAlertOpen(false);
    setAlertEarthquake(null);
    // Record when alert was closed to prevent immediate re-triggering
    alertClosedTimeRef.current = Date.now();
    // Don't clear viewMapCallbackRef here - we need it for the callback
    
    // Use setTimeout to ensure the alert modal is fully closed before opening details modal
    setTimeout(() => {
      if (callback && earthquake) {
        callback(earthquake);
      }
      // Clear the callback after using it
      viewMapCallbackRef.current = null;
    }, 200);
  }, [alertEarthquake]);

  return (
    <EarthquakeAlertContext.Provider
      value={{
        alertEarthquake,
        isAlertOpen,
        checkAndShowAlert,
        closeAlert,
        setViewMapHandler,
        handleViewMap,
        isEarthquakeAlerted,
        alertClosedTimeRef
      }}
    >
      {children}
    </EarthquakeAlertContext.Provider>
  );
};

