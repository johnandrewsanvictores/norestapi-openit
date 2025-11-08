import React from 'react';

const EarthquakeFeedList = () => {
  const earthquakes = [
    {
      magnitude: "5.2",
      location: "Pacific Ocean, 45km west of San Francisco",
      time: "2 minutes ago",
      alertLevel: "ALERT",
      alertColor: "text-red-500",
      bgColor: "bg-red-500/20"
    },
    {
      magnitude: "3.8",
      location: "East Bay Hills, California",
      time: "15 minutes ago",
      alertLevel: "WARNING",
      alertColor: "text-[#FF7F00]",
      bgColor: "bg-[#FF7F00]/20"
    },
    {
      magnitude: "2.1",
      location: "Hayward Fault, California",
      time: "32 minutes ago",
      alertLevel: "LOW",
      alertColor: "text-green-500",
      bgColor: "bg-green-500/20"
    }
  ];

  return (
    <div className="space-y-4">
      {earthquakes.map((quake, index) => (
        <div
          key={index}
          className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-colors"
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
  );
};

export default EarthquakeFeedList;

