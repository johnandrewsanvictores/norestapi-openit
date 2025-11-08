import mongoose from 'mongoose';

const earthquakeSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
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
        // Depth in kilometers
    },
    mag: {
        type: Number,
        required: true,
        // Magnitude as double
    },
    location: {
        type: String,
        required: true
    },
    expected_aftershock: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Earthquake = mongoose.model('Earthquake', earthquakeSchema);

export default Earthquake;

