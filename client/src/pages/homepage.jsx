import React from "react";
import SignInModal from "../components/modals/SignInModal";
import SignUpModal from "../components/modals/SignUpModal";
import LocationPermissionModal from "../components/modals/LocationPermissionModal";
import { useState } from "react";

function Homepage() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleGetStarted = () => {
    setIsSignUpModalOpen(true);
  };

  const handleSignIn = () => {
    setIsSignInModalOpen(true);
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

  const handleLocationPermissionRequest = () => {
    setIsLocationModalOpen(true);
  };

  const handleCloseLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <section className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[#1A1A1A]"></div>

            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1920 1080"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <pattern
                  id="mapGrid"
                  width="80"
                  height="80"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 80 0 L 0 0 0 80"
                    fill="none"
                    stroke="#FF7F00"
                    strokeWidth="0.5"
                    opacity="0.15"
                  />
                </pattern>

                <pattern
                  id="contours"
                  width="120"
                  height="120"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="20"
                    fill="none"
                    stroke="#FF7F00"
                    strokeWidth="0.5"
                    opacity="0.1"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="none"
                    stroke="#FF7F00"
                    strokeWidth="0.5"
                    opacity="0.08"
                  />
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#mapGrid)" />
              <rect width="100%" height="100%" fill="url(#contours)" />

              <g opacity="0.25">
                <path
                  d="M 300,200 Q 380,150 450,180 Q 520,210 580,190 L 620,240 Q 580,280 520,270 Q 460,260 400,280 Q 340,260 300,240 Z"
                  fill="none"
                  stroke="#FF7F00"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 1100,350 Q 1180,320 1250,360 Q 1320,400 1380,380 L 1420,440 Q 1380,490 1320,480 Q 1260,470 1200,490 Q 1140,470 1100,450 Z"
                  fill="none"
                  stroke="#FF7F00"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 200,600 Q 280,570 350,600 Q 420,630 480,610 L 520,660 Q 480,700 420,690 Q 360,680 300,700 Q 240,680 200,660 Z"
                  fill="none"
                  stroke="#FF7F00"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 1300,700 Q 1380,670 1450,700 Q 1520,730 1580,710 L 1620,760 Q 1580,800 1520,790 Q 1460,780 1400,800 Q 1340,780 1300,760 Z"
                  fill="none"
                  stroke="#FF7F00"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                <path
                  d="M 700,450 Q 720,430 750,445 T 800,460 L 820,490 Q 790,510 760,500 T 720,480 Z"
                  fill="none"
                  stroke="#FF7F00"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <path
                  d="M 500,850 Q 540,820 590,840 L 620,880 Q 580,910 540,895 Z"
                  fill="none"
                  stroke="#FF7F00"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
                <path
                  d="M 1500,250 Q 1540,230 1580,250 L 1600,280 Q 1570,300 1540,290 Z"
                  fill="none"
                  stroke="#FF7F00"
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              </g>

              <g
                opacity="0.2"
                fontSize="12"
                fill="#FF7F00"
                fontFamily="monospace"
              >
                <text x="50" y="30">
                  15°N
                </text>
                <text x="50" y="530">
                  0°
                </text>
                <text x="50" y="1050">
                  15°S
                </text>
                <text x="150" y="1060">
                  30°W
                </text>
                <text x="960" y="1060">
                  0°
                </text>
                <text x="1770" y="1060">
                  30°E
                </text>
              </g>
            </svg>
          </div>

          <div className="absolute bottom-[15%] right-[12%]">
            <div className="pulse-container">
              <div className="pulse-ring pulse-ring-1"></div>
              <div className="pulse-ring pulse-ring-2"></div>
              <div className="pulse-ring pulse-ring-3"></div>
              <div className="pulse-center-dot">
                <div className="absolute inset-0 bg-[#FF7F00] rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="absolute top-[18%] left-[58%]">
            <div className="pulse-container">
              <div
                className="pulse-ring pulse-ring-1"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="pulse-ring pulse-ring-2"
                style={{ animationDelay: "1.5s" }}
              ></div>
              <div
                className="pulse-ring pulse-ring-3"
                style={{ animationDelay: "2.5s" }}
              ></div>
              <div className="pulse-center-dot">
                <div className="absolute inset-0 bg-[#FF7F00] rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="absolute top-[50%] left-[8%] -translate-y-1/2">
            <div className="pulse-container">
              <div
                className="pulse-ring pulse-ring-1"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="pulse-ring pulse-ring-2"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="pulse-ring pulse-ring-3"
                style={{ animationDelay: "3s" }}
              ></div>
              <div className="pulse-center-dot">
                <div className="absolute inset-0 bg-[#FF7F00] rounded-full animate-ping opacity-75"></div>
                <div className="absolute inset-1 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 text-center drop-shadow-2xl">
              Earthquake Alerts
            </h1>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#FF7F00] mb-6 text-center drop-shadow-2xl">
              When Seconds Matter
            </h2>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl text-center mb-10 px-4 drop-shadow-lg mx-auto">
              Get real-time earthquake alerts, detailed seismic data, and safety
              information to help protect yourself and your loved ones.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-[#FF7F00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#FF8F20] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
              </button>
              <button
                onClick={handleSignIn}
                className="bg-transparent border-2 border-[#FF7F00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#FF7F00]/10 transition-all duration-200 hover:scale-105"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4">
              Comprehensive Earthquake Monitoring
            </h2>

            <p className="text-lg md:text-xl text-white/80 text-center mb-16 max-w-3xl mx-auto">
              Everything you need to stay informed and safe during seismic
              events
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[#FF7F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Instant Alerts
                </h3>
                <p className="text-white/70 text-sm">
                  Receive notifications within seconds of seismic activity
                  detection
                </p>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[#FF7F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Precise Location
                </h3>
                <p className="text-white/70 text-sm">
                  Know exactly where earthquakes are occurring with detailed
                  maps
                </p>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[#FF7F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Safety Info
                </h3>
                <p className="text-white/70 text-sm">
                  Get actionable safety recommendations tailored to your
                  location
                </p>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[#FF7F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Live Data</h3>
                <p className="text-white/70 text-sm">
                  Access comprehensive seismic data and historical trends
                </p>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[#FF7F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Evacuation Centers
                </h3>
                <p className="text-white/70 text-sm">
                  Find nearby evacuation centers with Waze integration and
                  admin-managed locations
                </p>
              </div>

              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-[#FF7F00]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  SMS Alerts
                </h3>
                <p className="text-white/70 text-sm">
                  Receive critical earthquake alerts via SMS for instant
                  emergency notifications
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Stay Protected From Earthquakes
            </h2>

            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Get instant alerts and comprehensive earthquake data to help you
              stay safe and informed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignIn}
                className="bg-[#FF7F00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#FF8F20] transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-transparent border-2 border-[#FF7F00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#FF7F00]/10 transition-colors duration-200"
              >
                Create Account
              </button>
            </div>
          </div>
        </section>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleCloseModals}
        onSwitchToSignUp={handleSwitchToSignUp}
        onLocationPermissionRequest={handleLocationPermissionRequest}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={handleCloseModals}
        onSwitchToSignIn={handleSwitchToSignIn}
        onLocationPermissionRequest={handleLocationPermissionRequest}
      />

      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        onClose={handleCloseLocationModal}
      />
    </>
  );
}

export default Homepage;
