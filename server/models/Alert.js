import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    phone_number: {
        type: [String],
        required: true
    },
    date_time: {
        type: Date,
        required: true
    },
    earthquake: {type: {
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
            required: true
        },
        mag: {
            type: Number,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        expected_aftershock: {
            type: Boolean,
            default: false
        },
        timestamp: {
            type: Date,
            required: true
        }
    }, required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending'
    },
    alert_type: {
        type: String,
        enum: ['awareness', 'action'],
        required: true
    }
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;