import React, { useState, useEffect } from 'react';
import EarthquakeDetailsModal from '../components/modals/EarthquakeDetailsModal';
import api from '../../axios.js';

const EarthquakeFeedList = () => {
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [earthquakes, setEarthquakes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
            minMag: 3,
            includeSimulated: true
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
              magnitude_type: quake.magnitude_type || 'SIM',
              isSimulated: quake.isSimulated || false
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

    const handleSimulatedEarthquakeAdded = () => {
      fetchEarthquakes();
    };

    window.addEventListener('simulatedEarthquakeAdded', handleSimulatedEarthquakeAdded);
    
    return () => {
      window.removeEventListener('simulatedEarthquakeAdded', handleSimulatedEarthquakeAdded);
    };
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

  const totalPages = Math.ceil(earthquakes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEarthquakes = earthquakes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        {currentEarthquakes.map((quake, index) => (
          <div
            key={`${quake.timestamp}-${index}`}
            onClick={() => handleEarthquakeClick(quake)}
            className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-white">
                  Magnitude {quake.magnitude} Earthquake
                </h3>
                {quake.isSimulated && (
                  <span className="px-2 py-0.5 bg-yellow-600/30 border border-yellow-600/50 rounded text-xs text-yellow-300 font-semibold">
                    SIMULATED
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-1">{quake.location}</p>
              <p className="text-xs text-gray-500">{quake.time}</p>
            </div>
            <div className={`ml-4 px-4 py-2 rounded-lg font-bold text-sm uppercase ${quake.alertColor} ${quake.bgColor}`}>
              {quake.alertLevel}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-[#FF7F00] text-white'
                        : 'bg-[#2A2A2A] border border-gray-700 text-white hover:bg-[#3A3A3A]'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 3 ||
                page === currentPage + 3
              ) {
                return (
                  <span key={page} className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg text-white hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <div className="mt-4 text-center text-gray-400 text-sm">
        Showing {startIndex + 1} to {Math.min(endIndex, earthquakes.length)} of {earthquakes.length} earthquakes
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
