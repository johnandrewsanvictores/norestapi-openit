import mongoose from 'mongoose';

const simulatedEarthquakeSchema = new mongoose.Schema({
    time: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    depth: {
        type: Number,
        required: true,
    },
    magnitude: {
        type: Number,
        required: true,
    },
    place: {
        type: String,
        required: true
    },
    magnitude_type: {
        type: String,
        default: 'SIM'
    },
    tsunami: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isSimulated: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const SimulatedEarthquake = mongoose.model('SimulatedEarthquake', simulatedEarthquakeSchema);

export default SimulatedEarthquake;

