import mongoose from 'mongoose';
import { Timestamp } from 'mongodb';

const earthquakeSchema = new mongoose.Schema({
    time: {
        type: Timestamp,
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
    tsunami: {
        type: Boolean,
        default: false
    },
    magnitude_type: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Earthquake = mongoose.model('Earthquake', earthquakeSchema);

export default Earthquake;

