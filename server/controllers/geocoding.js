import axios from 'axios';

export const reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    const opencageApiKey = process.env.OPENCAGE_API_KEY || '74dd9a689bc14201bd2a4f8b219ca20d';
    const opencageBaseUrl = process.env.OPENCAGE_BASE_URL || 'https://api.opencagedata.com/geocode/v1/json';

    // OpenCage API expects coordinates as "lat,lon"
    const url = `${opencageBaseUrl}?q=${latitude},${longitude}&key=${opencageApiKey}&language=en&limit=1`;

    const response = await axios.get(url);

    if (response.data && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      const locationName = result.formatted || result.components?.city || result.components?.town || 
                          result.components?.village || result.components?.county || 
                          result.components?.state || 'Unknown Location';
      
      return res.status(200).json({
        success: true,
        locationName: locationName,
        components: result.components,
        formatted: result.formatted
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reverse geocode location',
      message: error.message
    });
  }
};

