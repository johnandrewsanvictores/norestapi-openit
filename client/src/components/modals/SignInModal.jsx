import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/SamaKa.png";
import api from "../../../axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const SignInModal = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useAuth();

  // Reset form when modal closes
  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
    });
    setError("");
    setIsLoading(false);
  };

  // Clear form data when modal closes
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
   
      const res = await api.post("/auth/signin", {
        username: formData.username,
        password: formData.password,
      });

      const data = res.data;

      setUser(data.user);
      console.log(data.user);

    
      resetForm();
      onClose();
      if (!data.user.barangayId && data.user.role === "public_user") {
        navigate("/decide-user-type");
      } else {
        if(data.user.role === "public_user") {
          navigate("/dashboard");
        }else if(data.user.role === "barangay"){
          navigate("/barangay-dashboard")
        }else if(data.user.role === "municipality"){
          navigate("/municipality-dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.error || "Invalid credentials");
      } else {
        setError("An error occurred during sign in. Please try again.");
      }
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = import.meta.env.VITE_API_URL + "/auth/google";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <img src={logo} alt="logo" className="h-10 w-10" />
            <span className="text-headingText font-nunito font-bold text-2xl">
              
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={handleSwitchToSignUp}
              className="text-blue-500 hover:underline focus:outline-none"
            >
              Sign Up
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Username: <span className="text-red">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Type your username"
                className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Password: <span className="text-red">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Type your password"
                className="w-full pl-10 pr-4 py-3 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                required
                disabled={isLoading}
              />
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-blue-500 hover:underline text-sm">
                Forgot Password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign in with
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full border border-gray-300 rounded-full py-3 flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
            onClick={handleGoogleLogin}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-medium">Google</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInModal;
