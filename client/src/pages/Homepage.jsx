import React from 'react'
import SignInModal from '../components/modals/SignInModal'
import SignUpModal from '../components/modals/SignUpModal'
import { useState } from 'react'

function Homepage() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

  const handleGetStarted = () => {
    setIsSignUpModalOpen(true)
  }

  const handleSignIn = () => {
    setIsSignInModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsSignInModalOpen(false)
    setIsSignUpModalOpen(false)
  }

  const handleSwitchToSignUp = () => {
    setIsSignInModalOpen(false)
    setIsSignUpModalOpen(true)
  }

  const handleSwitchToSignIn = () => {
    setIsSignUpModalOpen(false)
    setIsSignInModalOpen(true)
  }

  return (
    <>
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Top Banner */}
          <div className="mb-8 px-4 py-2 rounded-lg border border-[#FF7F00] text-[#FF7F00] text-sm font-semibold flex items-center gap-2">
            <span>▲</span>
            <span>Real-Time Monitoring</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 text-center">
            Earthquake Alerts
          </h1>

          {/* Sub-heading */}
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#FF7F00] mb-6 text-center">
            When Seconds Matter
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl text-center mb-10 px-4">
            Get real-time earthquake alerts, detailed seismic data, and safety information to help protect yourself and your loved ones.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleGetStarted}
              className="bg-[#FF7F00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#FF8F20] transition-colors duration-200"
            >
              Get Started
            </button>
            <button
              onClick={handleSignIn}
              className="bg-transparent border-2 border-[#FF7F00] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#FF7F00]/10 transition-colors duration-200"
            >
              Sign In
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Section Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4">
              Comprehensive Earthquake Monitoring
            </h2>

            {/* Section Sub-heading */}
            <p className="text-lg md:text-xl text-white/80 text-center mb-16 max-w-3xl mx-auto">
              Everything you need to stay informed and safe during seismic events
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Instant Alerts */}
              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Instant Alerts</h3>
                <p className="text-white/70 text-sm">
                  Receive notifications within seconds of seismic activity detection
                </p>
              </div>

              {/* Card 2: Precise Location */}
              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Precise Location</h3>
                <p className="text-white/70 text-sm">
                  Know exactly where earthquakes are occurring with detailed maps
                </p>
              </div>

              {/* Card 3: Safety Info */}
              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Safety Info</h3>
                <p className="text-white/70 text-sm">
                  Get actionable safety recommendations tailored to your location
                </p>
              </div>

              {/* Card 4: Live Data */}
              <div className="bg-[#2A2A2A] rounded-lg p-6 border border-[#3A3A3A] hover:border-[#FF7F00]/50 transition-colors duration-200">
                <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-[#FF7F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Live Data</h3>
                <p className="text-white/70 text-sm">
                  Access comprehensive seismic data and historical trends
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Section Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Stay Protected From Earthquakes
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Get instant alerts and comprehensive earthquake data to help you stay safe and informed.
            </p>

            {/* CTA Buttons */}
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

      {/* Modals */}
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
  )
}

export default Homepage