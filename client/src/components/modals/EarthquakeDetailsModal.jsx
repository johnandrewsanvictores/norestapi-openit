import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../../../axios';
import { 
  getCachedSafetyGuide, 
  saveSafetyGuideToCache, 
  generateSafetyGuideKey,
  isOnline 
} from '../../utils/cacheHelper';
import { getUserLocation, getAlertSettings, calculateDistance, getCoordinatesFromLocation } from '../../utils/earthquakeAlert';
import EvacuationMapModal from './EvacuationMapModal';

const EarthquakeDetailsModal = ({ isOpen, onClose, earthquake }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [safetyGuide, setSafetyGuide] = useState([]);
  const [loadingSafetyGuide, setLoadingSafetyGuide] = useState(false);
  const [isCachedGuide, setIsCachedGuide] = useState(false);
  const [isEvacuationMapOpen, setIsEvacuationMapOpen] = useState(false);
  const [isUserInRange, setIsUserInRange] = useState(false);

  // Format time to readable format
  const formatTime = (timeValue) => {
    if (!timeValue) return 'Unknown time';
    
    // If it's already a formatted string (like "1 day ago" or "27/11/2025, 09:45:25"), return it as-is
    if (typeof timeValue === 'string') {
      const lowerValue = timeValue.toLowerCase();
      if (lowerValue.includes('ago') || timeValue.includes('/') || lowerValue.includes('day') || 
          lowerValue.includes('minute') || lowerValue.includes('hour') || lowerValue.includes('second') ||
          lowerValue.includes('year') || lowerValue.includes('month') || lowerValue.includes('week')) {
        return timeValue;
      }
    }
    
    let timestamp;
    
    try {
    if (typeof timeValue === 'number') {
        // Check if timestamp is in seconds (less than year 2000 in milliseconds)
        // Unix timestamps before 2000-01-01 in seconds would be < 946684800000
        // If the number is less than 10000000000, it's likely in seconds
        if (timeValue < 10000000000) {
          timestamp = timeValue * 1000; // Convert seconds to milliseconds
        } else {
      timestamp = timeValue;
        }
    } else if (typeof timeValue === 'string') {
      // Check if it's a numeric string (Unix timestamp)
      if (/^\d+$/.test(timeValue)) {
          const numValue = parseInt(timeValue);
          // Check if it's in seconds (less than 13 digits)
          if (timeValue.length < 13) {
            timestamp = numValue * 1000; // Convert seconds to milliseconds
          } else {
            timestamp = numValue;
          }
        } else {
          // Try to parse as ISO date string
          const parsed = new Date(timeValue);
          timestamp = parsed.getTime();
        }
      } else if (timeValue instanceof Date) {
        timestamp = timeValue.getTime();
      } else {
        // Try to convert to Date and then to timestamp
        const parsed = new Date(timeValue);
        timestamp = parsed.getTime();
    }
    
    // Validate timestamp - check if it's a valid number
    if (isNaN(timestamp) || !isFinite(timestamp)) {
        console.warn('Invalid timestamp value:', timeValue);
      return 'Invalid time';
    }
      
      // Check if timestamp is reasonable (not too far in past or future)
      const now = Date.now();
      const minTimestamp = new Date('1900-01-01').getTime();
      const maxTimestamp = now + (10 * 365 * 24 * 60 * 60 * 1000); // 10 years in future
      
      if (timestamp < minTimestamp || timestamp > maxTimestamp) {
        console.warn('Timestamp out of reasonable range:', timestamp, timeValue);
        // Still try to format it, but log the warning
      }
    
    // Format for Philippines timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const date = new Date(timestamp);
    
    // Double-check the date is valid before formatting
    if (isNaN(date.getTime())) {
        console.warn('Invalid date from timestamp:', timestamp, timeValue);
      return 'Invalid time';
    }
    
    const formatted = formatter.format(date);
    const [datePart, timePart] = formatted.split(', ');
      
      if (!datePart || !timePart) {
        console.warn('Unexpected date format:', formatted);
        // Fallback to simple date formatting
        return date.toLocaleString('en-US', { 
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      }
      
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');
    
    return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
    } catch (error) {
      console.error('Error formatting time:', error, timeValue);
      return 'Invalid time';
    }
  };

  // Get alert level if not provided
  const getAlertLevel = (magnitude) => {
    const mag = parseFloat(magnitude) || 0;
    if (mag >= 6.0) {
      return { level: 'ALERT', color: 'text-red-500', bgColor: 'bg-red-500/20' };
    } else if (mag >= 4.5) {
      return { level: 'WARNING', color: 'text-[#FF7F00]', bgColor: 'bg-[#FF7F00]/20' };
    } else {
      return { level: 'LOW', color: 'text-green-500', bgColor: 'bg-green-500/20' };
    }
  };

  // Format magnitude to 1 decimal place
  const formatMagnitude = (magnitude) => {
    const mag = parseFloat(magnitude);
    return isNaN(mag) ? '0.0' : mag.toFixed(1);
  };

  const getCoordinates = (earthquake) => {
    if (earthquake.longitude && earthquake.latitude) {
      return [earthquake.longitude, earthquake.latitude];
    }
    
    const locationMap = {
      'Pacific Ocean, 45km west of San Francisco': [-122.8, 37.7],
      'East Bay Hills, California': [-122.2, 37.8],
      'Hayward Fault, California': [-122.1, 37.6],
      'San Francisco, CA': [-122.4194, 37.7749],
      'Los Angeles, CA': [-118.2437, 34.0522],
      'Fresno, CA': [-119.7871, 36.7378],
      'San Jose, CA': [-121.8863, 37.3382]
    };
    
    const location = earthquake.location || '';
    for (const [key, coords] of Object.entries(locationMap)) {
      if (location.includes(key.split(',')[0]) || key.includes(location.split(',')[0])) {
        return coords;
      }
    }
    
    return [121.0, 12.0];
  };

  // Create a stable earthquake ID to prevent unnecessary re-renders
  const earthquakeId = earthquake 
    ? `${earthquake.location}-${earthquake.magnitude}-${earthquake.timestamp || earthquake.time}`
    : null;
  const lastEarthquakeIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !earthquake) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
      lastEarthquakeIdRef.current = null;
      return;
    }

    // Only reinitialize map if the earthquake actually changed (by ID, not object reference)
    if (lastEarthquakeIdRef.current === earthquakeId && mapRef.current) {
      // Same earthquake, just update the map center if coordinates changed
      const coordinates = getCoordinates(earthquake);
      if (mapRef.current && mapRef.current.getCenter) {
        const currentCenter = mapRef.current.getCenter();
        const distance = Math.sqrt(
          Math.pow(currentCenter.lng - coordinates[0], 2) + 
          Math.pow(currentCenter.lat - coordinates[1], 2)
        );
        // Only update if coordinates changed significantly (more than 0.001 degrees)
        if (distance > 0.001) {
          mapRef.current.flyTo({
            center: coordinates,
            zoom: 10,
            duration: 1000
          });
        }
      }
      return;
    }

    // New earthquake or map doesn't exist - initialize map
    lastEarthquakeIdRef.current = earthquakeId;

    const mapToken = import.meta.env.VITE_MAP_TOKEN || 'pk.eyJ1IjoiamRyZXd3IiwiYSI6ImNtaHB3eWpnYTBjc3EycnF6ZWY4NmJqOHkifQ.tomWXBmHn5UgNicCIlRukQ';
    mapboxgl.accessToken = mapToken;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const coordinates = getCoordinates(earthquake);
    const mapId = `earthquake-map-${Date.now()}`;

    if (mapContainerRef.current) {
      mapContainerRef.current.id = mapId;
    }

    const timeoutId = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      mapRef.current = new mapboxgl.Map({
        container: mapId,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: coordinates,
        zoom: 10,
        attributionControl: false
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);
        
        if (mapRef.current) {
          mapRef.current.resize();
        }

        const magnitude = parseFloat(earthquake.magnitude) || 3.0;
        const depth = parseFloat(earthquake.depth) || 10.0;
        
        
        
        const duration = Math.max(800, Math.min(2000, 2000 - (magnitude - 3) * 200));
        
        
        
        const baseSize = Math.max(150, Math.min(300, 150 + (magnitude - 3) * 30));
        
        
        
        const depthMultiplier = Math.min(1.5, Math.max(0.8, 0.8 + (depth / 700) * 0.7));
        
        const size = Math.round(baseSize * depthMultiplier);
        
        
        
        const depthFactor = Math.min(1.0, Math.max(0.5, 0.5 + (depth / 700) * 0.5));
        const maxPulseRadius = (size / 2) * depthFactor;
        const minPulseRadius = (size / 2) * 0.2;
        
        
        const colorIntensity = Math.min(1.0, Math.max(0.6, 0.6 + (magnitude - 3) / 10));
        
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d', { willReadFrequently: true });

        
        const pulsingDot = {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),
          duration: duration,
          maxPulseRadius: maxPulseRadius,
          minPulseRadius: minPulseRadius,
          colorIntensity: colorIntensity,
          canvas: canvas,
          context: context,

          onAdd: function () {
            
          },

          render: function () {
            const t = (performance.now() % this.duration) / this.duration;

            
            const radius = this.minPulseRadius;
            
            
            const outerRadius = this.minPulseRadius + (this.maxPulseRadius - this.minPulseRadius) * t;
            
            const ctx = this.context;

            ctx.clearRect(0, 0, this.width, this.height);
            
            
            ctx.beginPath();
            ctx.arc(
              this.width / 2,
              this.height / 2,
              outerRadius,
              0,
              Math.PI * 2
            );
            
            const opacity = this.colorIntensity * (1 - t);
            ctx.fillStyle = `rgba(255, 127, 0, ${opacity})`;
            ctx.fill();

            
            ctx.beginPath();
            ctx.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 127, 0, ${this.colorIntensity})`;
            ctx.strokeStyle = 'white';
            
            ctx.lineWidth = 2 + (magnitude - 3) * 0.5;
            ctx.fill();
            ctx.stroke();

            
            const imageData = ctx.getImageData(0, 0, this.width, this.height);
            this.data = imageData.data;

            if (mapRef.current) {
              mapRef.current.triggerRepaint();
            }

            return true;
          }
        };

        
        const initialTime = performance.now() % pulsingDot.duration / pulsingDot.duration;
        const initialRadius = pulsingDot.minPulseRadius;
        const initialOuterRadius = pulsingDot.minPulseRadius + (pulsingDot.maxPulseRadius - pulsingDot.minPulseRadius) * initialTime;
        
        context.clearRect(0, 0, size, size);
        
        
        context.beginPath();
        context.arc(size / 2, size / 2, initialOuterRadius, 0, Math.PI * 2);
        const initialOpacity = colorIntensity * (1 - initialTime);
        context.fillStyle = `rgba(255, 127, 0, ${initialOpacity})`;
        context.fill();

        
        context.beginPath();
        context.arc(size / 2, size / 2, initialRadius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 127, 0, ${colorIntensity})`;
        context.strokeStyle = 'white';
        context.lineWidth = 2 + (magnitude - 3) * 0.5;
        context.fill();
        context.stroke();

        
        const initialImageData = context.getImageData(0, 0, size, size);
        pulsingDot.data = initialImageData.data;

        mapRef.current.addImage('pulsing-dot', pulsingDot);

        mapRef.current.addSource('earthquake-point', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: coordinates
                }
              }
            ]
          }
        });

        
        
        const magnitudeFactor = Math.max(0.3, Math.min(0.8, 0.3 + (magnitude - 3) * 0.1));
        
        const depthSizeFactor = Math.min(1.5, Math.max(0.8, 0.8 + (depth / 700) * 0.7));
        
        const baseIconSize = magnitudeFactor * depthSizeFactor;

        
        
        const latitude = coordinates[1];
        
        
        const kmToPixels = (km, zoom, lat) => {
          
          const metersPerPixel = (156543.03392 * Math.cos(lat * Math.PI / 180)) / Math.pow(2, zoom);
          const kmPerPixel = metersPerPixel / 1000;
          return km / kmPerPixel;
        };
        
        
        const initialZoom = mapRef.current.getZoom();
        const baseRadiusPixels = kmToPixels(depth, initialZoom, latitude);
        
        
        mapRef.current.addLayer({
          id: 'earthquake-pulse-circle',
          type: 'circle',
          source: 'earthquake-point',
          paint: {
            'circle-radius': baseRadiusPixels,
            'circle-color': 'rgba(255, 127, 0, 0.2)',
            'circle-stroke-color': 'rgba(255, 127, 0, 0.5)',
            'circle-stroke-width': 2,
            'circle-opacity': 0.4
          }
        });

        
        let pulsePhase = 0;
        let lastZoom = initialZoom;
        
        const updatePulse = () => {
          if (!mapRef.current) return;
          
          pulsePhase = (pulsePhase + 0.015) % 1;
          
          
          const currentZoom = mapRef.current.getZoom();
          if (Math.abs(currentZoom - lastZoom) > 0.1) {
            lastZoom = currentZoom;
          }
          
          
          const currentBaseRadius = kmToPixels(depth, lastZoom, latitude);
          
          
          const pulseFactor = 0.5 + 0.5 * Math.sin(pulsePhase * Math.PI * 2);
          const currentRadius = currentBaseRadius * pulseFactor;
          
          
          const opacity = 0.2 + 0.4 * (1 - Math.abs(Math.sin(pulsePhase * Math.PI * 2)));
          
          mapRef.current.setPaintProperty('earthquake-pulse-circle', 'circle-radius', currentRadius);
          mapRef.current.setPaintProperty('earthquake-pulse-circle', 'circle-opacity', opacity);
          
          animationFrameRef.current = requestAnimationFrame(updatePulse);
        };
        
        
        mapRef.current.on('zoom', () => {
          lastZoom = mapRef.current.getZoom();
        });
        
        
        updatePulse();

        mapRef.current.addLayer({
          id: 'earthquake-pulsing-dot',
          type: 'symbol',
          source: 'earthquake-point',
          layout: {
            'icon-image': 'pulsing-dot',
            
            
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              5, baseIconSize * 0.5,
              10, baseIconSize * 1.0,
              15, baseIconSize * 2.0,
              20, baseIconSize * 3.0
            ]
          }
        });

        // Format time and magnitude for popup
        const formatTimeForPopup = (timeValue) => {
          if (!timeValue) return 'Unknown time';
          
          let timestamp;
          try {
          if (typeof timeValue === 'number') {
              // Check if timestamp is in seconds (less than 13 digits)
              if (timeValue < 10000000000) {
                timestamp = timeValue * 1000; // Convert seconds to milliseconds
              } else {
            timestamp = timeValue;
              }
          } else if (typeof timeValue === 'string' && /^\d+$/.test(timeValue)) {
              const numValue = parseInt(timeValue);
              // Check if it's in seconds (less than 13 digits)
              if (timeValue.length < 13) {
                timestamp = numValue * 1000; // Convert seconds to milliseconds
              } else {
                timestamp = numValue;
              }
          } else {
            timestamp = new Date(timeValue).getTime();
          }
          
          // Validate timestamp - check if it's a valid number
          if (isNaN(timestamp) || !isFinite(timestamp)) {
            return 'Invalid time';
          }
          
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          const date = new Date(timestamp);
          
          // Double-check the date is valid before formatting
          if (isNaN(date.getTime())) {
            return 'Invalid time';
          }
          
          const formatted = formatter.format(date);
          const [datePart, timePart] = formatted.split(', ');
            
            if (!datePart || !timePart) {
              // Fallback formatting
              return date.toLocaleString('en-US', { 
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              });
            }
            
          const [month, day, year] = datePart.split('/');
          const [hour, minute, second] = timePart.split(':');
          return `${day}/${month}/${year}, ${hour}:${minute}:${second}`;
          } catch (error) {
            console.error('Error formatting time for popup:', error, timeValue);
            return 'Invalid time';
          }
        };
        
        const popupMagnitude = parseFloat(earthquake.magnitude).toFixed(1);
        // Use timestamp if available (raw timestamp), otherwise try to parse time
        const popupTimeValue = earthquake.timestamp || (typeof earthquake.time === 'number' || /^\d+$/.test(earthquake.time) ? earthquake.time : null);
        const popupTime = popupTimeValue ? formatTimeForPopup(popupTimeValue) : (earthquake.time || 'Unknown time');

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="text-white">
              <h3 class="font-bold text-lg mb-1">Magnitude ${popupMagnitude}</h3>
              <p class="text-sm text-gray-300">${earthquake.location}</p>
              <p class="text-xs text-gray-400 mt-1">${popupTime}</p>
            </div>
          `);

        mapRef.current.on('click', 'earthquake-pulsing-dot', (e) => {
          popup.setLngLat(e.lngLat).addTo(mapRef.current);
        });

        mapRef.current.on('mouseenter', 'earthquake-pulsing-dot', () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        mapRef.current.on('mouseleave', 'earthquake-pulsing-dot', () => {
          mapRef.current.getCanvas().style.cursor = '';
        });
      });

      mapRef.current.on('error', (e) => {
        console.error('Map error:', e);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (mapRef.current) {
        try {
          if (mapRef.current.getLayer('earthquake-pulse-circle')) {
            mapRef.current.removeLayer('earthquake-pulse-circle');
          }
          if (mapRef.current.getLayer('earthquake-pulsing-dot')) {
            mapRef.current.removeLayer('earthquake-pulsing-dot');
          }
          if (mapRef.current.getSource('earthquake-point')) {
            mapRef.current.removeSource('earthquake-point');
          }
        } catch (e) {
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
      lastEarthquakeIdRef.current = null;
    };
  }, [isOpen, earthquakeId]);

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

  // Check if user is in earthquake range
  useEffect(() => {
    if (!isOpen || !earthquake) {
      setIsUserInRange(false);
      return;
    }

    const userLocation = getUserLocation();
    const alertSettings = getAlertSettings();

    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      setIsUserInRange(false);
      return;
    }

    // Get earthquake coordinates
    let earthquakeLat, earthquakeLon;
    if (earthquake.latitude && earthquake.longitude) {
      earthquakeLat = parseFloat(earthquake.latitude);
      earthquakeLon = parseFloat(earthquake.longitude);
    } else {
      const coords = getCoordinates(earthquake);
      earthquakeLon = coords[0];
      earthquakeLat = coords[1];
    }

    // Get user location coordinates
    let userLat, userLon;
    if (alertSettings.location && alertSettings.location !== 'Default') {
      const alertCoords = getCoordinatesFromLocation(alertSettings.location);
      userLon = alertCoords[0];
      userLat = alertCoords[1];
    } else {
      userLat = userLocation.latitude;
      userLon = userLocation.longitude;
    }

    // Calculate distance
    const distance = calculateDistance(userLat, userLon, earthquakeLat, earthquakeLon);
    const alertRadius = parseFloat(alertSettings.alertRadius || 100);

    setIsUserInRange(distance <= alertRadius);
  }, [isOpen, earthquake]);

  if (!isOpen || !earthquake) return null;

  // Ensure alert level properties are set
  const alertInfo = earthquake.alertLevel 
    ? { 
        level: earthquake.alertLevel, 
        color: earthquake.alertColor || '', 
        bgColor: earthquake.bgColor || '' 
      }
    : getAlertLevel(earthquake.magnitude);
  
  const formattedMagnitude = formatMagnitude(earthquake.magnitude);
  // Use timestamp if available (raw timestamp), otherwise try to parse time
  // If time is already a formatted string (like "1 day ago"), use timestamp instead
  // Check if time is already formatted (contains 'ago', 'day', 'minute', 'hour', or date format with '/')
  const isTimeFormatted = typeof earthquake.time === 'string' && 
    (earthquake.time.includes('ago') || earthquake.time.includes('day') || 
     earthquake.time.includes('minute') || earthquake.time.includes('hour') || 
     earthquake.time.includes('/'));
  
  // Prioritize timestamp, then raw time number, then formatted time string
  let formattedTime;
  if (earthquake.timestamp) {
    formattedTime = formatTime(earthquake.timestamp);
  } else if (isTimeFormatted) {
    formattedTime = earthquake.time; // Already formatted, use as-is
  } else if (typeof earthquake.time === 'number' || /^\d+$/.test(String(earthquake.time))) {
    formattedTime = formatTime(earthquake.time);
  } else {
    formattedTime = formatTime(earthquake.time || earthquake.timestamp || null);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white text-2xl transition-colors bg-[#1A1A1A] rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
        <div className="overflow-y-auto flex-1">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Magnitude {formattedMagnitude} Earthquake
              </h2>
              <p className="text-gray-400">{earthquake.location}</p>
              <p className="text-sm text-gray-500 mt-1">{formattedTime}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-sm uppercase ${alertInfo.color} ${alertInfo.bgColor}`}>
              {alertInfo.level}
            </div>
          </div>
        </div>

        <div className="flex-1 relative min-h-[400px] bg-[#1A1A1A]">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full absolute inset-0"
            style={{ height: '100%', minHeight: '400px' }}
          />
        </div>

        <div className="p-6 border-t border-gray-800 bg-[#1A1A1A]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
            <div>
              <p className="text-gray-400">Magnitude</p>
              <p className="text-white font-semibold text-lg">{formattedMagnitude}</p>
            </div>
            <div>
              <p className="text-gray-400">Alert Level</p>
              <p className={`font-semibold ${alertInfo.color}`}>{alertInfo.level}</p>
            </div>
            <div>
              <p className="text-gray-400">Time</p>
              <p className="text-white font-semibold">{formattedTime}</p>
            </div>
          </div>

          <div className="bg-blue-900/30 rounded-lg p-5 border border-blue-800/50 mt-4">
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

          {isUserInRange && (
            <div className="mt-4">
              <button
                onClick={() => setIsEvacuationMapOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 18.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V5.618a1 1 0 00-.553-.894L15 2m0 15V2m0 15l-6-3" />
                </svg>
                Evacuation Map
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      <EvacuationMapModal
        isOpen={isEvacuationMapOpen}
        onClose={() => setIsEvacuationMapOpen(false)}
        earthquake={earthquake}
      />
    </div>
  );
};

export default EarthquakeDetailsModal;

