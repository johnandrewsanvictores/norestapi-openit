import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useEarthquakeAlert } from "./context/EarthquakeAlertContext";
import { useEarthquakeMonitor } from "./hooks/useEarthquakeMonitor";
import EarthquakeAlertModal from "./components/modals/EarthquakeAlertModal";
import api from "../axios.js";

import Homepage from "./pages/Homepage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EarthquakeFeed from "./pages/EarthquakeFeed.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import Simulation from "./pages/Simulation.jsx";

function App() {
  const { alertEarthquake, isAlertOpen, closeAlert, handleViewMap } = useEarthquakeAlert();
  const [earthquakes, setEarthquakes] = useState([]);

  // Global earthquake monitoring - works on all pages
  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const response = await api.get('/earthquake/philippines', {
          params: {
            starttime: formatDate(oneYearAgo),
            endtime: formatDate(today),
            minMag: 3,
            includeSimulated: true
          },
          withCredentials: true
        });

        const transformedData = response.data.map((quake) => ({
          magnitude: quake.magnitude?.toString() || '0.0',
          location: quake.place || 'Unknown location',
          latitude: quake.latitude,
          longitude: quake.longitude,
          depth: quake.depth?.toString() || '0.0',
          time: quake.time,
          timestamp: quake.time,
          isSimulated: quake.isSimulated || false
        }));

        setEarthquakes(transformedData);
      } catch (error) {
        console.error('Error fetching earthquakes for monitoring:', error);
      }
    };

    fetchEarthquakes();
    
    const interval = setInterval(fetchEarthquakes, 5000);
    
    const handleSimulatedEarthquakeAdded = () => {
      fetchEarthquakes();
    };
    
    window.addEventListener('simulatedEarthquakeAdded', handleSimulatedEarthquakeAdded);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('simulatedEarthquakeAdded', handleSimulatedEarthquakeAdded);
    };
  }, []);

  // Monitor earthquakes globally for alerts
  useEarthquakeMonitor(earthquakes);

  const getAlertLevel = (magnitude) => {
    const mag = parseFloat(magnitude);
    if (mag >= 6.0) {
      return { level: 'ALERT', color: 'text-red-500', bgColor: 'bg-red-500/20' };
    } else if (mag >= 4.5) {
      return { level: 'WARNING', color: 'text-[#FF7F00]', bgColor: 'bg-[#FF7F00]/20' };
    } else {
      return { level: 'LOW', color: 'text-green-500', bgColor: 'bg-green-500/20' };
    }
  };

  // Memoize the earthquake object to prevent unnecessary re-renders and re-fetches
  const memoizedEarthquake = useMemo(() => {
    if (!alertEarthquake) return null;
    
    const alertLevel = getAlertLevel(alertEarthquake.magnitude);
    return {
      ...alertEarthquake,
      alertLevel: alertLevel.level,
      alertColor: alertLevel.color,
      bgColor: alertLevel.bgColor
    };
  }, [
    alertEarthquake?.location,
    alertEarthquake?.magnitude,
    alertEarthquake?.latitude,
    alertEarthquake?.longitude,
    alertEarthquake?.time,
    alertEarthquake?.timestamp,
    alertEarthquake?.depth
  ]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/feed" element={<EarthquakeFeed />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/simulation" element={<Simulation />} />
      </Routes>
      
      {/* Global Earthquake Alert Modal - works on all pages */}
      <EarthquakeAlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        earthquake={memoizedEarthquake}
        onViewMap={handleViewMap}
      />
    </>
  );
}

export default App;
