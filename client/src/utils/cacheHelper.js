
const CACHE_KEYS = {
  RECENT_ALERTS: 'earthquake_recent_alerts',
  SAFETY_GUIDES: 'earthquake_safety_guides',
  MAX_ALERTS: 50,
  MAX_GUIDES: 100
};


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


export const generateSafetyGuideKey = (location, coordinates) => {
  const loc = (location || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const coords = coordinates && coordinates.length >= 2 
    ? `${coordinates[0]}_${coordinates[1]}` 
    : '0_0';
  return `${loc}_${coords}`;
};


export const isOnline = () => {
  return navigator.onLine !== false;
};


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

