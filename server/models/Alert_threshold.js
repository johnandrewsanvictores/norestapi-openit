import mongoose from 'mongoose';

const Alert_threshold_schema = new mongoose.Schema({
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
    },
    minimum_magnitude: {
        type: Number,
        required: true,
        default: 4.0 
    },
    alert_radius: {
        type: Number,
        required: true,
        default: 5 
    },
    enable_sms_alerts: {
        type: Boolean,
        default: false
    },
    enable_push_notifications: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Alert_threshold = mongoose.model('Alert_threshold', Alert_threshold_schema);

export default Alert_threshold;

