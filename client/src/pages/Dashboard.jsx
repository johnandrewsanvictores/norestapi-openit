import React, { useState, useEffect, useCallback } from "react";
import DashboardSidebar from "../section/DashboardSidebar";
import MetricCards from "../section/MetricCards";
import RecentEarthquakes from "../section/RecentEarthquakes";
import AlertSettings from "../section/AlertSettings";
import SeismicActivityChart from "../section/SeismicActivityChart";
import EarthquakeAlertModal from "../components/modals/EarthquakeAlertModal";
import EarthquakeDetailsModal from "../components/modals/EarthquakeDetailsModal";
import NotificationDropdown from "../components/NotificationDropdown";
import { useEarthquakeAlert } from "../context/EarthquakeAlertContext";
import { useEarthquakeMonitor } from "../hooks/useEarthquakeMonitor";
import { shouldShowAlert } from "../utils/earthquakeAlert";
import api from "../../axios.js";

const Dashboard = () => {
  const {
    alertEarthquake,
    isAlertOpen,
    closeAlert,
    setViewMapHandler,
    handleViewMap,
    checkAndShowAlert,
  } = useEarthquakeAlert();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [earthquakes, setEarthquakes] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const response = await api.get("/earthquake/philippines", {
          params: {
            starttime: formatDate(oneYearAgo),
            endtime: formatDate(today),
            minMag: 3,
            includeSimulated: true,
          },
          withCredentials: true,
        });

        const transformedData = response.data.map((quake) => ({
          magnitude: quake.magnitude?.toString() || "0.0",
          location: quake.place || "Unknown location",
          latitude: quake.latitude,
          longitude: quake.longitude,
          depth: quake.depth?.toString() || "0.0",
          time: quake.time,
          timestamp: quake.time,
          isSimulated: quake.isSimulated || false,
        }));

        setEarthquakes(transformedData);
      } catch (error) {
        console.error("Error fetching earthquakes for monitoring:", error);
      }
    };

    fetchEarthquakes();

    const interval = setInterval(fetchEarthquakes, 5000);

    const handleSimulatedEarthquakeAdded = () => {
      fetchEarthquakes();
    };

    window.addEventListener(
      "simulatedEarthquakeAdded",
      handleSimulatedEarthquakeAdded
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "simulatedEarthquakeAdded",
        handleSimulatedEarthquakeAdded
      );
    };
  }, []);

  useEarthquakeMonitor(earthquakes);

  const viewMapHandler = useCallback((earthquake) => {
    if (earthquake) {
      setSelectedEarthquake(earthquake);
      setIsDetailsModalOpen(true);
    }
  }, []);

  React.useEffect(() => {
    setViewMapHandler(viewMapHandler);
  }, [viewMapHandler, setViewMapHandler]);

  useEffect(() => {
    const handleSimulatedAlert = (event) => {
      const earthquake = event.detail;

      if (earthquake) {
        console.log("Received earthquake alert event:", earthquake);
        checkAndShowAlert(earthquake);
      }
    };

    window.addEventListener("earthquakeAlert", handleSimulatedAlert);
    return () => {
      window.removeEventListener("earthquakeAlert", handleSimulatedAlert);
    };
  }, [checkAndShowAlert]);

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEarthquake(null);
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A1A] overflow-x-hidden">
      <DashboardSidebar />

      <div className="flex-1 lg:ml-64 ml-0 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-full">
        <div className="flex justify-end items-start mb-6 relative">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="text-gray-400 hover:text-white transition-colors relative"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          </div>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            earthquakes={earthquakes}
            onEarthquakeClick={(earthquake) => {
              setSelectedEarthquake(earthquake);
              setIsDetailsModalOpen(true);
            }}
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
            Earthquake Monitor
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Real-time seismic activity tracking
          </p>
        </div>

        <MetricCards earthquakes={earthquakes} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <RecentEarthquakes earthquakes={earthquakes} />
          <AlertSettings />
        </div>

        <SeismicActivityChart earthquakes={earthquakes} />
      </div>

      <EarthquakeAlertModal
        isOpen={isAlertOpen}
        onClose={closeAlert}
        earthquake={alertEarthquake}
        onViewMap={handleViewMap}
      />

      <EarthquakeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        earthquake={selectedEarthquake}
      />
    </div>
  );
};

export default Dashboard;
