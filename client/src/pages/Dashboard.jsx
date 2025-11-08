import React, { useState, useMemo, useCallback } from 'react';
import DashboardSidebar from '../section/DashboardSidebar';
import MetricCards from '../section/MetricCards';
import RecentEarthquakes from '../section/RecentEarthquakes';
import AlertSettings from '../section/AlertSettings';
import SeismicActivityChart from '../section/SeismicActivityChart';
import EarthquakeAlertModal from '../components/modals/EarthquakeAlertModal';
import EarthquakeDetailsModal from '../components/modals/EarthquakeDetailsModal';
import { useEarthquakeAlert } from '../context/EarthquakeAlertContext';
import { useEarthquakeMonitor } from '../hooks/useEarthquakeMonitor';

const Dashboard = () => {
  const { alertEarthquake, isAlertOpen, closeAlert, setViewMapHandler, handleViewMap } = useEarthquakeAlert();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);

  // Sample earthquakes data - in a real app, this would come from an API
  // Using useMemo to prevent recreation on every render
  const sampleEarthquakes = useMemo(() => [
    {
      magnitude: "5.2",
      location: "San Francisco, CA",
      depth: "12.5",
      time: "2 minutes ago",
      alertLevel: "ALERT",
      alertColor: "text-red-500",
      bgColor: "bg-red-500/20"
    },
    {
      magnitude: "3.8",
      location: "Los Angeles, CA",
      depth: "8.2",
      time: "15 minutes ago",
      alertLevel: "WARNING",
      alertColor: "text-[#FF7F00]",
      bgColor: "bg-[#FF7F00]/20"
    }
  ], []);

  // Monitor earthquakes and trigger alerts
  useEarthquakeMonitor(sampleEarthquakes);

  // Set up view map handler to open earthquake details modal
  const viewMapHandler = useCallback((earthquake) => {
    if (earthquake) {
      setSelectedEarthquake(earthquake);
      setIsDetailsModalOpen(true);
    }
  }, []);

  React.useEffect(() => {
    setViewMapHandler(viewMapHandler);
  }, [viewMapHandler, setViewMapHandler]);

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEarthquake(null);
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A1A]">
      <DashboardSidebar />

      <div className="flex-1 ml-64 p-8">
        <div className="flex justify-end items-start mb-6">
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Earthquake Monitor</h1>
          <p className="text-gray-400">Real-time seismic activity tracking</p>
        </div>

        <MetricCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentEarthquakes />
          <AlertSettings />
        </div>

        <SeismicActivityChart />
      </div>

      {/* Earthquake Alert Modal */}
      <EarthquakeAlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        earthquake={alertEarthquake}
        onViewMap={handleViewMap}
      />

      {/* Earthquake Details Modal (for map view) */}
      <EarthquakeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        earthquake={selectedEarthquake}
      />
    </div>
  );
};

export default Dashboard;

