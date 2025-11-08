import React, { useState } from "react";
import DashboardSidebar from "../section/DashboardSidebar";
import AnalyticsMetrics from "../section/AnalyticsMetrics";
import SeismicActivityTimeline from "../section/SeismicActivityTimeline";

const Analytics = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#1A1A1A]">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 lg:ml-64 w-full">
        <div className="lg:hidden bg-[#1A1A1A] border-b border-gray-800 p-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="text-gray-400 hover:text-white transition-colors"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-[#FF7F00]"
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
              <h1 className="text-xl font-bold text-white">Alertify</h1>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
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
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <div className="hidden lg:flex justify-end items-start mb-6">
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
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
          </div>

          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
              Analytics
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Seismic data and trends
            </p>
          </div>

          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              Analytics
            </h2>

            <AnalyticsMetrics />
          </div>

          <SeismicActivityTimeline />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
