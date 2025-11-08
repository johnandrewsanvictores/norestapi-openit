import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    location_name: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

export default Location;

