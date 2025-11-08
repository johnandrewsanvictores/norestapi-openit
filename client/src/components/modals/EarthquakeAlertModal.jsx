import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../axios';
import { 
  getCachedSafetyGuide, 
  saveSafetyGuideToCache, 
  generateSafetyGuideKey,
  isOnline 
} from '../../utils/cacheHelper';
import { generateAlertSound } from '../../utils/soundGenerator';

const EarthquakeAlertModal = ({ isOpen, onClose, earthquake, onViewMap }) => {
  const navigate = useNavigate();
  const [safetyGuide, setSafetyGuide] = useState([]);
  const [loadingSafetyGuide, setLoadingSafetyGuide] = useState(false);
  const [isCachedGuide, setIsCachedGuide] = useState(false);
  const alertSoundRef = useRef(null);

  useEffect(() => {
    const fetchSafetyGuide = async () => {
      if (!isOpen || !earthquake) {
        setSafetyGuide([]);
        return;
      }

      const place = earthquake.location || 'Unknown location';
      const coordinates = earthquake.longitude && earthquake.latitude 
        ? [earthquake.longitude.toString(), earthquake.latitude.toString()]
        : ['121.0', '12.0'];
      
      const cacheKey = generateSafetyGuideKey(place, coordinates);
      
      
      const cachedGuide = getCachedSafetyGuide(cacheKey);
      if (cachedGuide) {
        setSafetyGuide(cachedGuide);
        setIsCachedGuide(true);
        setLoadingSafetyGuide(false);
      } else {
        setIsCachedGuide(false);
      }

      
      if (isOnline()) {
        setLoadingSafetyGuide(true);
        try {
          const response = await api.get('/pollination-safety-guide', {
            params: {
              place: place,
              'coordinates[0]': coordinates[0],
              'coordinates[1]': coordinates[1]
            },
            withCredentials: true
          });

          if (response.data && response.data.safety_guide && Array.isArray(response.data.safety_guide)) {
            setSafetyGuide(response.data.safety_guide);
            setIsCachedGuide(false);
            
            saveSafetyGuideToCache(cacheKey, response.data.safety_guide);
          } else if (!cachedGuide) {
            setSafetyGuide([]);
          }
        } catch (error) {
          console.error('Error fetching safety guide:', error);
          
          if (!cachedGuide) {
            setSafetyGuide([]);
          }
        } finally {
          setLoadingSafetyGuide(false);
        }
      } else {
        
        if (!cachedGuide) {
          setSafetyGuide([]);
        }
        setLoadingSafetyGuide(false);
      }
    };

    fetchSafetyGuide();
  }, [isOpen, earthquake]);

  
  useEffect(() => {
    if (isOpen && earthquake) {
      try {
        
        if (alertSoundRef.current) {
          alertSoundRef.current.stop();
        }
        
        
        const sound = generateAlertSound();
        alertSoundRef.current = sound;
        
        
        const playSoundSequence = () => {
          if (alertSoundRef.current) {
            alertSoundRef.current.stop();
          }
          alertSoundRef.current = generateAlertSound();
        };
        
        
        playSoundSequence();
        
        
        const interval1 = setTimeout(() => {
          if (isOpen) {
            playSoundSequence();
          }
        }, 1500);
        
        
        const interval2 = setTimeout(() => {
          if (isOpen) {
            playSoundSequence();
          }
        }, 3000);
        
        return () => {
          clearTimeout(interval1);
          clearTimeout(interval2);
          if (alertSoundRef.current) {
            alertSoundRef.current.stop();
          }
        };
      } catch (error) {
        console.error('Error playing alert sound:', error);
      }
    } else {
      
      if (alertSoundRef.current) {
        alertSoundRef.current.stop();
        alertSoundRef.current = null;
      }
    }
  }, [isOpen, earthquake]);

  if (!isOpen || !earthquake) return null;

  const handleViewMap = () => {
    if (onViewMap) {
      onViewMap();
    } else {
      onClose();
      navigate('/dashboard/feed');
    }
  };

  const handleDismiss = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg w-full max-w-lg mx-4 relative max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 text-2xl transition-colors bg-[#1A1A1A]/80 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
        <div className="overflow-y-auto flex-1">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">EARTHQUAKE ALERT</h2>
              <p className="text-white/90 text-sm mt-0.5">Significant seismic activity detected</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A2A] rounded-lg m-4 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">Magnitude</p>
            <p className="text-3xl font-bold text-red-500">{earthquake.magnitude}</p>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-gray-300">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{earthquake.location}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm">Depth: {earthquake.depth ? (earthquake.depth.toString().includes('km') ? earthquake.depth : `${earthquake.depth} km`) : '12.5 km'}</span>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{earthquake.time}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/30 rounded-lg m-4 p-5 border border-blue-800/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-300 font-bold text-lg">Immediate Actions</h3>
            {isCachedGuide && !isOnline() && (
              <span className="text-xs text-blue-400 bg-blue-900/50 px-2 py-1 rounded">
                Offline
              </span>
            )}
          </div>
          {loadingSafetyGuide ? (
            <div className="text-blue-200 text-sm">Loading safety guidelines...</div>
          ) : safetyGuide.length > 0 ? (
            <ul className="space-y-2 text-white text-sm">
              {safetyGuide.map((guide, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{guide}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2 text-white text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Drop, Cover, and Hold On if indoors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Move away from buildings if outdoors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Do not use elevators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Check for injuries after shaking stops</span>
              </li>
            </ul>
          )}
        </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-800 bg-[#1A1A1A]">
          <button
            onClick={handleDismiss}
            className="flex-1 bg-[#2A2A2A] text-white py-3 rounded-lg font-semibold hover:bg-[#3A3A3A] transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleViewMap}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            View Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeAlertModal;

