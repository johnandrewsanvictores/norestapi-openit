import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../section/DashboardSidebar';
import ProfileForm from '../section/ProfileForm';
import NotificationDropdown from '../components/NotificationDropdown';
import EarthquakeDetailsModal from '../components/modals/EarthquakeDetailsModal';
import EarthquakeAlertModal from '../components/modals/EarthquakeAlertModal';
import { useEarthquakeAlert } from '../context/EarthquakeAlertContext';
import { useEarthquakeMonitor } from '../hooks/useEarthquakeMonitor';
import { shouldShowAlert } from '../utils/earthquakeAlert';
import api from '../../axios.js';

const Profile = () => {
  const { alertEarthquake, isAlertOpen, closeAlert, checkAndShowAlert, setViewMapHandler } = useEarthquakeAlert();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [earthquakes, setEarthquakes] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);

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
        console.error('Error fetching earthquakes:', error);
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

  useEarthquakeMonitor(earthquakes);

  useEffect(() => {
    const viewMapHandler = (earthquake) => {
      if (earthquake) {
        setSelectedEarthquake(earthquake);
        setIsDetailsModalOpen(true);
      }
    };
    setViewMapHandler(viewMapHandler);
  }, [setViewMapHandler]);

  useEffect(() => {
    const handleSimulatedAlert = (event) => {
      const earthquake = event.detail;
      if (earthquake) {
        console.log('Received earthquake alert event:', earthquake);
        checkAndShowAlert(earthquake);
      }
    };

    window.addEventListener('earthquakeAlert', handleSimulatedAlert);
    return () => {
      window.removeEventListener('earthquakeAlert', handleSimulatedAlert);
    };
  }, [checkAndShowAlert]);

  return (
    <div className="flex min-h-screen bg-[#1A1A1A]">
      <DashboardSidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-end items-start mb-6 relative">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="text-gray-400 hover:text-white transition-colors relative"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
          
          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            earthquakes={earthquakes}
            onEarthquakeClick={(earthquake) => {
              setSelectedEarthquake(earthquake);
              setIsDetailsModalOpen(true);
            }}
          />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Edit your personal information</p>
        </div>

        <ProfileForm />

        <EarthquakeDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedEarthquake(null);
          }}
          earthquake={selectedEarthquake}
        />

        <EarthquakeAlertModal
          isOpen={isAlertOpen}
          onClose={closeAlert}
          earthquake={alertEarthquake}
          onViewMap={() => {
            if (alertEarthquake) {
              setSelectedEarthquake(alertEarthquake);
              setIsDetailsModalOpen(true);
            }
            closeAlert();
          }}
        />
      </div>
    </div>
  );
};

export default Profile;
