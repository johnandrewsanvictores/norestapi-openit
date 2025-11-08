export const ALERT_CONFIG = {
  THRESHOLDS: {
    EMERGENCY: 5.0,
    WARNING: 4.0,
    NOTICE: 3.0,
  },

  COLORS: {
    EMERGENCY: {
      primary: "from-red-600 to-red-700",
      border: "border-red-500",
      text: "text-red-600",
    },
    WARNING: {
      primary: "from-yellow-600 to-yellow-700",
      border: "border-yellow-500",
      text: "text-yellow-600",
    },
    NOTICE: {
      primary: "from-blue-600 to-blue-700",
      border: "border-blue-500",
      text: "text-blue-600",
    },
  },

  SOUND: {
    enabled: true,
    loop: true,
    volume: 0.7,
    files: {
      emergency: "/alert-sound.mp3",
      warning: "/warning-sound.mp3",
      notice: "/notice-sound.mp3",
    },
  },

  AUTO_DISMISS: {
    enabled: false,
    delay: 30000,
  },

  CHECK_INTERVAL: 30000,

  SAFETY_INSTRUCTIONS: {
    EMERGENCY: [
      "Drop, Cover, and hold on indoors",
      "Move away from buildings if outdoors",
      "Do not use elevators",
      "Check for injuries after shaking stops",
    ],
    WARNING: [
      "Stay alert and be prepared",
      "Move away from windows",
      "Secure loose items",
      "Know your evacuation routes",
    ],
    NOTICE: [
      "Be aware of potential aftershocks",
      "Monitor official updates",
      "Stay calm and informed",
    ],
  },
};

export const getAlertLevel = (magnitude) => {
  const mag = parseFloat(magnitude);

  if (mag >= ALERT_CONFIG.THRESHOLDS.EMERGENCY) {
    return "EMERGENCY";
  } else if (mag >= ALERT_CONFIG.THRESHOLDS.WARNING) {
    return "WARNING";
  } else if (mag >= ALERT_CONFIG.THRESHOLDS.NOTICE) {
    return "NOTICE";
  }

  return "NONE";
};

export const shouldShowAlert = (magnitude) => {
  return parseFloat(magnitude) >= ALERT_CONFIG.THRESHOLDS.NOTICE;
};

export const getAlertConfig = (magnitude) => {
  const level = getAlertLevel(magnitude);

  return {
    level,
    color: ALERT_CONFIG.COLORS[level],
    instructions: ALERT_CONFIG.SAFETY_INSTRUCTIONS[level],
    soundFile: ALERT_CONFIG.SOUND.files[level.toLowerCase()],
  };
};

export const formatEarthquakeData = (earthquake) => {
  return {
    magnitude: parseFloat(earthquake.magnitude || 0).toFixed(1),
    location: earthquake.location || earthquake.place || "Unknown location",
    depth: earthquake.depth ? `${earthquake.depth} km` : "Unknown depth",
    timeAgo: formatTimeAgo(earthquake.time || earthquake.timestamp),
  };
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "Unknown time";

  const now = Date.now();
  const eventTime =
    typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
  const diffMs = now - eventTime;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return "Just now";
  if (diffSecs < 60) return `${diffSecs} seconds ago`;
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

export const getMagnitudeSeverity = (magnitude) => {
  const mag = parseFloat(magnitude);

  if (mag < 2.0) return "Micro";
  if (mag < 4.0) return "Minor";
  if (mag < 5.0) return "Light";
  if (mag < 6.0) return "Moderate";
  if (mag < 7.0) return "Strong";
  if (mag < 8.0) return "Major";
  return "Great";
};

export default ALERT_CONFIG;
