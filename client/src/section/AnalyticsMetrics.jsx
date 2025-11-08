import React from 'react';

const AnalyticsMetrics = () => {
  const metrics = [
    {
      title: "Total Earthquakes (24h)",
      value: "24"
    },
    {
      title: "Average Magnitude",
      value: "3.2"
    },
    {
      title: "High Magnitude Events",
      value: "2"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
          <div className="text-gray-400 text-sm font-medium mb-2">{metric.title}</div>
          <div className="text-3xl font-bold text-white">{metric.value}</div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsMetrics;

