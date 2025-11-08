import React from 'react';
import DashboardSidebar from '../section/DashboardSidebar';
import MetricCards from '../section/MetricCards';
import RecentEarthquakes from '../section/RecentEarthquakes';
import AlertSettings from '../section/AlertSettings';
import SeismicActivityChart from '../section/SeismicActivityChart';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#1A1A1A]">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Earthquake Monitor</h1>
          <p className="text-gray-400">Real-time seismic activity tracking</p>
        </div>

        {/* Metric Cards */}
        <MetricCards />

        {/* Middle Section - Recent Earthquakes & Alert Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentEarthquakes />
          <AlertSettings />
        </div>

        {/* Bottom Section - Seismic Activity Chart */}
        <SeismicActivityChart />
      </div>
    </div>
  );
};

export default Dashboard;

