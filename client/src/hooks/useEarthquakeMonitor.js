import { useEffect, useRef } from 'react';
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

const saveProcessedEarthquake = (earthquakeId, timestamp) => {
  try {
    const stored = localStorage.getItem('processedEarthquakes');
    const data = stored ? JSON.parse(stored) : [];
    
    data.push({ id: earthquakeId, timestamp });
    
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const filtered = data.filter(item => item.timestamp >= sevenDaysAgo);
    
    localStorage.setItem('processedEarthquakes', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error saving processed earthquake:', error);
  }
};

export const useEarthquakeMonitor = (earthquakes = []) => {
  const { checkAndShowAlert, isAlertOpen } = useEarthquakeAlert();
  const processedEarthquakesRef = useRef(loadProcessedEarthquakes());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isAlertOpen) {
      return;
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
        const earthquakeId = `${earthquake.location}-${earthquake.magnitude}-${earthquake.timestamp || earthquake.time}`;
        const quakeTime = typeof earthquake.timestamp === 'number' 
          ? earthquake.timestamp 
          : new Date(earthquake.time || earthquake.timestamp).getTime();
        
        if (!processedEarthquakesRef.current.has(earthquakeId)) {
          processedEarthquakesRef.current.add(earthquakeId);
          saveProcessedEarthquake(earthquakeId, quakeTime);
        }
      });
      initializedRef.current = true;
      return;
    }

    recentEarthquakes.forEach((earthquake) => {
      const earthquakeId = `${earthquake.location}-${earthquake.magnitude}-${earthquake.timestamp || earthquake.time}`;
      const quakeTime = typeof earthquake.timestamp === 'number' 
        ? earthquake.timestamp 
        : new Date(earthquake.time || earthquake.timestamp).getTime();
      
      if (processedEarthquakesRef.current.has(earthquakeId)) {
        return;
      }

      if (shouldShowAlert(earthquake)) {
        processedEarthquakesRef.current.add(earthquakeId);
        saveProcessedEarthquake(earthquakeId, quakeTime);
        
        checkAndShowAlert(earthquake);
      } else {
        processedEarthquakesRef.current.add(earthquakeId);
        saveProcessedEarthquake(earthquakeId, quakeTime);
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

