import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../../axios.js';
import { showConfirmation, showSuccess } from '../utils/alertHelper.js';
import { getUserLocationName } from '../utils/locationHelper.js';

const DashboardSidebar = () => {
  const { setUser, user } = useAuth();
  const navigate = useNavigate();
  const [isProcessingLogout, setIsProcessingLogout] = useState(false);
  const [userLocationName, setUserLocationName] = useState('Location not set');
  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? "flex items-center space-x-3 px-4 py-3 bg-[#FF7F00]/20 text-[#FF7F00] border-l-4 border-[#FF7F00] transition-colors"
      : "flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors";
  };

  useEffect(() => {
    const updateLocationName = () => {
      const locationName = getUserLocationName();
      setUserLocationName(locationName);
    };
    
    updateLocationName();
    
    const handleLocationUpdate = () => {
      updateLocationName();
    };
    
    const handleStorageChange = () => {
      updateLocationName();
    };
    
    window.addEventListener('locationUpdated', handleLocationUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(updateLocationName, 2000);
    
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const confirmed = await showConfirmation({
        title: "Log out?",
        text: "Are you sure you want to log out?",
        confirmButtonText: "Log Out",
      });

      if (!confirmed) return;

      setIsProcessingLogout(true);
      
      try {
        const res = await api.post("/auth/logout", {}, { withCredentials: true });
        
        setUser(null);
        
        localStorage.removeItem('userLocation');
        localStorage.removeItem('locationPermission');
        localStorage.removeItem('alertSettings');
        
        if (res.data && res.data.message) {
          showSuccess(res.data.message);
        } else {
          showSuccess("Logged out successfully");
        }
        
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
        
        setUser(null);
        localStorage.removeItem('userLocation');
        localStorage.removeItem('locationPermission');
        localStorage.removeItem('alertSettings');
        
        navigate("/");
        
        if (error.response && error.response.data && error.response.data.error) {
          alert(`Logout error: ${error.response.data.error}`);
        }
      }
    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsProcessingLogout(false);
    }
  };

  return (
    <aside className="w-64 bg-[#1A1A1A] h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-2 mb-1">
          <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h1 className="text-2xl font-bold text-white">SeismoAlert</h1>
        </div>
        <p className="text-sm text-gray-400">Early warning system</p>
      </div>

      <div className="p-6 border-b border-gray-800">
        <p className="text-xs text-gray-500 uppercase mb-2">YOUR LOCATION</p>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-white font-medium text-sm">{userLocationName}</span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <NavLink to="/dashboard" className={getNavLinkClass} end>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Active Alerts</span>
        </NavLink>

        <NavLink to="/dashboard/feed" className={getNavLinkClass}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>Earthquake Feed</span>
        </NavLink>

        <NavLink to="/dashboard/analytics" className={getNavLinkClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Analytics</span>
        </NavLink>

        <NavLink to="/dashboard/settings" className={getNavLinkClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </NavLink>

        <NavLink to="/dashboard/profile" className={getNavLinkClass}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile</span>
        </NavLink>

        {user && user.role === 'admin' && (
          <NavLink to="/dashboard/simulation" className={getNavLinkClass}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Simulation</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          disabled={isProcessingLogout}
          className="w-full flex items-center space-x-3 text-red-500 hover:text-white hover:bg-red-500/20 rounded-lg px-4 py-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{isProcessingLogout ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
