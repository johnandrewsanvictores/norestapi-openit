import { useEffect, useRef } from 'react';
import { useEarthquakeAlert } from '../context/EarthquakeAlertContext';
import { shouldShowAlert } from '../utils/earthquakeAlert';

export const useEarthquakeMonitor = (earthquakes = []) => {
  const { checkAndShowAlert, isAlertOpen } = useEarthquakeAlert();
  const processedEarthquakesRef = useRef(new Set());

  useEffect(() => {
    // Don't process new earthquakes if an alert is already open
    if (isAlertOpen) {
      return;
    }

    earthquakes.forEach((earthquake) => {
      const earthquakeId = `${earthquake.location}-${earthquake.magnitude}-${earthquake.time}`;
      
      // Skip if already processed
      if (processedEarthquakesRef.current.has(earthquakeId)) {
        return;
      }

      // Check if should show alert
      if (shouldShowAlert(earthquake)) {
        // Mark as processed before showing alert
        processedEarthquakesRef.current.add(earthquakeId);
        
        // Show alert
        checkAndShowAlert(earthquake);
      }
    });
  }, [earthquakes, checkAndShowAlert, isAlertOpen]);

  // Clean up old processed earthquakes (keep last 100)
  useEffect(() => {
    if (processedEarthquakesRef.current.size > 100) {
      const entries = Array.from(processedEarthquakesRef.current);
      processedEarthquakesRef.current = new Set(entries.slice(-100));
    }
  }, [earthquakes]);
};

