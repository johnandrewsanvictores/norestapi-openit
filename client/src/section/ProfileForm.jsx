import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProfileForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSave = () => {
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    console.log("Profile updated:", {
      username: formData.username,
      phoneNumber: formData.phoneNumber,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4 sm:p-6 border border-gray-800">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
        Profile Information
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-300 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm sm:text-base text-white font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label className="block text-sm sm:text-base text-white font-medium mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
            placeholder="Enter your phone number"
          />
        </div>

        <div className="pt-3 sm:pt-4 border-t border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            Change Password
          </h3>

          <div className="mb-3 sm:mb-4">
            <label className="block text-sm sm:text-base text-white font-medium mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showCurrentPassword ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-sm sm:text-base text-white font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showNewPassword ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base text-white font-medium mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base bg-[#1A1A1A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#FF7F00] transition-colors"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#FF7F00] text-white py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-[#FF8F20] transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
