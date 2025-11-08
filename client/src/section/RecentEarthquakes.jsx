import React from "react";

const RecentEarthquakes = ({ earthquakes = [] }) => {
  const getQuakeTimestamp = (quake) => {
    if (typeof quake.timestamp === 'number') {
      return quake.timestamp;
    }
    if (typeof quake.time === 'number') {
      return quake.time;
    }
    if (quake.time || quake.timestamp) {
      const parsed = new Date(quake.time || quake.timestamp).getTime();
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return 0;
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const quakeTime = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    const diff = now - quakeTime;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getAlertLevel = (magnitude) => {
    const mag = parseFloat(magnitude || 0);
    if (mag >= 6.0) {
      return 'bg-red-500';
    } else if (mag >= 4.5) {
      return 'bg-[#FF7F00]';
    } else {
      return 'bg-yellow-500';
    }
  };

  const recentEarthquakes = [...earthquakes]
    .sort((a, b) => {
      const timeA = getQuakeTimestamp(a);
      const timeB = getQuakeTimestamp(b);
      return timeB - timeA;
    })
    .slice(0, 5);

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4 sm:p-6 border border-gray-800">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">
          Recent Earthquakes
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          Live feed from USGS Earthquake Hazards Program
        </p>
      </div>

      <div className="space-y-4">
        {recentEarthquakes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No recent earthquakes</p>
          </div>
        ) : (
          recentEarthquakes.map((quake, index) => {
            const magnitude = parseFloat(quake.magnitude || 0);
            const depth = parseFloat(quake.depth || 0);
            const timestamp = getQuakeTimestamp(quake);
            
            return (
              <div key={`${quake.timestamp || quake.time}-${index}`} className="flex items-center justify-between py-4 border-b border-gray-700 last:border-0">
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-2 h-2 ${getAlertLevel(magnitude)} rounded-full`}></div>
                  <div>
                    <div className="text-white font-medium">{quake.location || 'Unknown location'}</div>
                    <div className="text-sm text-gray-400">
                      Depth {depth.toFixed(1)} km • {formatTimeAgo(timestamp)}
                      {quake.isSimulated && (
                        <span className="ml-2 px-1.5 py-0.5 bg-yellow-600/30 border border-yellow-600/50 rounded text-xs text-yellow-300">
                          SIMULATED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#FF7F00]">
                  {magnitude.toFixed(1)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentEarthquakes;
