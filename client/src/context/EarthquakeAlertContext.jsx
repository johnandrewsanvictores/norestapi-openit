import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { shouldShowAlert } from '../utils/earthquakeAlert';

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

  const checkAndShowAlert = useCallback((earthquake) => {
    if (shouldShowAlert(earthquake)) {
      setAlertEarthquake(earthquake);
      setIsAlertOpen(true);
      return true;
    }
    return false;
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

