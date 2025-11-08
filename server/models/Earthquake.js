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
    },
    mag: {
        type: Number,
        required: true,
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

