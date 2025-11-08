import React, { useState, useEffect } from 'react';
import { getUserCountry, getLocationsByCountry } from '../utils/locationData.js';
import { calculateDistance, getCoordinatesFromLocation } from '../utils/earthquakeAlert.js';

const AnalyticsFilters = ({ onFilterChange, earthquakes = [] }) => {
  const [location, setLocation] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minMagnitude, setMinMagnitude] = useState('3.0');
  const [radius, setRadius] = useState('1000');
  const [locations, setLocations] = useState(['All']);

  useEffect(() => {
    try {
      const userCountry = getUserCountry();
      const countryLocations = getLocationsByCountry(userCountry);
      setLocations(['All', ...countryLocations]);

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }, []);

  useEffect(() => {
    const filtered = applyFilters(earthquakes);
    onFilterChange(filtered);
  }, [location, startDate, endDate, minMagnitude, radius, earthquakes]);

  const applyFilters = (quakeList) => {
    let filtered = [...quakeList];

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      const end = endDateObj.getTime();
      
      filtered = filtered.filter(q => {
        const quakeTime = typeof q.timestamp === 'number' 
          ? q.timestamp 
          : (typeof q.time === 'number' 
            ? q.time 
            : (q.time || q.timestamp ? new Date(q.time || q.timestamp).getTime() : 0));
        return quakeTime >= start && quakeTime <= end;
      });
    }

    if (minMagnitude) {
      const minMag = parseFloat(minMagnitude);
      filtered = filtered.filter(q => {
        const mag = typeof q.magnitude === 'number' 
          ? q.magnitude 
          : parseFloat(q.magnitude || 0);
        return !isNaN(mag) && mag >= minMag;
      });
    }

    if (location && location !== 'All') {
      const coords = getCoordinatesFromLocation(location);
      const radiusKm = parseFloat(radius || 1000);
      
      filtered = filtered.filter(q => {
        if (!q.latitude || !q.longitude) return false;
        const distance = calculateDistance(
          coords[1],
          coords[0],
          parseFloat(q.latitude),
          parseFloat(q.longitude)
        );
        return distance <= radiusKm;
      });
    }

    return filtered;
  };

  const handleReset = () => {
    setLocation('All');
    setMinMagnitude('3.0');
    setRadius('1000');
    
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-800 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Filters</h2>
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc === 'All' ? 'All' : loc}>
                {loc}
              </option>
            ))}
          </select>
          {location !== 'All' && (
            <div className="mt-2">
              <label className="block text-gray-400 text-xs mb-1">
                Radius (km)
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                step="10"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1A1A1A] border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-[#FF7F00] transition-colors"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Minimum Magnitude
          </label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={minMagnitude}
            onChange={(e) => setMinMagnitude(e.target.value)}
            className="w-full px-4 py-2 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;

