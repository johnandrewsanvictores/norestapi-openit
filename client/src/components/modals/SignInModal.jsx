import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const SignInModal = ({ isOpen, onClose, onSwitchToSignUp, onLocationPermissionRequest }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useAuth();

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
    });
    setError("");
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSwitchToSignUp = () => {
    resetForm();
    onSwitchToSignUp();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Check if location is set
  const checkLocation = () => {
    try {
      const locationData = localStorage.getItem('userLocation');
      if (locationData) {
        const location = JSON.parse(locationData);
        if (location.latitude && location.longitude) {
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking location:', error);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/signin", {
        username: formData.username,
        password: formData.password,
      }, { withCredentials: true });

      const data = res.data;

      setUser(data.user);
      console.log(data.user);

      resetForm();
      onClose();
      
      const hasLocation = checkLocation();
      
      if (!hasLocation) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date().toISOString()
              };
              
              try {
                const { getLocationName } = await import('../../utils/locationHelper.js');
                const locationName = getLocationName(locationData.latitude, locationData.longitude);
                locationData.locationName = locationName;
              } catch (error) {
                console.error('Error getting location name:', error);
                locationData.locationName = `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`;
              }
              
              localStorage.setItem('locationPermission', 'granted');
              localStorage.setItem('userLocation', JSON.stringify(locationData));
              window.dispatchEvent(new Event('locationUpdated'));
              
              navigate("/dashboard");
            },
            (error) => {
              if (onLocationPermissionRequest) {
                onLocationPermissionRequest();
              } else {
                console.warn('Location permission not available:', error);
                navigate("/dashboard");
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        } else {
          if (onLocationPermissionRequest) {
            onLocationPermissionRequest();
          } else {
            navigate("/dashboard");
          }
        }
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 400 || status === 401) {
          setError(errorData.error || "Invalid credentials");
        } else if (status === 500) {
          setError(errorData.error || errorData.message || "Server error. Please try again.");
        } else {
          setError("An error occurred during sign in. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A2A] rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors"
        >
          ×
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Earthquake Alert</h2>
          </div>
          <p className="text-gray-400 text-sm ml-11">Real-time earthquake monitoring</p>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">Sign In</h3>
          <p className="text-gray-400 text-sm mb-5">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-white font-medium mb-2 text-sm">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7F00] transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="********"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7F00] transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF7F00] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#FF8F20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <button
              onClick={handleSwitchToSignUp}
              className="text-[#FF7F00] hover:underline focus:outline-none font-medium"
            >
              Sign up here
            </button>
          </p>
        </div>

        <p className="text-gray-500 text-xs text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignInModal;
