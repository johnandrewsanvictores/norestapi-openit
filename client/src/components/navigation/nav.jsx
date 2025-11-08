"use client";

import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

import logo from "../../assets/SamaKa.png";
import SignInModal from "../modals/SignInModal";
import SignUpModal from "../modals/SignUpModal";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../../axios.js";
import { showConfirmation, showSuccess } from "../../utils/alertHelper.js";
import { useNavigate } from "react-router-dom";
import { getNavLinkClass } from "../../utils/utils.js";

const Nav = () => {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

  const { user, loading, setUser } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignInClick = () => {
    setIsSignInModalOpen(true);
    setIsSignUpModalOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleCloseModals = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(false);
  };

  const handleSwitchToSignUp = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUpModalOpen(false);
    setIsSignInModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      const confirmed = await showConfirmation({
        title: "Log out?",
        text: "Are you sure you want to log out?",
        confirmButtonText: "Log Out",
      });

      if (confirmed) {
        const res = await api.post("/auth/logout");
        setUser(null);

        showSuccess(res.data.message);
        navigate("/");
      }

      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <nav className="bg-bgColor2 py-4 lg:py-6 relative z-50 shadow-sm">
        <div className="flex justify-between items-center w-full mx-auto px-4 lg:px-8">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 lg:space-x-4">
              <img
                src={logo}
                alt="logo"
                className="h-10 w-10 lg:h-12 lg:w-12"
              />
              <span className="text-headingText font-nunito font-bold text-xl lg:text-3xl">
                <span className="text-primary">Bayani</span>
                <span className="text-subHeadingText">mo</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex lg:justify-center lg:flex-1">
            <div className="flex space-x-6 xl:space-x-10 items-center">
              <NavLink to="/" className={getNavLinkClass}>
                Home
              </NavLink>
              <NavLink to="/about" className={getNavLinkClass}>
                About
              </NavLink>
              <NavLink to="/reward" className={getNavLinkClass}>
                Reward
              </NavLink>
            </div>
          </div>

          <div className="hidden lg:flex lg:justify-end lg:items-center lg:space-x-4">
            {user ? (
              <div className="relative">
                <div
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                    {user.firstName.charAt(0)}
                  </div>
                  <i
                    className={`fa-solid fa-caret-down transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  ></i>
                </div>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 min-w-0">
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <NavLink
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/interview-history"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Interview History
                    </NavLink>
                    <NavLink
                      to="/analytics"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Analytics
                    </NavLink>
                    <NavLink
                      to="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Settings
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <i className="fas fa-sign-out-alt text-gray-400"></i>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignInClick}
                className="bg-primary text-white px-6 py-2 lg:px-8 lg:py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Sign In
              </button>
            )}
          </div>

    
          <div className="lg:hidden flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div
                  onClick={toggleDropdown}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium cursor-pointer"
                >
                  {user.firstName.charAt(0)}
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-700 hover:text-primary focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <i className="fas fa-times text-2xl"></i>
                  ) : (
                    <i className="fas fa-bars text-2xl"></i>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-primary focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <i className="fas fa-times text-2xl"></i>
                ) : (
                  <i className="fas fa-bars text-2xl"></i>
                )}
              </button>
            )}
          </div>
        </div>


        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg absolute w-full left-0 z-40">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium text-lg">
                    {user.firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center space-x-4 py-2">
                  <button
                    onClick={handleSignInClick}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors w-full"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
              <NavLink
                to="/"
                className="px-4 py-3 hover:bg-gray-50 font-medium text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className="px-4 py-3 hover:bg-gray-50 font-medium text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </NavLink>
            </div>

            {user && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 font-medium py-2"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}

 
        {isDropdownOpen && isMobile && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsDropdownOpen(false)}
          >
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium text-xl">
                  {user.firstName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <NavLink
                  to="/dashboard"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/interview-history"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Interview History
                </NavLink>
                <NavLink
                  to="/analytics"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Analytics
                </NavLink>
                <NavLink
                  to="/settings"
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Settings
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <i className="fas fa-sign-out-alt text-lg"></i>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </nav>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleCloseModals}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

  
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={handleCloseModals}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </>
  );
};

export default Nav;
