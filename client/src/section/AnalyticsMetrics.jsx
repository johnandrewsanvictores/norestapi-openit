import React from 'react';

const AnalyticsMetrics = ({ earthquakes = [] }) => {
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

  const calculateAverageMagnitude = (quakeList) => {
    if (quakeList.length === 0) return 0;
    const sum = quakeList.reduce((acc, q) => acc + parseFloat(q.magnitude || 0), 0);
    return (sum / quakeList.length).toFixed(1);
  };

  const countHighMagnitude = (quakeList) => {
    const highMagQuakes = quakeList.filter(q => {
      let mag;
      if (typeof q.magnitude === 'number') {
        mag = q.magnitude;
      } else if (typeof q.magnitude === 'string') {
        mag = parseFloat(q.magnitude);
      } else {
        mag = 0;
      }
      
      const isHigh = !isNaN(mag) && mag >= 5.0;
      
      return isHigh;
    });
    
    return highMagQuakes.length;
  };

  const simulatedCount = earthquakes.filter(q => q.isSimulated).length;
  const realCount = earthquakes.filter(q => !q.isSimulated).length;

  const metrics = [
    {
      title: "Total Earthquakes",
      value: earthquakes.length.toString(),
      subtitle: earthquakes.length > 0 
        ? `${realCount} real, ${simulatedCount} simulated`
        : 'No data available',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "text-blue-400"
    },
    {
      title: "Average Magnitude",
      value: earthquakes.length > 0 ? calculateAverageMagnitude(earthquakes) : '0.0',
      subtitle: earthquakes.length > 0 
        ? (() => {
            const magnitudes = earthquakes.map(q => parseFloat(q.magnitude || 0)).filter(m => !isNaN(m));
            if (magnitudes.length > 0) {
              return `Range: ${Math.min(...magnitudes).toFixed(1)} - ${Math.max(...magnitudes).toFixed(1)}`;
            }
            return 'No valid magnitudes';
          })()
        : 'No data available',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "text-[#FF7F00]"
    },
    {
      title: "High Magnitude Events (≥5.0)",
      value: countHighMagnitude(earthquakes).toString(),
      subtitle: earthquakes.length > 0
        ? `${((countHighMagnitude(earthquakes) / earthquakes.length) * 100).toFixed(1)}% of total`
        : 'No data available',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: "text-red-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-400 text-sm font-medium">{metric.title}</div>
            <div className={metric.color}>
              {metric.icon}
            </div>
          </div>
          <div className={`text-4xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
          {metric.subtitle && (
            <div className="text-xs text-gray-500">{metric.subtitle}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnalyticsMetrics;

