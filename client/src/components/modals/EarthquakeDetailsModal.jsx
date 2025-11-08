import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const EarthquakeDetailsModal = ({ isOpen, onClose, earthquake }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const getCoordinates = (location) => {
    const locationMap = {
      'Pacific Ocean, 45km west of San Francisco': [-122.8, 37.7],
      'East Bay Hills, California': [-122.2, 37.8],
      'Hayward Fault, California': [-122.1, 37.6],
      'San Francisco, CA': [-122.4194, 37.7749],
      'Los Angeles, CA': [-118.2437, 34.0522],
      'Fresno, CA': [-119.7871, 36.7378],
      'San Jose, CA': [-121.8863, 37.3382]
    };
    
    for (const [key, coords] of Object.entries(locationMap)) {
      if (location.includes(key.split(',')[0]) || key.includes(location.split(',')[0])) {
        return coords;
      }
    }
    
    return [-122.4194, 37.7749];
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

    const coordinates = getCoordinates(earthquake.location);
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

        const size = 200;
        const pulsingDot = {
          width: size,
          height: size,
          data: new Uint8Array(size * size * 4),

          onAdd: function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
          },

          render: function () {
            const duration = 1000;
            const t = (performance.now() % duration) / duration;

            const radius = (size / 2) * 0.3;
            const outerRadius = (size / 2) * 0.7 * t + radius;
            const context = this.context;

            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
              this.width / 2,
              this.height / 2,
              outerRadius,
              0,
              Math.PI * 2
            );
            context.fillStyle = `rgba(255, 127, 0, ${1 - t})`;
            context.fill();

            context.beginPath();
            context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
            context.fillStyle = 'rgba(255, 127, 0, 1)';
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            this.data = context.getImageData(0, 0, this.width, this.height).data;

            mapRef.current.triggerRepaint();

            return true;
          }
        };

        mapRef.current.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

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

        mapRef.current.addLayer({
          id: 'earthquake-pulsing-dot',
          type: 'symbol',
          source: 'earthquake-point',
          layout: {
            'icon-image': 'pulsing-dot',
            'icon-size': 0.5
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
      if (mapRef.current) {
        try {
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

  if (!isOpen || !earthquake) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white text-2xl transition-colors bg-[#1A1A1A] rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default EarthquakeDetailsModal;

