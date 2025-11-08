import React from 'react';

const RecentEarthquakes = () => {
  const earthquakes = [
    {
      location: "San Francisco, CA",
      magnitude: "5.2",
      depth: "12.5 km",
      time: "2 minutes ago"
    },
    {
      location: "Los Angeles, CA",
      magnitude: "3.8",
      depth: "8.2 km",
      time: "15 minutes ago"
    },
    {
      location: "Fresno, CA",
      magnitude: "2.9",
      depth: "5.1 km",
      time: "1 hour ago"
    },
    {
      location: "San Jose, CA",
      magnitude: "3.1",
      depth: "9.8 km",
      time: "2 hours ago"
    }
  ];

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Recent Earthquakes</h2>
        <p className="text-sm text-gray-400">Live feed from USGS Earthquake Hazards Program</p>
      </div>

      <div className="space-y-4">
        {earthquakes.map((quake, index) => (
          <div key={index} className="flex items-center justify-between py-4 border-b border-gray-700 last:border-0">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div>
                <div className="text-white font-medium">{quake.location}</div>
                <div className="text-sm text-gray-400">
                  Depth {quake.depth} • {quake.time}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-[#FF7F00]">
              {quake.magnitude}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentEarthquakes;

