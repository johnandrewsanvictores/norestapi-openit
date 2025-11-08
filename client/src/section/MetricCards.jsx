import React from 'react';

const MetricCards = ({ earthquakes = [] }) => {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

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

  const lastHour = earthquakes.filter(q => {
    const quakeTime = getQuakeTimestamp(q);
    return quakeTime >= oneHourAgo && quakeTime <= now;
  });

  const last24h = earthquakes.filter(q => {
    const quakeTime = getQuakeTimestamp(q);
    return quakeTime >= twentyFourHoursAgo && quakeTime <= now;
  });

  const last7Days = earthquakes.filter(q => {
    const quakeTime = getQuakeTimestamp(q);
    return quakeTime >= sevenDaysAgo && quakeTime <= now;
  });

  const calculateAverageMagnitude = (quakeList) => {
    if (quakeList.length === 0) return '0.0';
    const sum = quakeList.reduce((acc, q) => acc + parseFloat(q.magnitude || 0), 0);
    return (sum / quakeList.length).toFixed(1);
  };

  const getLatestEarthquake = () => {
    if (earthquakes.length === 0) return null;
    const sorted = [...earthquakes].sort((a, b) => {
      const timeA = getQuakeTimestamp(a);
      const timeB = getQuakeTimestamp(b);
      return timeB - timeA;
    });
    return sorted[0];
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const quakeTime = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    const diff = now - quakeTime;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const latestEarthquake = getLatestEarthquake();
  const lastHourCount = lastHour.length;
  const previousHourCount = earthquakes.filter(q => {
    const quakeTime = getQuakeTimestamp(q);
    const twoHoursAgo = now - (2 * 60 * 60 * 1000);
    return quakeTime >= twoHoursAgo && quakeTime < oneHourAgo;
  }).length;
  const hourChange = lastHourCount - previousHourCount;

  const metrics = [
    {
      title: "Active Events (24h)",
      value: last24h.length.toString(),
      change: hourChange >= 0 
        ? `+${hourChange} this hour` 
        : `${hourChange} this hour`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Avg Magnitude",
      value: calculateAverageMagnitude(last24h),
      change: `Last 7 days: ${calculateAverageMagnitude(last7Days)}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      title: "High Magnitude (≥5.0)",
      value: last24h.filter(q => parseFloat(q.magnitude || 0) >= 5.0).length.toString(),
      change: `${last7Days.filter(q => parseFloat(q.magnitude || 0) >= 5.0).length} in last 7 days`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      title: "Latest Event",
      value: latestEarthquake ? formatTimeAgo(latestEarthquake.timestamp || latestEarthquake.time) : 'No data',
      change: latestEarthquake ? `Magnitude ${parseFloat(latestEarthquake.magnitude || 0).toFixed(1)}` : '',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-400 text-sm font-medium">{metric.title}</div>
            <div className="text-[#FF7F00]">
              {metric.icon}
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
          <div className="text-sm text-gray-400">{metric.change}</div>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;

