import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LocationPermissionModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');

  const handleRequestLocation = () => {
    setIsRequesting(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        
        try {
          const { getLocationName } = await import('../../utils/locationHelper.js');
          const locationName = getLocationName(locationData.latitude, locationData.longitude);
          locationData.locationName = locationName;
        } catch (error) {
          console.error('Error getting location name:', error);
          locationData.locationName = `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
        }
        
        localStorage.setItem('locationPermission', 'granted');
        localStorage.setItem('userLocation', JSON.stringify(locationData));
        
        window.dispatchEvent(new Event('locationUpdated'));
        
        setIsRequesting(false);
        onClose();
        navigate('/dashboard');
      },
      (error) => {
        setIsRequesting(false);
        if (error.code === error.PERMISSION_DENIED) {
          setError('Location permission is required to use this service. Please enable location access in your browser settings.');
        } else {
          setError('Unable to retrieve your location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg p-8 w-full max-w-md mx-4 relative">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Location Permission Required</h2>
          </div>
          <p className="text-gray-400 text-sm ml-11">Enable location access for earthquake alerts</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-[#FF7F00]/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#FF7F00]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <p className="text-white text-center mb-4">
            To provide you with accurate earthquake alerts and real-time monitoring, we need access to your location.
          </p>

          <div className="bg-[#1A1A1A] rounded-lg p-4 mb-4">
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Why we need your location:</strong>
            </p>
            <ul className="text-gray-400 text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Send alerts for earthquakes near you</li>
              <li>Provide accurate distance calculations</li>
              <li>Customize alerts based on your area</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-300 text-sm mb-4">
              {error}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={handleRequestLocation}
            disabled={isRequesting}
            className="w-full bg-[#FF7F00] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#FF8F20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequesting ? 'Requesting Location...' : 'Enable Location Access'}
          </button>
        </div>

        <p className="text-gray-500 text-xs text-center mt-4">
          Location access is required to continue to the dashboard
        </p>
      </div>
    </div>
  );
};

export default LocationPermissionModal;

