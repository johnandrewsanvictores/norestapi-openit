import React, { useMemo } from 'react';

const SeismicActivityTimeline = ({ earthquakes = [] }) => {
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

  const chartData = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const recentQuakes = earthquakes.filter(q => {
      const quakeTime = getQuakeTimestamp(q);
      return quakeTime >= thirtyDaysAgo && quakeTime <= now;
    });

    const dailyData = {};
    recentQuakes.forEach(quake => {
      const quakeTime = getQuakeTimestamp(quake);
      if (quakeTime === 0) return; 
      
      const date = new Date(quakeTime);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { count: 0, magnitudes: [], date: dateKey };
      }
      dailyData[dateKey].count++;
      dailyData[dateKey].magnitudes.push(parseFloat(quake.magnitude || 0));
    });

    const sortedData = Object.values(dailyData)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); 

    return sortedData;
  }, [earthquakes]);

  const maxCount = Math.max(...chartData.map(d => d.count), 1);
  const maxMagnitude = Math.max(...chartData.flatMap(d => d.magnitudes), 1);

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white mb-2">Seismic Activity Timeline (Last 30 Days)</h2>
        <p className="text-sm text-gray-400">
          Daily earthquake frequency and average magnitude trends
        </p>
      </div>

      <div className="h-96 bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">No earthquake data available for the last 30 days</p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 flex items-stretch gap-2">
              {chartData.map((day, index) => {
                const avgMagnitude = day.magnitudes.length > 0
                  ? day.magnitudes.reduce((a, b) => a + b, 0) / day.magnitudes.length
                  : 0;
                const heightPercent = (day.count / maxCount) * 100;
                const magnitudeColor = avgMagnitude >= 5.0 ? 'bg-red-500' : 
                                      avgMagnitude >= 4.0 ? 'bg-[#FF7F00]' : 
                                      'bg-blue-500';
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div
                      className={`w-full ${magnitudeColor} rounded-t transition-all hover:opacity-80 cursor-pointer`}
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      title={`${day.date}: ${day.count} earthquakes, Avg: ${avgMagnitude.toFixed(1)}`}
                    />
                    
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-[#2A2A2A] text-white text-xs px-2 py-1 rounded border border-gray-700 z-10 whitespace-nowrap">
                      <div>{day.date}</div>
                      <div>Count: {day.count}</div>
                      <div>Avg Mag: {avgMagnitude.toFixed(1)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {chartData.length > 0 && (
                <>
                  <span>{new Date(chartData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(chartData[Math.floor(chartData.length / 2)].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span>{new Date(chartData[chartData.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-400">Magnitude &lt; 4.0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#FF7F00] rounded"></div>
                <span className="text-gray-400">Magnitude 4.0 - 5.0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-400">Magnitude ≥ 5.0</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeismicActivityTimeline;
