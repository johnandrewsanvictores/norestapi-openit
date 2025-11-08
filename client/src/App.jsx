import { Routes, Route, Navigate } from "react-router-dom";

import Homepage from "./pages/Homepage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EarthquakeFeed from "./pages/EarthquakeFeed.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Profile from "./pages/Profile.jsx";
import Simulation from "./pages/Simulation.jsx";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/feed" element={<EarthquakeFeed />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/simulation" element={<Simulation />} />
      </Routes>
    </>
  );
}

export default App;
