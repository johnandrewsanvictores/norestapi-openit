import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { calculateDistance } from '../../utils/evacuationCenters';
import { getUserLocation } from '../../utils/earthquakeAlert';
import { getGPSLocation, validateGPSLocation } from '../../utils/locationHelper';
import api from '../../../axios';

const EvacuationMapModal = ({ isOpen, onClose, earthquake }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const timeoutIdRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const lastEarthquakeIdRef = useRef(null);
  const lastCentersHashRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [evacuationCenter, setEvacuationCenter] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [directions, setDirections] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState(null);
  const [showDirections, setShowDirections] = useState(true);
  const [locationWarning, setLocationWarning] = useState(null);
  const [evacuationCenters, setEvacuationCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(false);

  // Fetch evacuation centers from API
  useEffect(() => {
    const fetchEvacuationCenters = async () => {
      setLoadingCenters(true);
      try {
        const response = await api.get('/evacuation-center', {
          withCredentials: true
        });
        if (response.data.success) {
          // Filter only active centers and map to expected format
          const centers = response.data.data
            .filter(center => center.isActive)
            .map(center => ({
              name: center.name,
              latitude: center.latitude,
              longitude: center.longitude,
              city: center.city || '',
              address: center.address || ''
            }));
          setEvacuationCenters(centers);
        }
      } catch (error) {
        console.error('Error fetching evacuation centers:', error);
        // Fallback to empty array, will show error if no centers
        setEvacuationCenters([]);
      } finally {
        setLoadingCenters(false);
      }
    };

    if (isOpen) {
      fetchEvacuationCenters();
    }
  }, [isOpen]);

  // Create a stable earthquake ID
  const earthquakeId = earthquake 
    ? `${earthquake.location}-${earthquake.magnitude}-${earthquake.timestamp || earthquake.time}`
    : null;
  
  // Create a hash of evacuation centers to detect changes
  const centersHash = evacuationCenters.length > 0
    ? evacuationCenters.map(c => `${c.latitude},${c.longitude}`).join('|')
    : null;

  useEffect(() => {
    if (!isOpen || !earthquake) {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      mapInitializedRef.current = false;
      lastEarthquakeIdRef.current = null;
      lastCentersHashRef.current = null;
      setMapLoaded(false);
      setEvacuationCenter(null);
      setUserLocation(null);
      setRouteData(null);
      setDirections([]);
      setError(null);
      setLocationWarning(null);
      return;
    }

    // Don't proceed if centers are still loading
    if (loadingCenters) {
      return;
    }

    // Check if we've already initialized the map for this earthquake and centers combination
    if (mapInitializedRef.current && 
        lastEarthquakeIdRef.current === earthquakeId && 
        lastCentersHashRef.current === centersHash &&
        mapRef.current) {
      // Map already initialized for this earthquake/centers, don't reinitialize
      return;
    }

    // Get current location - prioritize manually set location, then try GPS, then fall back to stored
    const getCurrentLocation = () => {
      return new Promise((resolve, reject) => {
        // First, check if there's a manually set location
        const storedLocation = getUserLocation();
        
        if (storedLocation && storedLocation.manualLocation && storedLocation.latitude && storedLocation.longitude) {
          // Use manually set location directly
          console.log('Using manually set location:', storedLocation.manualLocation);
          setLocationWarning(`Using manually set location: ${storedLocation.manualLocation || storedLocation.locationName || 'Map-selected location'}.`);
          resolve(storedLocation);
          return;
        }
        
        // If no manual location, try to get real-time GPS location
        getGPSLocation({
          timeout: 20000, // Give GPS more time to acquire signal
          enableHighAccuracy: true,
          maximumAge: 0
        })
          .then(async (position) => {
            const validation = validateGPSLocation(position);
            
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date().toISOString(),
              accuracy: position.coords.accuracy,
              isGPS: true
            };
            
            // Try to get location name
            try {
              const { getLocationName } = await import('../../utils/locationHelper.js');
              locationData.locationName = await getLocationName(locationData.latitude, locationData.longitude);
            } catch (error) {
              console.error('Error getting location name:', error);
              locationData.locationName = `Current Location (${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)})`;
            }
            
            console.log(validation.message);
            resolve(locationData);
          })
          .catch((error) => {
            // Fall back to stored location (GPS or IP-based, but not manual since we already checked)
            if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
              // Check if it's GPS-based
              if (storedLocation.isGPS) {
                console.warn('GPS unavailable, using stored GPS location:', error.message);
                resolve(storedLocation);
              } else {
                // It's an IP-based location - use it but show warning
                console.warn('GPS unavailable, using stored location (may not be GPS):', error.message);
                const accuracy = storedLocation.accuracy || Infinity;
                const accuracyKm = (accuracy / 1000).toFixed(1);
                
                if (accuracy > 1000) {
                  setLocationWarning(`Location accuracy is low (${accuracyKm} km). This appears to be IP-based. For accurate evacuation routes, please enable GPS or set your location manually on the map in Settings.`);
                } else {
                  setLocationWarning('Using stored location. For more accurate evacuation routes, enable GPS or set your location manually on the map in Settings.');
                }
                resolve(storedLocation);
              }
            } else {
              reject(new Error(error.message || 'Unable to get location. Please set your location in Settings (GPS or click on the map to set manually).'));
            }
          });
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

        // Find nearest evacuation center from current location using API centers
        if (evacuationCenters.length === 0) {
          setError('No evacuation centers available. Please contact administrator.');
          return;
        }

        let nearest = null;
        let minDistance = Infinity;
        
        evacuationCenters.forEach(center => {
          const distance = calculateDistance(location.latitude, location.longitude, center.latitude, center.longitude);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = { ...center, distance };
          }
        });

        if (!nearest) {
          setError('No evacuation center found nearby.');
          return;
        }

        // Find all nearby evacuation centers within 50km radius
        const nearbyCenters = evacuationCenters
          .map(center => ({
            ...center,
            distance: calculateDistance(location.latitude, location.longitude, center.latitude, center.longitude)
          }))
          .filter(center => center.distance <= 50)
          .sort((a, b) => a.distance - b.distance);

        setEvacuationCenter(nearest);
        initializeMap(location, nearest, nearbyCenters);
      })
      .catch((error) => {
        console.error('Error getting location:', error);
        setError(error.message || 'Unable to get your current location. Please set your location in Settings (GPS or manual selection).');
      });

    // Separate function to initialize map after location is obtained
    const initializeMap = (location, nearest, nearbyCenters = []) => {
      // Mark as initialized to prevent re-initialization
      mapInitializedRef.current = true;
      lastEarthquakeIdRef.current = earthquakeId;
      lastCentersHashRef.current = centersHash;
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

      // Clear any existing timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      
      timeoutIdRef.current = setTimeout(() => {
        if (!mapContainerRef.current || mapRef.current) return;

      // Calculate center point considering all nearby centers
      const allLats = [location.latitude, ...nearbyCenters.map(c => c.latitude)];
      const allLons = [location.longitude, ...nearbyCenters.map(c => c.longitude)];
      const centerLat = allLats.reduce((a, b) => a + b) / allLats.length;
      const centerLon = allLons.reduce((a, b) => a + b) / allLons.length;

      mapRef.current = new mapboxgl.Map({
        container: mapId,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [centerLon, centerLat],
        zoom: 11, // Slightly zoomed out to show more centers
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

        // Add all nearby evacuation centers (including nearest)
        // Compare by coordinates to reliably identify nearest center
        const allCentersFeatures = nearbyCenters.map(center => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [center.longitude, center.latitude]
          },
          properties: {
            title: center.name,
            distance: center.distance,
            isNearest: Math.abs(center.latitude - nearest.latitude) < 0.0001 && 
                      Math.abs(center.longitude - nearest.longitude) < 0.0001,
            city: center.city || ''
          }
        }));

        mapRef.current.addSource('evacuation-centers', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: allCentersFeatures
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

        // Add all evacuation center markers (smaller, gray for non-nearest)
        mapRef.current.addLayer({
          id: 'evacuation-centers-markers',
          type: 'circle',
          source: 'evacuation-centers',
          paint: {
            'circle-radius': [
              'case',
              ['get', 'isNearest'],
              14, // Larger for nearest
              10  // Smaller for others
            ],
            'circle-color': [
              'case',
              ['get', 'isNearest'],
              '#10b981', // Green for nearest
              '#6b7280'  // Gray for others
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': [
              'case',
              ['get', 'isNearest'],
              3,  // Thicker border for nearest
              2   // Normal border for others
            ]
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

        mapRef.current.on('click', 'user-location-marker', (e) => {
          userPopup.setLngLat(e.lngLat).addTo(mapRef.current);
        });

        mapRef.current.on('click', 'evacuation-centers-markers', (e) => {
          const props = e.features[0].properties;
          const isNearest = props.isNearest;
          const centerPopup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="text-white">
                <h3 class="font-bold text-sm mb-1">${props.title}</h3>
                <p class="text-xs text-gray-300">Evacuation Center${props.city ? ` - ${props.city}` : ''}</p>
                <p class="text-xs text-gray-400 mt-1">Distance: ${props.distance.toFixed(2)} km</p>
                ${isNearest ? '<p class="text-xs text-green-400 mt-1 font-semibold">★ Nearest Center (Route Shown)</p>' : ''}
              </div>
            `);
          centerPopup.setLngLat(e.lngLat).addTo(mapRef.current);
        });

        mapRef.current.on('mouseenter', 'user-location-marker', () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        mapRef.current.on('mouseleave', 'user-location-marker', () => {
          mapRef.current.getCanvas().style.cursor = '';
        });

        mapRef.current.on('mouseenter', 'evacuation-centers-markers', () => {
          mapRef.current.getCanvas().style.cursor = 'pointer';
        });

        mapRef.current.on('mouseleave', 'evacuation-centers-markers', () => {
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
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
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
          if (mapRef.current.getLayer('evacuation-centers-markers')) {
            mapRef.current.removeLayer('evacuation-centers-markers');
          }
          if (mapRef.current.getSource('evacuation-centers')) {
            mapRef.current.removeSource('evacuation-centers');
          }
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapLoaded(false);
    };
  }, [isOpen, earthquakeId, centersHash, loadingCenters]);

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

        // Fit map to route bounds and all nearby centers
        const coordinates = route.geometry.coordinates;
        const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
        
        // Extend bounds to include all route coordinates
        coordinates.forEach(coord => {
          bounds.extend(coord);
        });

        // Add padding for markers - include user location and nearest center
        bounds.extend([userLoc.longitude, userLoc.latitude]);
        bounds.extend([center.longitude, center.latitude]);
        
        // Also extend to include all nearby centers (they're already on the map)
        // This ensures the map shows all evacuation centers

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

        {locationWarning && (
          <div className="mx-6 mt-2">
            <p className="text-gray-400 text-xs">{locationWarning}</p>
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

