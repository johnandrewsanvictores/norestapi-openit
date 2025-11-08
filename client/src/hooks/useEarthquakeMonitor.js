import { useEffect, useRef } from 'react';
import { useEarthquakeAlert } from '../context/EarthquakeAlertContext';
import { shouldShowAlert } from '../utils/earthquakeAlert';

export const useEarthquakeMonitor = (earthquakes = []) => {
  const { checkAndShowAlert, isAlertOpen } = useEarthquakeAlert();
  const processedEarthquakesRef = useRef(new Set());

  useEffect(() => {
   
    if (isAlertOpen) {
      return;
    }

    earthquakes.forEach((earthquake) => {
      const earthquakeId = `${earthquake.location}-${earthquake.magnitude}-${earthquake.time}`;
      
    
      if (processedEarthquakesRef.current.has(earthquakeId)) {
        return;
      }

     
      if (shouldShowAlert(earthquake)) {
        processedEarthquakesRef.current.add(earthquakeId);
        
        checkAndShowAlert(earthquake);
      }
    });
  }, [earthquakes, checkAndShowAlert, isAlertOpen]);

  
  useEffect(() => {
    if (processedEarthquakesRef.current.size > 100) {
      const entries = Array.from(processedEarthquakesRef.current);
      processedEarthquakesRef.current = new Set(entries.slice(-100));
    }
  }, [earthquakes]);
};

