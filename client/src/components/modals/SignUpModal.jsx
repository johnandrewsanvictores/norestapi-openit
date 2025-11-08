import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const SignUpModal = ({ isOpen, onClose, onSwitchToSignIn, onLocationPermissionRequest }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();

  const resetForm = () => {
    setFormData({
      username: "",
      phoneNumber: "",
      password: "",
    });
    setError("");
    setIsLoading(false);
    setShowPassword(false);
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

  const handleSwitchToSignIn = () => {
    resetForm();
    onSwitchToSignIn();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post(
        "/auth/signup",
        {
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        },
        { withCredentials: true }
      );

      const data = res.data;

      console.log(data);
      setUser(data.user);

      resetForm();
      onClose();
      
      // Show location permission modal instead of navigating directly
      if (onLocationPermissionRequest) {
        onLocationPermissionRequest();
      } else {
        navigate("/decide-user-type");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(
          error.response.data.error || "Make sure all fields are valid"
        );
      } else {
        setError("An error occurred during registration. Please try again.");
      }
    }

    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

        {/* Header */}
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

        {/* Form */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">Create Account</h3>
          <p className="text-gray-400 text-sm mb-5">Join us to receive real-time earthquake alerts</p>

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
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7F00] transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="********"
                  className="w-full px-4 py-3 pr-10 bg-[#1A1A1A] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FF7F00] transition-colors"
                  required
                  minLength="6"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF7F00] text-white py-3 rounded-lg text-lg font-semibold hover:bg-[#FF8F20] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Navigation Link */}
        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <button
              onClick={handleSwitchToSignIn}
              className="text-[#FF7F00] hover:underline focus:outline-none font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* Disclaimer */}
        <p className="text-gray-500 text-xs text-center">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SignUpModal;
