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

const EarthquakeDetailsModal = ({ isOpen, onClose, earthquake }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [safetyGuide, setSafetyGuide] = useState([]);
  const [loadingSafetyGuide, setLoadingSafetyGuide] = useState(false);
  const [isCachedGuide, setIsCachedGuide] = useState(false);

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

  useEffect(() => {
    if (!isOpen || !earthquake) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
      return;
    }

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
        const context = canvas.getContext('2d');

        
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

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="text-white">
              <h3 class="font-bold text-lg mb-1">Magnitude ${earthquake.magnitude}</h3>
              <p class="text-sm text-gray-300">${earthquake.location}</p>
              <p class="text-xs text-gray-400 mt-1">${earthquake.time}</p>
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
    };
  }, [isOpen, earthquake]);

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

  if (!isOpen || !earthquake) return null;

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
                Magnitude {earthquake.magnitude} Earthquake
              </h2>
              <p className="text-gray-400">{earthquake.location}</p>
              <p className="text-sm text-gray-500 mt-1">{earthquake.time}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-sm uppercase ${earthquake.alertColor} ${earthquake.bgColor}`}>
              {earthquake.alertLevel}
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
              <p className="text-white font-semibold text-lg">{earthquake.magnitude}</p>
            </div>
            <div>
              <p className="text-gray-400">Alert Level</p>
              <p className={`font-semibold ${earthquake.alertColor}`}>{earthquake.alertLevel}</p>
            </div>
            <div>
              <p className="text-gray-400">Time</p>
              <p className="text-white font-semibold">{earthquake.time}</p>
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
        </div>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeDetailsModal;

