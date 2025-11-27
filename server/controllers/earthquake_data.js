
import axios from 'axios';
import SimulatedEarthquake from '../models/SimulatedEarthquake.js';

const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export const getPhilippinesEarthquakeData = async (req, res) => {
    try {
        var minMag = req.query.minMag || req.query.minMagnitude || 3.0;
        
        // Default to last year if no dates provided
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        // Parse dates as local dates (not UTC) to avoid timezone issues
        const parseLocalDate = (dateString) => {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
        };
        
        var startTime = req.query.starttime || formatDate(oneYearAgo);
        var endTime = req.query.endtime || formatDate(today);
        var includeSimulated = req.query.includeSimulated !== 'false'; 

        // Validate date range - ensure endTime is not in the future
        const todayMax = new Date(today);
        todayMax.setHours(23, 59, 59, 999); // End of today
        
        const parsedEndTime = parseLocalDate(endTime);
        
        // If endTime is in the future, cap it to today
        if (isNaN(parsedEndTime.getTime()) || parsedEndTime > todayMax) {
            endTime = formatDate(today);
        }
        
        // Ensure startTime is before endTime
        const parsedStartTime = parseLocalDate(startTime);
        const finalEndTime = parseLocalDate(endTime);
        
        if (isNaN(parsedStartTime.getTime()) || isNaN(finalEndTime.getTime())) {
            throw new Error('Invalid date format in query parameters');
        }
        
        if (parsedStartTime > finalEndTime) {
            // If startTime is after endTime, adjust to one year before endTime
            const adjustedStart = new Date(finalEndTime);
            adjustedStart.setFullYear(adjustedStart.getFullYear() - 1);
            startTime = formatDate(adjustedStart);
        }

        let filteredData = [];
        
        try {
            const response = await axios.get(USGS_EARTHQUAKE_API, {
                params: {
                    starttime: startTime,
                    endtime: endTime,
                    format: 'geojson',
                    minmagnitude: minMag,
                    maxlatitude: 20.0,
                    minlatitude: 5,
                    maxlongitude: 130.0,
                    minlongitude: 115.0,
                    orderby: 'time'
                },
                timeout: 30000, // 30 second timeout (increased from 10s)
                validateStatus: function (status) {
                    // Don't throw error for 4xx/5xx, handle it in catch block
                    return status >= 200 && status < 600;
                }
            });

            // Check if response indicates an error
            if (response.status >= 400) {
                throw new Error(`USGS API returned status ${response.status}: ${response.statusText || 'Unknown error'}`);
            }

            // Validate response structure
            if (!response.data || !Array.isArray(response.data.features)) {
                console.error('Invalid USGS API response structure:', response.data);
                throw new Error('Invalid response from USGS API');
            }

            filteredData = response.data.features.map(feature => ({
                time: feature.properties?.time || Date.now(),
                longitude: feature.geometry?.coordinates?.[0] || 0,
                latitude: feature.geometry?.coordinates?.[1] || 0,
                depth: feature.geometry?.coordinates?.[2] || 0,
                magnitude: feature.properties?.mag || 0,
                place: feature.properties?.place || 'Unknown location',
                magnitude_type: feature.properties?.magType || 'unknown',
                tsunami: feature.properties?.tsunami || 0,
                isSimulated: false
            }));
        } catch (usgsError) {
            // Provide more detailed error information
            const errorMessage = usgsError.message || usgsError.toString() || 'Unknown error';
            const errorDetails = {
                message: errorMessage,
                code: usgsError.code,
                response: usgsError.response?.data,
                status: usgsError.response?.status,
                statusText: usgsError.response?.statusText,
                config: {
                    url: usgsError.config?.url,
                    params: usgsError.config?.params,
                    timeout: usgsError.config?.timeout
                }
            };
            
            console.error('Error fetching from USGS API:', errorMessage);
            console.error('USGS API Error Details:', JSON.stringify(errorDetails, null, 2));
            
            // Check for specific error types
            if (usgsError.code === 'ECONNABORTED' || usgsError.code === 'ETIMEDOUT') {
                console.warn('USGS API request timed out. This may be due to network issues or the API being slow.');
            } else if (usgsError.response) {
                console.warn(`USGS API returned error status: ${usgsError.response.status} ${usgsError.response.statusText}`);
            } else if (usgsError.request) {
                console.warn('USGS API request was made but no response received. Check network connectivity.');
            }
            
            // Continue with empty filteredData - we'll still return simulated earthquakes if available
            filteredData = [];
        }

        let simulatedData = [];
        if (includeSimulated) {
            try {
                const startDate = parseLocalDate(startTime);
                const endDate = parseLocalDate(endTime);
                
                // Validate dates
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    console.warn('Invalid date format for simulated earthquakes query');
                    throw new Error('Invalid date format');
                }
                
                endDate.setDate(endDate.getDate() + 1);

                const simulatedEarthquakes = await SimulatedEarthquake.find({
                    isSimulated: true,
                    time: {
                        $gte: startDate.getTime(),
                        $lte: endDate.getTime()
                    },
                    magnitude: { $gte: parseFloat(minMag) }
                })
                .sort({ time: -1 })
                .limit(1000);

                simulatedData = simulatedEarthquakes.map(quake => ({
                    time: quake.time,
                    longitude: quake.longitude,
                    latitude: quake.latitude,
                    depth: quake.depth,
                    magnitude: quake.magnitude,
                    place: quake.place,
                    magnitude_type: quake.magnitude_type || 'SIM',
                    tsunami: quake.tsunami || 0,
                    isSimulated: true
                }));
            } catch (simError) {
                console.error('Error fetching simulated earthquakes:', simError);
            }
        }

        const allData = [...filteredData, ...simulatedData].sort((a, b) => b.time - a.time);

        res.status(200).json(allData);
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to fetch earthquake data',
            message: error.message || 'Unknown error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};