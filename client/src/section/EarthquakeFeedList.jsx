import React, { useState, useEffect } from 'react';
import EarthquakeDetailsModal from '../components/modals/EarthquakeDetailsModal';
import api from '../../axios.js';

const EarthquakeFeedList = () => {
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [earthquakes, setEarthquakes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getDateRange = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      starttime: formatDate(oneYearAgo),
      endtime: formatDate(today)
    };
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date().getTime();
    const quakeTime = timestamp;
    const diff = now - quakeTime;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getAlertLevel = (magnitude) => {
    if (magnitude >= 6.0) {
      return {
        level: 'ALERT',
        color: 'text-red-500',
        bgColor: 'bg-red-500/20'
      };
    } else if (magnitude >= 4.5) {
      return {
        level: 'WARNING',
        color: 'text-[#FF7F00]',
        bgColor: 'bg-[#FF7F00]/20'
      };
    } else {
      return {
        level: 'LOW',
        color: 'text-green-500',
        bgColor: 'bg-green-500/20'
      };
    }
  };

  useEffect(() => {
    const fetchEarthquakes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const dateRange = getDateRange();
        const response = await api.get('/earthquake/philippines', {
          params: {
            starttime: dateRange.starttime,
            endtime: dateRange.endtime,
            minMag: 3
          },
          withCredentials: true
        });

        const transformedData = response.data
          .map((quake) => {
            const alert = getAlertLevel(quake.magnitude);
            return {
              magnitude: quake.magnitude?.toFixed(1) || '0.0',
              location: quake.place || 'Unknown location',
              time: formatTimeAgo(quake.time),
              timestamp: quake.time,
              depth: quake.depth?.toFixed(1) || '0.0',
              longitude: quake.longitude,
              latitude: quake.latitude,
              alertLevel: alert.level,
              alertColor: alert.color,
              bgColor: alert.bgColor,
              tsunami: quake.tsunami || 0,
              magnitude_type: quake.magnitude_type
            };
          })
          .sort((a, b) => b.timestamp - a.timestamp); 

        setEarthquakes(transformedData);
      } catch (err) {
        console.error('Error fetching earthquakes:', err);
        setError(err.response?.data?.error || 'Failed to load earthquake data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarthquakes();
  }, []);

  const handleEarthquakeClick = (earthquake) => {
    setSelectedEarthquake(earthquake);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEarthquake(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7F00] mb-4"></div>
          <p className="text-gray-400">Loading earthquake data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 text-center">
        <p className="text-red-300 mb-2">Error loading earthquake data</p>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (earthquakes.length === 0) {
    return (
      <div className="bg-[#2A2A2A] rounded-lg p-8 text-center">
        <p className="text-gray-400">No earthquake data available for the selected period.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {earthquakes.map((quake, index) => (
          <div
            key={`${quake.timestamp}-${index}`}
            onClick={() => handleEarthquakeClick(quake)}
            className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Magnitude {quake.magnitude} Earthquake
              </h3>
              <p className="text-sm text-gray-400 mb-1">{quake.location}</p>
              <p className="text-xs text-gray-500">{quake.time}</p>
            </div>
            <div className={`ml-4 px-4 py-2 rounded-lg font-bold text-sm uppercase ${quake.alertColor} ${quake.bgColor}`}>
              {quake.alertLevel}
            </div>
          </div>
        ))}
      </div>

      <EarthquakeDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        earthquake={selectedEarthquake}
      />
    </>
  );
};

export default EarthquakeFeedList;
