import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { findNearestEvacuationCenter } from '../../utils/evacuationCenters';
import { getUserLocation } from '../../utils/earthquakeAlert';

const EvacuationMapModal = ({ isOpen, onClose, earthquake }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [evacuationCenter, setEvacuationCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [directions, setDirections] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState(null);
  const [showDirections, setShowDirections] = useState(true);

  useEffect(() => {
    if (!isOpen || !earthquake) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
      setEvacuationCenter(null);
      setUserLocation(null);
      setRouteData(null);
      setDirections([]);
      setError(null);
      return;
    }

    // Try to get real-time GPS location first, then fall back to stored location
    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          // Fall back to stored location
          const storedLocation = getUserLocation();
          if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
            resolve(storedLocation);
          } else {
            reject(new Error('Geolocation not supported and no stored location'));
          }
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: position.coords.accuracy
            };
            
            // Try to get location name
            try {
              const { getLocationName } = await import('../../utils/locationHelper.js');
              locationData.locationName = getLocationName(locationData.latitude, locationData.longitude);
            } catch (error) {
              console.error('Error getting location name:', error);
              locationData.locationName = `Current Location (${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)})`;
            }
            
            resolve(locationData);
          },
          (error) => {
            // Fall back to stored location if GPS fails
            const storedLocation = getUserLocation();
            if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
              console.warn('GPS unavailable, using stored location:', error);
              resolve(storedLocation);
            } else {
              reject(new Error('Unable to get location'));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0 // Always get fresh location
          }
        );
      });
    };

    // Get current location and proceed
    getCurrentLocation()
      .then((location) => {
        if (!location || !location.latitude || !location.longitude) {
          setError('User location not available. Please enable GPS in settings.');
          return;
        }

        setUserLocation(location);

        // Find nearest evacuation center from current location
        const nearest = findNearestEvacuationCenter(location.latitude, location.longitude);
        if (!nearest) {
          setError('No evacuation center found nearby.');
          return;
        }

        setEvacuationCenter(nearest);
        initializeMap(location, nearest);
      })
      .catch((error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your current location. Please enable GPS in settings.');
      });

    // Separate function to initialize map after location is obtained
    let timeoutIdRef = null;
    const initializeMap = (location, nearest) => {
      // Initialize map
      const mapToken = import.meta.env.VITE_MAP_TOKEN || 'pk.eyJ1IjoiamRyZXd3IiwiYSI6ImNtaHB3eWpnYTBjc3EycnF6ZWY4NmJqOHkifQ.tomWXBmHn5UgNicCIlRukQ';
      mapboxgl.accessToken = mapToken;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const mapId = `evacuation-map-${Date.now()}`;
      if (mapContainerRef.current) {
        mapContainerRef.current.id = mapId;
      }

      timeoutIdRef = setTimeout(() => {
        if (!mapContainerRef.current || mapRef.current) return;

      // Calculate center point between user and evacuation center
      const centerLat = (location.latitude + nearest.latitude) / 2;
      const centerLon = (location.longitude + nearest.longitude) / 2;

      mapRef.current = new mapboxgl.Map({
        container: mapId,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [centerLon, centerLat],
        zoom: 12,
        attributionControl: false
      });

      mapRef.current.on('load', () => {
        setMapLoaded(true);
        if (mapRef.current) {
          mapRef.current.resize();
        }

        // Add user location marker
        mapRef.current.addSource('user-location', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [location.longitude, location.latitude]
                },
                properties: {
                  title: 'Your Location'
                }
              }
            ]
          }
        });

        // Add evacuation center marker
        mapRef.current.addSource('evacuation-center', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [nearest.longitude, nearest.latitude]
                },
                properties: {
                  title: nearest.name
                }
              }
            ]
          }
        });

        // Add markers
        mapRef.current.addLayer({
          id: 'user-location-marker',
          type: 'circle',
          source: 'user-location',
          paint: {
            'circle-radius': 10,
            'circle-color': '#3b82f6',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        });

        mapRef.current.addLayer({
          id: 'evacuation-center-marker',
          type: 'circle',
          source: 'evacuation-center',
          paint: {
            'circle-radius': 12,
            'circle-color': '#10b981',
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        });

        // Add popups for markers
        const userPopup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="text-white">
              <h3 class="font-bold text-sm mb-1">Your Location</h3>
              <p class="text-xs text-gray-300">${location.locationName || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}</p>
            </div>
          `);

        const centerPopup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="text-white">
              <h3 class="font-bold text-sm mb-1">${nearest.name}</h3>
              <p class="text-xs text-gray-300">Evacuation Center</p>
              <p class="text-xs text-gray-400 mt-1">Distance: ${nearest.distance.toFixed(2)} km</p>
            </div>
          `);

        mapRef.current.on('click', 'user-location-marker', (e) => {
          userPopup.setLngLat(e.lngLat).addTo(mapRef.current);
        });

        mapRef.current.on('click', 'evacuation-center-marker', (e) => {
          centerPopup.setLngLat(e.lngLat).addTo(mapRef.current);
        });

        mapRef.current.on('mouseenter', 'user-location-marker', () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        mapRef.current.on('mouseleave', 'user-location-marker', () => {
          mapRef.current.getCanvas().style.cursor = '';
        });

        mapRef.current.on('mouseenter', 'evacuation-center-marker', () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        mapRef.current.on('mouseleave', 'evacuation-center-marker', () => {
          mapRef.current.getCanvas().style.cursor = '';
        });

        // Fetch route
        fetchRoute(location, nearest);
      });

      mapRef.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map. Please try again.');
      });
    }, 100);
    }; // End of initializeMap function

    // Cleanup function for useEffect
    return () => {
      if (timeoutIdRef) {
        clearTimeout(timeoutIdRef);
      }
      if (mapRef.current) {
        try {
          if (mapRef.current.getLayer('route')) {
            mapRef.current.removeLayer('route');
          }
          if (mapRef.current.getSource('route')) {
            mapRef.current.removeSource('route');
          }
          if (mapRef.current.getLayer('user-location-marker')) {
            mapRef.current.removeLayer('user-location-marker');
          }
          if (mapRef.current.getSource('user-location')) {
            mapRef.current.removeSource('user-location');
          }
          if (mapRef.current.getLayer('evacuation-center-marker')) {
            mapRef.current.removeLayer('evacuation-center-marker');
          }
          if (mapRef.current.getSource('evacuation-center')) {
            mapRef.current.removeSource('evacuation-center');
          }
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
    };
  }, [isOpen, earthquake]);

  const fetchRoute = async (userLoc, center) => {
    if (!mapRef.current) return;

    setLoadingRoute(true);
    setError(null);

    try {
      const mapToken = import.meta.env.VITE_MAP_TOKEN || 'pk.eyJ1IjoiamRyZXd3IiwiYSI6ImNtaHB3eWpnYTBjc3EycnF6ZWY4NmJqOHkifQ.tomWXBmHn5UgNicCIlRukQ';
      
      // Use Mapbox Directions API with steps for turn-by-turn directions
      const origin = `${userLoc.longitude},${userLoc.latitude}`;
      const destination = `${center.longitude},${center.latitude}`;
      
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}?geometries=geojson&steps=true&overview=full&access_token=${mapToken}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeInfo = {
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
          geometry: route.geometry
        };
        setRouteData(routeInfo);

        // Extract step-by-step directions
        const steps = [];
        if (route.legs && route.legs.length > 0) {
          route.legs.forEach((leg, legIndex) => {
            if (leg.steps) {
              leg.steps.forEach((step, stepIndex) => {
                const distance = step.distance / 1000; // Convert to km
                const duration = step.duration / 60; // Convert to minutes
                
                // Get instruction text
                let instruction = step.maneuver?.instruction || '';
                if (!instruction && step.maneuver?.type) {
                  instruction = formatManeuverInstruction(step.maneuver);
                }

                steps.push({
                  index: steps.length,
                  instruction: instruction || `Continue for ${distance.toFixed(2)} km`,
                  distance: distance,
                  duration: duration,
                  maneuver: step.maneuver,
                  geometry: step.geometry
                });
              });
            }
          });
        }
        setDirections(steps);

        // Add route to map
        if (mapRef.current.getSource('route')) {
          mapRef.current.getSource('route').setData({
            type: 'Feature',
            geometry: route.geometry
          });
        } else {
          mapRef.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: route.geometry
            }
          });

          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 4,
              'line-opacity': 0.75
            }
          });
        }

        // Fit map to route bounds
        const coordinates = route.geometry.coordinates;
        const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
        
        // Extend bounds to include all route coordinates
        coordinates.forEach(coord => {
          bounds.extend(coord);
        });

        // Add padding for markers
        bounds.extend([userLoc.longitude, userLoc.latitude]);
        bounds.extend([center.longitude, center.latitude]);

        mapRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 1000
        });
      } else {
        setError('Could not calculate route. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching route:', err);
      setError('Failed to load route. Please check your connection.');
    } finally {
      setLoadingRoute(false);
    }
  };

  // Format maneuver instruction text
  const formatManeuverInstruction = (maneuver) => {
    if (!maneuver) return 'Continue';
    
    const type = maneuver.type;
    const modifier = maneuver.modifier;
    
    const instructions = {
      'turn': `Turn ${modifier || 'left'}`,
      'merge': `Merge ${modifier || 'left'}`,
      'ramp': `Take ramp ${modifier || 'left'}`,
      'roundabout': `Enter roundabout and take ${modifier || 'first'} exit`,
      'rotary': `Enter rotary and take ${modifier || 'first'} exit`,
      'fork': `Keep ${modifier || 'left'} at fork`,
      'end of road': `Turn ${modifier || 'left'} at end of road`,
      'continue': 'Continue straight',
      'depart': 'Depart',
      'arrive': 'Arrive at destination',
      'new name': 'Continue onto new road',
      'notification': 'Continue',
      'exit roundabout': 'Exit roundabout',
      'exit rotary': 'Exit rotary'
    };

    return instructions[type] || `Continue ${modifier || ''}`.trim();
  };

  // Get icon for maneuver type
  const getManeuverIcon = (maneuver) => {
    if (!maneuver) return '→';
    
    const type = maneuver.type;
    const modifier = maneuver.modifier;
    
    if (type === 'arrive') return '✓';
    if (type === 'depart') return '📍';
    if (type === 'roundabout' || type === 'rotary') return '↻';
    if (type === 'continue' || type === 'new name') return '→';
    
    if (modifier) {
      if (modifier.includes('left')) return '↶';
      if (modifier.includes('right')) return '↷';
      if (modifier.includes('straight')) return '→';
    }
    
    return '→';
  };

  if (!isOpen || !earthquake) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg w-full max-w-6xl mx-4 relative max-h-[90vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white text-2xl transition-colors bg-[#1A1A1A] rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Evacuation Map</h2>
              <p className="text-gray-400">
                {evacuationCenter ? `Nearest evacuation center: ${evacuationCenter.name}` : 'Finding nearest evacuation center...'}
              </p>
              {evacuationCenter && (
                <p className="text-sm text-gray-500 mt-1">
                  Distance: {evacuationCenter.distance.toFixed(2)} km
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDirections(!showDirections)}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#3A3A3A] text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {showDirections ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Hide Directions
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Show Directions
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-900/30 border border-red-800/50 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 flex relative min-h-[500px] bg-[#1A1A1A]">
          {/* Directions Panel */}
          {showDirections && directions.length > 0 && (
            <div className="w-80 bg-[#1A1A1A] border-r border-gray-800 overflow-y-auto flex flex-col">
              <div className="p-4 border-b border-gray-800 sticky top-0 bg-[#1A1A1A] z-10">
                <h3 className="text-white font-bold text-lg mb-2">Directions</h3>
                {routeData && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-gray-400">
                      <span className="text-white font-semibold">{routeData.distance.toFixed(2)} km</span>
                    </div>
                    <div className="text-gray-400">
                      <span className="text-white font-semibold">~{Math.round(routeData.duration)} min</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                  {directions.map((step, index) => (
                    <div key={index} className="relative">
                      <div
                        className="flex gap-3 p-3 rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer relative"
                        onClick={() => {
                          // Center map on this step
                          if (step.geometry && mapRef.current) {
                            const coords = step.geometry.coordinates[0];
                            mapRef.current.flyTo({
                              center: coords,
                              zoom: 15,
                              duration: 1000
                            });
                          }
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          {index < directions.length - 1 && (
                            <div className="w-0.5 h-full min-h-[40px] bg-gray-700 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl mt-0.5 flex-shrink-0">{getManeuverIcon(step.maneuver)}</span>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium leading-tight">
                                {step.instruction}
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                {step.distance < 1 
                                  ? `${(step.distance * 1000).toFixed(0)} m` 
                                  : `${step.distance.toFixed(2)} km`}
                                {step.duration > 0 && ` • ~${Math.round(step.duration)} min`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 relative min-h-[500px] bg-[#1A1A1A]">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
              <p className="text-gray-500">Loading map...</p>
            </div>
          )}
          {loadingRoute && (
            <div className="absolute top-4 left-4 z-10 bg-[#2A2A2A] px-4 py-2 rounded-lg border border-gray-700">
              <p className="text-white text-sm">Calculating route...</p>
            </div>
          )}
          <div 
            ref={mapContainerRef} 
            className="w-full h-full absolute inset-0"
            style={{ height: '100%', minHeight: '500px' }}
          />
          </div>
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#1A1A1A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-gray-400 text-xs">From (Current Location)</p>
                <p className="text-white font-semibold text-sm">
                  {userLocation?.locationName || `${userLocation?.latitude?.toFixed(4)}, ${userLocation?.longitude?.toFixed(4)}` || 'Your Current Location'}
                </p>
              </div>
              <div className="text-gray-600">→</div>
              <div>
                <p className="text-gray-400 text-xs">To</p>
                <p className="text-white font-semibold text-sm">
                  {evacuationCenter?.name || 'Evacuation Center'}
                </p>
              </div>
              {routeData && (
                <>
                  <div className="text-gray-600">•</div>
                  <div>
                    <p className="text-gray-400 text-xs">Distance</p>
                    <p className="text-white font-semibold text-sm">
                      {routeData.distance.toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Time</p>
                    <p className="text-white font-semibold text-sm">
                      ~{Math.round(routeData.duration)} min
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 p-3 bg-green-900/30 rounded-lg border border-green-800/50">
            <p className="text-green-300 text-xs font-semibold mb-1">Safety Tips:</p>
            <ul className="text-green-200 text-xs space-y-0.5 list-disc list-inside">
              <li>Follow the route shown on the map</li>
              <li>Stay calm and move quickly but safely</li>
              <li>Bring essential items only</li>
              <li>Help others if possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvacuationMapModal;

