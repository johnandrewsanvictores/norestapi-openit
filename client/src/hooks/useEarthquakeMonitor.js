import { useEffect, useRef, useState } from 'react';
import { useEarthquakeAlert } from '../context/EarthquakeAlertContext';
import { shouldShowAlert } from '../utils/earthquakeAlert';

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

const saveProcessedEarthquake = (earthquakeId, timestamp, isSimulated = false) => {
  try {
    const stored = localStorage.getItem('processedEarthquakes');
    const data = stored ? JSON.parse(stored) : [];
    
    const exists = data.find(item => item.id === earthquakeId);
    if (!exists) {
      data.push({ id: earthquakeId, timestamp, isSimulated });
    }
    
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const filtered = data.filter(item => item.timestamp >= sevenDaysAgo);
    
    localStorage.setItem('processedEarthquakes', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving processed earthquake:', error);
  }
};

const clearRecentProcessedEarthquakes = () => {
  try {
    const stored = localStorage.getItem('processedEarthquakes');
    if (stored) {
      const data = JSON.parse(stored);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const filtered = data.filter(item => item.timestamp < oneDayAgo);
      localStorage.setItem('processedEarthquakes', JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error clearing recent processed earthquakes:', error);
  }
};

// Normalize timestamp helper (shared across the file)
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

// Normalize magnitude helper to ensure consistent ID generation (e.g., 5.0 vs 5)
const normalizeMagnitude = (magValue) => {
  if (magValue === null || magValue === undefined) return '0.0';
  const mag = parseFloat(magValue);
  if (isNaN(mag)) return '0.0';
  // Use toFixed(1) to ensure consistent format (e.g., 5.0 not 5)
  return mag.toFixed(1);
};

export const useEarthquakeMonitor = (earthquakes = []) => {
  const { checkAndShowAlert, isAlertOpen, isEarthquakeAlerted, alertClosedTimeRef } = useEarthquakeAlert();
  const processedEarthquakesRef = useRef(loadProcessedEarthquakes());
  const initializedRef = useRef(false);
  const [settingsVersion, setSettingsVersion] = useState(0);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log('Alert settings updated, reloading processed earthquakes list');
      // Don't clear processed earthquakes - they've already been alerted
      // Just reload the list to ensure we have the latest data
      processedEarthquakesRef.current = loadProcessedEarthquakes();
      setSettingsVersion(prev => prev + 1);
    };

    window.addEventListener('alertSettingsUpdated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('alertSettingsUpdated', handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    if (isAlertOpen) {
      return;
    }

    // Add cooldown period after alert is closed to prevent immediate re-triggering
    const COOLDOWN_PERIOD = 2000; // 2 seconds
    if (alertClosedTimeRef) {
      const closedTime = alertClosedTimeRef.current || 0;
      if (closedTime > 0) {
        const timeSinceClose = Date.now() - closedTime;
        if (timeSinceClose < COOLDOWN_PERIOD) {
          return; // Skip monitoring for a short period after alert closes
        }
      }
    }

    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const recentEarthquakes = earthquakes.filter((earthquake) => {
      const quakeTime = typeof earthquake.timestamp === 'number' 
        ? earthquake.timestamp 
        : new Date(earthquake.time || earthquake.timestamp).getTime();
      return quakeTime >= oneDayAgo;
    });

    if (!initializedRef.current) {
      recentEarthquakes.forEach((earthquake) => {
        const normalizedTime = normalizeTimestamp(earthquake.timestamp || earthquake.time);
        if (!normalizedTime) return;
        
        const normalizedMagnitude = normalizeMagnitude(earthquake.magnitude);
        
        // Generate earthquake ID using the same format as checkAndShowAlert
        const earthquakeId = earthquake.isSimulated 
          ? `SIMULATED-${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`
          : `${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`;
        
        if (!processedEarthquakesRef.current.has(earthquakeId)) {
          processedEarthquakesRef.current.add(earthquakeId);
          saveProcessedEarthquake(earthquakeId, normalizedTime, earthquake.isSimulated || false);
        }
      });
      initializedRef.current = true;
      return;
    }

    // Reload processed earthquakes from localStorage to get latest updates
    processedEarthquakesRef.current = loadProcessedEarthquakes();

    recentEarthquakes.forEach((earthquake) => {
      // Normalize timestamp first
      const normalizedTime = normalizeTimestamp(earthquake.timestamp || earthquake.time);
      if (!normalizedTime) {
        console.warn('Skipping earthquake with invalid timestamp:', earthquake);
        return;
      }

      // Normalize magnitude to ensure consistent ID generation
      const normalizedMagnitude = normalizeMagnitude(earthquake.magnitude);

      // Generate earthquake ID using the same format as checkAndShowAlert with normalized timestamp and magnitude
      const earthquakeId = earthquake.isSimulated 
        ? `SIMULATED-${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`
        : `${earthquake.location}-${normalizedMagnitude}-${normalizedTime}`;
      
      // For simulated earthquakes, only check session ref (not localStorage)
      // For regular earthquakes, check localStorage
      if (earthquake.isSimulated) {
        // Simulated earthquakes: only check if already alerted in context
        // Don't check localStorage as it's shared across users
        if (isEarthquakeAlerted && isEarthquakeAlerted(earthquakeId)) {
          // Already alerted in this session, skip
          return;
        }
      } else {
        // Regular earthquakes: check both localStorage and context
        if (processedEarthquakesRef.current.has(earthquakeId)) {
          return;
        }
        
        // Also check if it's already alerted in the context
        if (isEarthquakeAlerted && isEarthquakeAlerted(earthquakeId)) {
          // Mark it in our local ref too to avoid future checks
          processedEarthquakesRef.current.add(earthquakeId);
          saveProcessedEarthquake(earthquakeId, normalizedTime, false);
          return;
        }
      }

      // Only check shouldShowAlert if it hasn't been processed yet
      if (shouldShowAlert(earthquake)) {
        // For regular earthquakes, mark as processed BEFORE calling checkAndShowAlert
        // For simulated earthquakes, let checkAndShowAlert handle it (session-only)
        if (!earthquake.isSimulated) {
          processedEarthquakesRef.current.add(earthquakeId);
          saveProcessedEarthquake(earthquakeId, normalizedTime, false);
        }
        
        // Now call checkAndShowAlert - it will do its own checks and marking
        checkAndShowAlert(earthquake);
      } else {
        // Mark as processed even if it doesn't meet alert criteria (to avoid re-checking)
        // Only save to localStorage for regular earthquakes
        if (!earthquake.isSimulated) {
          processedEarthquakesRef.current.add(earthquakeId);
          saveProcessedEarthquake(earthquakeId, normalizedTime, false);
        }
      }
    });
  }, [earthquakes, checkAndShowAlert, isAlertOpen, settingsVersion, isEarthquakeAlerted]);

  
  useEffect(() => {
    if (processedEarthquakesRef.current.size > 100) {
      const entries = Array.from(processedEarthquakesRef.current);
      processedEarthquakesRef.current = new Set(entries.slice(-100));
    }
  }, [earthquakes]);
};

