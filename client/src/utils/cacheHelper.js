/**
 * Cache helper for storing earthquake alerts and safety guidelines
 */

const CACHE_KEYS = {
  RECENT_ALERTS: 'earthquake_recent_alerts',
  SAFETY_GUIDES: 'earthquake_safety_guides',
  MAX_ALERTS: 50,
  MAX_GUIDES: 100
};

/**
 * Get recent earthquake alerts from cache
 * @returns {Array} Array of recent alerts
 */
export const getCachedAlerts = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.RECENT_ALERTS);
    if (cached) {
      const alerts = JSON.parse(cached);
      
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return alerts.filter(alert => alert.timestamp >= sevenDaysAgo);
    }
  } catch (error) {
    console.error('Error reading cached alerts:', error);
  }
  return [];
};

/**
 * Save earthquake alert to cache
 * @param {Object} earthquake - Earthquake object
 */
export const saveAlertToCache = (earthquake) => {
  try {
    const alerts = getCachedAlerts();
    
    
    const alertId = `${earthquake.timestamp || earthquake.time}-${earthquake.location}`;
    const exists = alerts.some(a => 
      (a.timestamp || a.time) === (earthquake.timestamp || earthquake.time) &&
      a.location === earthquake.location
    );
    
    if (!exists) {
      alerts.unshift({
        ...earthquake,
        cachedAt: Date.now()
      });
      
      
      const trimmed = alerts.slice(0, CACHE_KEYS.MAX_ALERTS);
      localStorage.setItem(CACHE_KEYS.RECENT_ALERTS, JSON.stringify(trimmed));
    }
  } catch (error) {
    console.error('Error saving alert to cache:', error);
  }
};

/**
 * Get safety guide from cache
 * @param {string} locationKey - Key based on location and coordinates
 * @returns {Array|null} Safety guide array or null if not found
 */
export const getCachedSafetyGuide = (locationKey) => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.SAFETY_GUIDES);
    if (cached) {
      const guides = JSON.parse(cached);
      const guide = guides[locationKey];
      
      
      if (guide && guide.cachedAt) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        if (guide.cachedAt >= thirtyDaysAgo) {
          return guide.safety_guide;
        }
      }
    }
  } catch (error) {
    console.error('Error reading cached safety guide:', error);
  }
  return null;
};

/**
 * Save safety guide to cache
 * @param {string} locationKey - Key based on location and coordinates
 * @param {Array} safetyGuide - Safety guide array
 */
export const saveSafetyGuideToCache = (locationKey, safetyGuide) => {
  try {
    if (!safetyGuide || !Array.isArray(safetyGuide) || safetyGuide.length === 0) {
      return;
    }
    
    const cached = localStorage.getItem(CACHE_KEYS.SAFETY_GUIDES);
    const guides = cached ? JSON.parse(cached) : {};
    
    guides[locationKey] = {
      safety_guide: safetyGuide,
      cachedAt: Date.now()
    };
    
    
    const guideKeys = Object.keys(guides);
    if (guideKeys.length > CACHE_KEYS.MAX_GUIDES) {
      
      const sorted = guideKeys.sort((a, b) => 
        (guides[a].cachedAt || 0) - (guides[b].cachedAt || 0)
      );
      const toRemove = sorted.slice(0, sorted.length - CACHE_KEYS.MAX_GUIDES);
      toRemove.forEach(key => delete guides[key]);
    }
    
    localStorage.setItem(CACHE_KEYS.SAFETY_GUIDES, JSON.stringify(guides));
  } catch (error) {
    console.error('Error saving safety guide to cache:', error);
  }
};

/**
 * Generate a cache key for safety guide based on location and coordinates
 * @param {string} location - Location string
 * @param {Array} coordinates - [longitude, latitude]
 * @returns {string} Cache key
 */
export const generateSafetyGuideKey = (location, coordinates) => {
  const loc = (location || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const coords = coordinates && coordinates.length >= 2 
    ? `${coordinates[0]}_${coordinates[1]}` 
    : '0_0';
  return `${loc}_${coords}`;
};

/**
 * Check if device is online
 * @returns {boolean} True if online
 */
export const isOnline = () => {
  return navigator.onLine !== false;
};

/**
 * Clear old cache entries (older than specified days)
 * @param {number} days - Number of days to keep
 */
export const clearOldCache = (days = 30) => {
  try {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    
    const alerts = getCachedAlerts();
    const filtered = alerts.filter(alert => (alert.timestamp || alert.cachedAt) >= cutoff);
    localStorage.setItem(CACHE_KEYS.RECENT_ALERTS, JSON.stringify(filtered));
    
    
    const cached = localStorage.getItem(CACHE_KEYS.SAFETY_GUIDES);
    if (cached) {
      const guides = JSON.parse(cached);
      const filtered = {};
      Object.keys(guides).forEach(key => {
        if (guides[key].cachedAt >= cutoff) {
          filtered[key] = guides[key];
        }
      });
      localStorage.setItem(CACHE_KEYS.SAFETY_GUIDES, JSON.stringify(filtered));
    }
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
};

