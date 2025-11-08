
import axios from 'axios';
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export const getPhilippinesEarthquakeData = async (req, res) => {
    try {
        var minMag = req.query.minMag || req.query.minMagnitude || 3.0;
        var startTime = req.query.starttime || '2025-10-01';
        var endTime = req.query.endtime || '2025-12-01';

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
            }
        });

        const filteredData = response.data.features.map(feature => ({
            time: feature.properties.time,
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
            depth: feature.geometry.coordinates[2],
            magnitude: feature.properties.mag,
            place: feature.properties.place,
            magnitude_type: feature.properties.magType,
            tsunami: feature.properties.tsunami
        }));

        res.status(200).json(filteredData);
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        res.status(500).json({ error: 'Failed to fetch earthquake data' });
    }
};