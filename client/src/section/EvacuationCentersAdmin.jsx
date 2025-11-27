import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../../axios';
import { showSuccess, showError } from '../utils/alertHelper';

const EvacuationCentersAdmin = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    city: '',
    address: '',
    capacity: '',
    contact: '',
    isActive: true
  });

  useEffect(() => {
    fetchCenters();
    initializeMap();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && mapRef.current.loaded()) {
      updateMapMarkers();
    }
  }, [centers]);

  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;

    const mapToken = import.meta.env.VITE_MAP_TOKEN || 'pk.eyJ1IjoiamRyZXd3IiwiYSI6ImNtaHB3eWpnYTBjc3EycnF6ZWY4NmJqOHkifQ.tomWXBmHn5UgNicCIlRukQ';
    mapboxgl.accessToken = mapToken;

    setMapLoading(true);
    
    // Default to Philippines center
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [121.0, 14.5], // Philippines center
      zoom: 6,
      attributionControl: false
    });

    mapRef.current.on('load', () => {
      setMapLoading(false);
      
      // Add click handler to place marker
      mapRef.current.on('click', handleMapClick);
      
      // Initialize markers for existing centers
      if (centers.length > 0) {
        updateMapMarkers();
      }
    });

    mapRef.current.on('error', (e) => {
      console.error('Map error:', e);
      setMapLoading(false);
    });
  };

  const handleMapClick = async (e) => {
    const { lng, lat } = e.lngLat;
    
    // Update form data with coordinates
    setFormData(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));

    // Place marker on map
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#FF7F00';
      el.style.border = '3px solid white';
      el.style.cursor = 'pointer';
      
      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    }

    // Fetch address and city automatically
    await fetchAddressFromCoordinates(lat, lng);
  };

  const fetchAddressFromCoordinates = async (lat, lng) => {
    setFetchingAddress(true);
    try {
      const response = await api.get('/geocoding/reverse-geocode', {
        params: { latitude: lat, longitude: lng },
        withCredentials: true
      });

      if (response.data.success) {
        const locationName = response.data.locationName || '';
        const components = response.data.components || {};
        
        // Extract city from components
        const city = components.city || components.town || components.village || components.county || '';
        
        setFormData(prev => ({
          ...prev,
          address: locationName,
          city: city
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      // Don't show error, just leave fields empty
    } finally {
      setFetchingAddress(false);
    }
  };

  const updateMapMarkers = () => {
    if (!mapRef.current) return;

    // Store existing markers in a ref to properly remove them
    if (!mapRef.current._evacuationMarkers) {
      mapRef.current._evacuationMarkers = [];
    }

    // Remove existing center markers
    mapRef.current._evacuationMarkers.forEach(marker => marker.remove());
    mapRef.current._evacuationMarkers = [];

    // Add markers for all centers
    centers.forEach(center => {
      if (!center.latitude || !center.longitude) return;

      const el = document.createElement('div');
      el.className = 'evacuation-center-marker';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = center.isActive ? '#10b981' : '#6b7280';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="text-white">
            <h3 class="font-bold text-sm mb-1">${center.name}</h3>
            <p class="text-xs text-gray-300">${center.city || 'Evacuation Center'}</p>
            ${!center.isActive ? '<p class="text-xs text-gray-400 mt-1">Inactive</p>' : ''}
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([center.longitude, center.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);
      
      mapRef.current._evacuationMarkers.push(marker);
    });
  };

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const response = await api.get('/evacuation-center/admin/all', {
        withCredentials: true
      });
      if (response.data.success) {
        setCenters(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching evacuation centers:', error);
      showError('Failed to load evacuation centers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.latitude || !formData.longitude) {
      showError('Name, latitude, and longitude are required');
      return;
    }

    const submitData = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      capacity: formData.capacity ? parseInt(formData.capacity) : 0
    };

    try {
      if (editingId) {
        // Update
        await api.put(`/evacuation-center/${editingId}`, submitData, {
          withCredentials: true
        });
        showSuccess('Evacuation center updated successfully');
      } else {
        // Create
        await api.post('/evacuation-center', submitData, {
          withCredentials: true
        });
        showSuccess('Evacuation center created successfully');
      }
      
      resetForm();
      await fetchCenters();
      // Map markers will be updated via useEffect
    } catch (error) {
      console.error('Error saving evacuation center:', error);
      showError(error.response?.data?.message || 'Failed to save evacuation center');
    }
  };

  const handleEdit = (center) => {
    setFormData({
      name: center.name || '',
      latitude: center.latitude?.toString() || '',
      longitude: center.longitude?.toString() || '',
      city: center.city || '',
      address: center.address || '',
      capacity: center.capacity?.toString() || '',
      contact: center.contact || '',
      isActive: center.isActive !== undefined ? center.isActive : true
    });
    setEditingId(center._id);
    setIsEditing(true);

    // Move map to center and place marker
    if (mapRef.current && center.latitude && center.longitude) {
      mapRef.current.flyTo({
        center: [center.longitude, center.latitude],
        zoom: 14,
        duration: 1000
      });

      if (markerRef.current) {
        markerRef.current.setLngLat([center.longitude, center.latitude]);
      } else {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#FF7F00';
        el.style.border = '3px solid white';
        el.style.cursor = 'pointer';
        
        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat([center.longitude, center.latitude])
          .addTo(mapRef.current);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evacuation center?')) {
      return;
    }

    try {
      await api.delete(`/evacuation-center/${id}`, {
        withCredentials: true
      });
      showSuccess('Evacuation center deleted successfully');
      await fetchCenters();
      // Map markers will be updated via useEffect
    } catch (error) {
      console.error('Error deleting evacuation center:', error);
      showError(error.response?.data?.message || 'Failed to delete evacuation center');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      city: '',
      address: '',
      capacity: '',
      contact: '',
      isActive: true
    });
    setEditingId(null);
    setIsEditing(false);
    
    // Remove placement marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4 sm:p-6 border border-gray-800">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
        Evacuation Centers Management
      </h2>

      {/* Map Section */}
      <div className="mb-6 bg-[#1A1A1A] rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-semibold mb-4">
          {isEditing ? 'Edit Evacuation Center' : 'Add New Evacuation Center'}
        </h3>
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">
            Click on the map to place a marker. Address and city will be automatically detected.
          </p>
          <div className="relative h-96 rounded-lg overflow-hidden border border-gray-600">
            {mapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
                <p className="text-gray-400">Loading map...</p>
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
            {fetchingAddress && (
              <div className="absolute top-4 left-4 bg-[#2A2A2A] px-4 py-2 rounded-lg border border-gray-600 z-10">
                <p className="text-white text-sm">Fetching address...</p>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter evacuation center name"
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00]"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                City {formData.city && <span className="text-green-400 text-xs">(Auto-detected)</span>}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Will be auto-filled from map"
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00]"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Latitude {formData.latitude && <span className="text-green-400 text-xs">(From map)</span>}
              </label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                required
                readOnly
                placeholder="Click on map to set"
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Longitude {formData.longitude && <span className="text-green-400 text-xs">(From map)</span>}
              </label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                required
                readOnly
                placeholder="Click on map to set"
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white text-sm font-medium mb-2">
                Address {formData.address && <span className="text-green-400 text-xs">(Auto-detected)</span>}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Will be auto-filled from map"
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00]"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00]"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Contact
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#FF7F00] bg-[#2A2A2A] border-gray-600 rounded focus:ring-[#FF7F00]"
                />
                <span className="text-white text-sm">Active</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-[#FF7F00] text-white rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors"
            >
              {isEditing ? 'Update' : 'Create'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div>
        <h3 className="text-white font-semibold mb-4">Existing Evacuation Centers</h3>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : centers.length === 0 ? (
          <p className="text-gray-400">No evacuation centers found</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {centers.map((center) => (
              <div
                key={center._id}
                className={`bg-[#1A1A1A] border rounded-lg p-4 ${
                  center.isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-white font-semibold">{center.name}</h4>
                      {!center.isActive && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {center.city && `${center.city}, `}
                      {center.address || `Lat: ${center.latitude}, Lon: ${center.longitude}`}
                    </p>
                    {center.capacity > 0 && (
                      <p className="text-gray-500 text-xs mt-1">
                        Capacity: {center.capacity.toLocaleString()}
                      </p>
                    )}
                    {center.contact && (
                      <p className="text-gray-500 text-xs mt-1">Contact: {center.contact}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(center)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(center._id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EvacuationCentersAdmin;

