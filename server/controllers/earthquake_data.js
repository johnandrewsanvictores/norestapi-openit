
import axios from 'axios';
import SimulatedEarthquake from '../models/SimulatedEarthquake.js';

const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export const getPhilippinesEarthquakeData = async (req, res) => {
    try {
        var minMag = req.query.minMag || req.query.minMagnitude || 3.0;
        var startTime = req.query.starttime || '2025-10-01';
        var endTime = req.query.endtime || '2025-12-01';
        var includeSimulated = req.query.includeSimulated !== 'false'; 

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
            tsunami: feature.properties.tsunami,
            isSimulated: false
        }));

        let simulatedData = [];
        if (includeSimulated) {
            try {
                const startDate = new Date(startTime);
                const endDate = new Date(endTime);
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
        res.status(500).json({ error: 'Failed to fetch earthquake data' });
    }
};