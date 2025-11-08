import SimulatedEarthquake from '../models/SimulatedEarthquake.js';

export const createSimulatedEarthquake = async (req, res) => {
    try {
        const { time, latitude, longitude, depth, magnitude, place, magnitude_type, tsunami } = req.body;
        const userId = req.user._id;

        if (!time || latitude === undefined || longitude === undefined || 
            depth === undefined || magnitude === undefined || !place) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const simulatedEarthquake = await SimulatedEarthquake.create({
            time: parseInt(time),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            depth: parseFloat(depth),
            magnitude: parseFloat(magnitude),
            place: place,
            magnitude_type: magnitude_type || 'SIM',
            tsunami: tsunami || 0,
            createdBy: userId,
            isSimulated: true
        });

        res.status(201).json({
            success: true,
            data: simulatedEarthquake,
            message: 'Simulated earthquake created successfully'
        });
    } catch (error) {
        console.error('Error creating simulated earthquake:', error);
        res.status(500).json({ error: 'Failed to create simulated earthquake' });
    }
};

export const getSimulatedEarthquakes = async (req, res) => {
    try {
        const { starttime, endtime, minMag } = req.query;
        
        let query = { isSimulated: true };
        
        if (starttime || endtime) {
            query.time = {};
            if (starttime) {
                const startDate = new Date(starttime);
                query.time.$gte = startDate.getTime();
            }
            if (endtime) {
                const endDate = new Date(endtime);
                endDate.setDate(endDate.getDate() + 1);
                query.time.$lte = endDate.getTime();
            }
        }
        
        if (minMag) {
            query.magnitude = { $gte: parseFloat(minMag) };
        }
        
        const simulatedEarthquakes = await SimulatedEarthquake.find(query)
            .populate('createdBy', 'username')
            .sort({ time: -1 })
            .limit(1000); 
        
        const transformedData = simulatedEarthquakes.map(quake => ({
            time: quake.time,
            longitude: quake.longitude,
            latitude: quake.latitude,
            depth: quake.depth,
            magnitude: quake.magnitude,
            place: quake.place,
            magnitude_type: quake.magnitude_type,
            tsunami: quake.tsunami,
            isSimulated: true,
            createdBy: quake.createdBy?.username || 'Unknown'
        }));

        res.status(200).json(transformedData);
    } catch (error) {
        console.error('Error fetching simulated earthquakes:', error);
        res.status(500).json({ error: 'Failed to fetch simulated earthquakes' });
    }
};

export const deleteSimulatedEarthquake = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const simulatedEarthquake = await SimulatedEarthquake.findById(id);
        
        if (!simulatedEarthquake) {
            return res.status(404).json({ error: 'Simulated earthquake not found' });
        }

        const userRole = req.user.role;
        if (userRole !== 'admin' && simulatedEarthquake.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this simulated earthquake' });
        }

        await SimulatedEarthquake.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Simulated earthquake deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting simulated earthquake:', error);
        res.status(500).json({ error: 'Failed to delete simulated earthquake' });
    }
};

export const deleteAllSimulatedEarthquakes = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ error: 'Only admin can delete all simulated earthquakes' });
        }

        const result = await SimulatedEarthquake.deleteMany({ isSimulated: true });

        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} simulated earthquakes`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting all simulated earthquakes:', error);
        res.status(500).json({ error: 'Failed to delete simulated earthquakes' });
    }
};

