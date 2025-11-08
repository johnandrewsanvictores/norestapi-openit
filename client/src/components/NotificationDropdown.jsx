import React, { useState, useEffect, useRef, useCallback } from 'react';
import { calculateDistance, getUserLocation, getAlertSettings, getCoordinatesFromLocation } from '../utils/earthquakeAlert';

const NotificationDropdown = ({ isOpen, onClose, earthquakes, onEarthquakeClick }) => {
  const dropdownRef = useRef(null);
  const [nearbyEarthquakes, setNearbyEarthquakes] = useState([]);

  const calculateNearbyEarthquakes = useCallback(() => {
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
      setNearbyEarthquakes([]);
      return;
    }

    const earthquakesWithDistance = earthquakes
      .filter((earthquake) => {
        return earthquake.latitude && earthquake.longitude;
      })
      .map((earthquake) => {
        const distance = calculateDistance(
          alertLocationLat,
          alertLocationLon,
          parseFloat(earthquake.latitude),
          parseFloat(earthquake.longitude)
        );

        return {
          ...earthquake,
          distance: distance
        };
      })
      .sort((a, b) => {
        const timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.time || a.timestamp).getTime();
        const timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.time || b.timestamp).getTime();
        
        if (timeB !== timeA) {
          return timeB - timeA; 
        }
        return a.distance - b.distance; 
      })
      .slice(0, 10); 

    setNearbyEarthquakes(earthquakesWithDistance);
  }, [earthquakes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      calculateNearbyEarthquakes();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, calculateNearbyEarthquakes, onClose]);

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const quakeTime = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    const diff = now - quakeTime;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div 
        ref={dropdownRef}
        className="absolute top-16 right-8 w-96 bg-[#2A2A2A] rounded-lg shadow-2xl border border-gray-800 max-h-[600px] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Earthquakes</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">10 most recent near your location</p>
        </div>

        <div className="overflow-y-auto flex-1">
          {nearbyEarthquakes.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">No recent earthquakes found near your location</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {nearbyEarthquakes.map((earthquake, index) => {
                const alert = getAlertLevel(earthquake.magnitude);
                return (
                  <div
                    key={`${earthquake.timestamp || earthquake.time}-${index}`}
                    onClick={() => {
                      if (onEarthquakeClick) {
                        onEarthquakeClick(earthquake);
                      }
                      onClose();
                    }}
                    className="p-4 hover:bg-[#3A3A3A] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl font-bold text-white">
                            M {parseFloat(earthquake.magnitude).toFixed(1)}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${alert.color} ${alert.bgColor}`}>
                            {alert.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{earthquake.location}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatTimeAgo(earthquake.timestamp || earthquake.time)}</span>
                          <span>•</span>
                          <span>{earthquake.distance.toFixed(1)} km away</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;

