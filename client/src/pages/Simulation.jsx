import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../section/DashboardSidebar';
import NotificationDropdown from '../components/NotificationDropdown';
import EarthquakeDetailsModal from '../components/modals/EarthquakeDetailsModal';
import EarthquakeAlertModal from '../components/modals/EarthquakeAlertModal';
import { useEarthquakeAlert } from '../context/EarthquakeAlertContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { showSuccess, showError, showConfirmation } from '../utils/alertHelper.js';
import { shouldShowAlert, calculateDistance, getUserLocation, getAlertSettings, getCoordinatesFromLocation } from '../utils/earthquakeAlert';
import api from '../../axios.js';

const Simulation = () => {
  const { user } = useAuth();
  const { checkAndShowAlert, alertEarthquake, isAlertOpen, closeAlert, handleViewMap } = useEarthquakeAlert();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [earthquakes, setEarthquakes] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  
  const [testEarthquake, setTestEarthquake] = useState({
    magnitude: '5.0',
    location: 'Manila, Philippines',
    latitude: '14.5995',
    longitude: '120.9842',
    depth: '10.0'
  });

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

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
            minMag: 3
          }
        });

        const transformedData = response.data.map((quake) => ({
          magnitude: quake.magnitude?.toString() || '0.0',
          location: quake.place || 'Unknown location',
          latitude: quake.latitude,
          longitude: quake.longitude,
          depth: quake.depth?.toString() || '0.0',
          time: quake.time,
          timestamp: quake.time
        }));

        setEarthquakes(transformedData);
      } catch (error) {
        console.error('Error fetching earthquakes:', error);
      }
    };

    fetchEarthquakes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestEarthquake(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const triggerTestAlert = async () => {
    const now = new Date();
    const earthquake = {
      magnitude: testEarthquake.magnitude,
      location: testEarthquake.location,
      latitude: parseFloat(testEarthquake.latitude),
      longitude: parseFloat(testEarthquake.longitude),
      depth: testEarthquake.depth,
      time: now.toLocaleString(),
      timestamp: now.getTime(),
      isSimulated: true
    };

    const userLocation = getUserLocation();
    const alertSettings = getAlertSettings();
    
    let alertLocationLat, alertLocationLon;
    if (alertSettings.location && alertSettings.location !== 'Default') {
      const alertCoords = getCoordinatesFromLocation(alertSettings.location);
      alertLocationLon = alertCoords[0];
      alertLocationLat = alertCoords[1];
    } else if (userLocation && userLocation.latitude && userLocation.longitude) {
      alertLocationLat = userLocation.latitude;
      alertLocationLon = userLocation.longitude;
    } else {
      showError('Location is not set. Please set your location in Settings or enable GPS.');
      return;
    }

    const distance = calculateDistance(
      alertLocationLat,
      alertLocationLon,
      earthquake.latitude,
      earthquake.longitude
    );

    const magnitude = parseFloat(earthquake.magnitude);
    const minMagnitude = parseFloat(alertSettings.minMagnitude || 3.0);
    const alertRadius = parseFloat(alertSettings.alertRadius || 100);

    const inRange = distance <= alertRadius;
    const meetsMagnitude = magnitude >= minMagnitude;

    if (shouldShowAlert(earthquake)) {
      try {
        const response = await api.post('/simulated-earthquake', {
          time: earthquake.timestamp,
          latitude: earthquake.latitude,
          longitude: earthquake.longitude,
          depth: parseFloat(earthquake.depth),
          magnitude: parseFloat(earthquake.magnitude),
          place: earthquake.location,
          magnitude_type: 'SIM',
          tsunami: 0
        }, { withCredentials: true });

        if (response.data.success) {
          const earthquakeId = `SIMULATED-${earthquake.location}-${earthquake.magnitude}-${earthquake.timestamp}`;
          try {
            const stored = localStorage.getItem('processedEarthquakes');
            const data = stored ? JSON.parse(stored) : [];
            data.push({ id: earthquakeId, timestamp: earthquake.timestamp, isSimulated: true });
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const filtered = data.filter(item => item.timestamp >= sevenDaysAgo);
            localStorage.setItem('processedEarthquakes', JSON.stringify(filtered));
          } catch (error) {
            console.error('Error saving to processed list:', error);
          }

          window.dispatchEvent(new Event('simulatedEarthquakeAdded'));
          
          checkAndShowAlert(earthquake);
          
          window.dispatchEvent(new CustomEvent('earthquakeAlert', { detail: earthquake }));
          
          showSuccess(`Test alert triggered! Distance: ${distance.toFixed(1)} km (within ${alertRadius} km radius)`);
        } else {
          showError('Failed to save simulated earthquake to database');
        }
      } catch (error) {
        console.error('Error saving simulated earthquake:', error);
        showError('Failed to save simulated earthquake. Please try again.');
      }
    } else {
      let errorMsg = 'Alert did not trigger:\n';
      if (!meetsMagnitude) {
        errorMsg += `- Magnitude ${magnitude} is below minimum threshold of ${minMagnitude}\n`;
      }
      if (!inRange) {
        errorMsg += `- Distance ${distance.toFixed(1)} km exceeds alert radius of ${alertRadius} km\n`;
      }
      if (!userLocation && (!alertSettings.location || alertSettings.location === 'Default')) {
        errorMsg += '- Location is not set\n';
      }
      showError(errorMsg.trim());
    }
  };

  const clearSimulatedData = async () => {
    try {
      const confirmed = await showConfirmation({
        title: "Clear Simulated Data?",
        text: "This will remove all simulated/test earthquake data from the database. Real earthquake data will not be affected. Continue?",
        confirmButtonText: "Clear Data",
        cancelButtonText: "Cancel",
        icon: "warning"
      });

      if (!confirmed) return;

      const response = await api.delete('/simulated-earthquake', { withCredentials: true });

      if (response.data.success) {
        const stored = localStorage.getItem('processedEarthquakes');
        if (stored) {
          const data = JSON.parse(stored);
          const filtered = data.filter(item => !item.isSimulated);
          localStorage.setItem('processedEarthquakes', JSON.stringify(filtered));
        }

        window.dispatchEvent(new Event('simulatedEarthquakeAdded'));
        
        const deletedCount = response.data.deletedCount || 0;
        if (deletedCount > 0) {
          showSuccess(`Cleared ${deletedCount} simulated earthquake${deletedCount > 1 ? 's' : ''} from the database!`);
        } else {
          showSuccess('No simulated data found to clear.');
        }
      } else {
        showError('Failed to clear simulated data from database');
      }
    } catch (error) {
      console.error('Error clearing simulated data:', error);
      if (error.response?.status === 403) {
        showError('Only admin can clear all simulated earthquakes');
      } else {
        showError('Error clearing simulated data. Please try again.');
      }
    }
  };

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

  const alert = getAlertLevel(testEarthquake.magnitude);

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
          <h1 className="text-4xl font-bold text-white mb-2">Alert Simulation</h1>
          <p className="text-gray-400">Test the earthquake alert system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">Create Test Alert</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  Magnitude
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="magnitude"
                  value={testEarthquake.magnitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                  placeholder="5.0"
                />
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${alert.color} ${alert.bgColor}`}>
                    {alert.level}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={testEarthquake.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                  placeholder="Manila, Philippines"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    name="latitude"
                    value={testEarthquake.latitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                    placeholder="14.5995"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    name="longitude"
                    value={testEarthquake.longitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                    placeholder="120.9842"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  Depth (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="depth"
                  value={testEarthquake.depth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                  placeholder="10.0"
                />
              </div>

              <button
                onClick={triggerTestAlert}
                className="w-full bg-[#FF7F00] text-white py-3 rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors mt-4"
              >
                Trigger Test Alert
              </button>

              {(() => {
                try {
                  const userLocation = getUserLocation();
                  const alertSettings = getAlertSettings();
                  
                  let alertLocationLat, alertLocationLon;
                  if (alertSettings.location && alertSettings.location !== 'Default') {
                    const alertCoords = getCoordinatesFromLocation(alertSettings.location);
                    alertLocationLon = alertCoords[0];
                    alertLocationLat = alertCoords[1];
                  } else if (userLocation && userLocation.latitude && userLocation.longitude) {
                    alertLocationLat = userLocation.latitude;
                    alertLocationLon = userLocation.longitude;
                  } else {
                    return null;
                  }

                  const distance = calculateDistance(
                    alertLocationLat,
                    alertLocationLon,
                    parseFloat(testEarthquake.latitude),
                    parseFloat(testEarthquake.longitude)
                  );

                  const alertRadius = parseFloat(alertSettings.alertRadius || 100);
                  const inRange = distance <= alertRadius;
                  const magnitude = parseFloat(testEarthquake.magnitude);
                  const minMagnitude = parseFloat(alertSettings.minMagnitude || 3.0);
                  const meetsMagnitude = magnitude >= minMagnitude;

                  return (
                    <div className={`mt-4 p-3 rounded-lg border ${inRange && meetsMagnitude ? 'bg-green-900/30 border-green-800/50' : 'bg-red-900/30 border-red-800/50'}`}>
                      <p className={`text-sm font-semibold ${inRange && meetsMagnitude ? 'text-green-300' : 'text-red-300'}`}>
                        {inRange && meetsMagnitude ? '✓ In Alert Range' : '✗ Out of Alert Range'}
                      </p>
                      <div className="text-xs mt-2 space-y-1">
                        <p className="text-gray-300">Distance: <span className="font-semibold">{distance.toFixed(1)} km</span></p>
                        <p className="text-gray-300">Alert Radius: <span className="font-semibold">{alertRadius} km</span></p>
                        <p className="text-gray-300">Magnitude: <span className="font-semibold">{magnitude}</span> (Min: {minMagnitude})</p>
                        {!inRange && (
                          <p className="text-red-300 text-xs mt-1">Earthquake is {(distance - alertRadius).toFixed(1)} km outside your alert radius</p>
                        )}
                        {!meetsMagnitude && (
                          <p className="text-red-300 text-xs mt-1">Magnitude is {(minMagnitude - magnitude).toFixed(1)} below your minimum threshold</p>
                        )}
                      </div>
                    </div>
                  );
                } catch (error) {
                  return null;
                }
              })()}
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Current Alert Settings</h2>
              <button
                onClick={clearSimulatedData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                title="Clear all simulated earthquake data"
              >
                Clear Simulated Data
              </button>
            </div>
            
            <div className="space-y-4">
              {(() => {
                try {
                  const settings = JSON.parse(localStorage.getItem('alertSettings') || '{}');
                  const userLocation = JSON.parse(localStorage.getItem('userLocation') || '{}');
                  
                  return (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Minimum Magnitude</p>
                        <p className="text-white font-semibold">{settings.minMagnitude || '3.0'}</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Alert Radius</p>
                        <p className="text-white font-semibold">{settings.alertRadius || '100'} km</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm mb-1">Alert Location</p>
                        <p className="text-white font-semibold">
                          {settings.location === 'Default' || !settings.location 
                            ? (userLocation.locationName || `${userLocation.latitude?.toFixed(4)}, ${userLocation.longitude?.toFixed(4)}` || 'GPS Location')
                            : settings.location}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-sm mb-1">User Location</p>
                        <p className="text-white font-semibold">
                          {userLocation.locationName || 
                           (userLocation.latitude && userLocation.longitude 
                             ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
                             : 'Not set')}
                        </p>
                      </div>
                    </>
                  );
                } catch (error) {
                  return (
                    <p className="text-gray-400">Unable to load alert settings</p>
                  );
                }
              })()}
            </div>

            <div className="mt-6 p-4 bg-blue-900/30 border border-blue-800/50 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Note:</strong> The alert will only trigger if:
              </p>
              <ul className="text-blue-200 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Magnitude meets the minimum threshold</li>
                <li>Earthquake is within the alert radius</li>
                <li>Location is properly set</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-800/50 rounded-lg">
              <p className="text-yellow-300 text-sm font-semibold mb-2">
                Simulated Data Management
              </p>
              <p className="text-yellow-200 text-xs">
                Simulated earthquakes are marked separately and can be cleared using the "Clear Simulated Data" button above. This will remove all test earthquakes from the processed list without affecting real earthquake data.
              </p>
            </div>
          </div>
        </div>

        <EarthquakeDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedEarthquake(null);
          }}
          earthquake={selectedEarthquake ? {
            ...selectedEarthquake,
            alertLevel: selectedEarthquake.alertLevel || getAlertLevel(selectedEarthquake.magnitude).level,
            alertColor: selectedEarthquake.alertColor || getAlertLevel(selectedEarthquake.magnitude).color,
            bgColor: selectedEarthquake.bgColor || getAlertLevel(selectedEarthquake.magnitude).bgColor
          } : null}
        />

        <EarthquakeAlertModal
          isOpen={isAlertOpen}
          onClose={closeAlert}
          earthquake={alertEarthquake ? {
            ...alertEarthquake,
            alertLevel: getAlertLevel(alertEarthquake.magnitude).level,
            alertColor: getAlertLevel(alertEarthquake.magnitude).color,
            bgColor: getAlertLevel(alertEarthquake.magnitude).bgColor
          } : null}
          onViewMap={() => {
            if (alertEarthquake) {
              const formattedEarthquake = {
                ...alertEarthquake,
                alertLevel: getAlertLevel(alertEarthquake.magnitude).level,
                alertColor: getAlertLevel(alertEarthquake.magnitude).color,
                bgColor: getAlertLevel(alertEarthquake.magnitude).bgColor
              };
              setSelectedEarthquake(formattedEarthquake);
              setIsDetailsModalOpen(true);
            }
            closeAlert();
          }}
        />
      </div>
    </div>
  );
};

export default Simulation;
