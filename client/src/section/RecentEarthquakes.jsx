import React from "react";

const RecentEarthquakes = () => {
  const earthquakes = [
    {
      location: "San Francisco, CA",
      magnitude: "5.2",
      depth: "12.5 km",
      time: "2 minutes ago",
    },
    {
      location: "Los Angeles, CA",
      magnitude: "3.8",
      depth: "8.2 km",
      time: "15 minutes ago",
    },
    {
      location: "Fresno, CA",
      magnitude: "2.9",
      depth: "5.1 km",
      time: "1 hour ago",
    },
    {
      location: "San Jose, CA",
      magnitude: "3.1",
      depth: "9.8 km",
      time: "2 hours ago",
    },
  ];

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

      <div className="space-y-3 sm:space-y-4">
        {earthquakes.map((quake, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-700 last:border-0"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base text-white font-medium truncate">
                  {quake.location}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  Depth {quake.depth} • {quake.time}
                </div>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#FF7F00] ml-2 flex-shrink-0">
              {quake.magnitude}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentEarthquakes;
