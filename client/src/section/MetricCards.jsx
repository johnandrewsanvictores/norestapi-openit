import React from "react";

const MetricCards = () => {
  const metrics = [
    {
      title: "Active Events",
      value: "12",
      change: "+2 this hour",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      title: "Avg Magnitude",
      value: "4.2",
      change: "Last 24h",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      ),
    },
    {
      title: "Alerts Sent",
      value: "1,234",
      change: "+45 today",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      title: "Latest Event",
      value: "2 min ago",
      change: "Magnitude 3.8",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-[#2A2A2A] rounded-lg p-4 sm:p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="text-gray-400 text-xs sm:text-sm font-medium">
              {metric.title}
            </div>
            <div className="text-[#FF7F00]">{metric.icon}</div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            {metric.value}
          </div>
          <div className="text-xs sm:text-sm text-gray-400">
            {metric.change}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
