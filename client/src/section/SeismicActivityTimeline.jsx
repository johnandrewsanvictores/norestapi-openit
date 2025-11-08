import React from 'react';

const SeismicActivityTimeline = () => {
  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Seismic Activity Timeline</h2>
        <p className="text-sm text-gray-400">
          Visual representation of earthquake frequency and magnitude trends over time
        </p>
      </div>

      <div className="h-96 bg-[#1A1A1A] rounded-lg flex items-center justify-center border border-gray-700">
        <p className="text-gray-500 text-sm">Chart visualization will be displayed here</p>
      </div>
    </div>
  );
};

export default SeismicActivityTimeline;

