import mongoose from 'mongoose';

const configurationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    locations: {
        type: [String],
        default: []
    },
    minimum_magnitude: {
        type: Number,
        required: true,
        default: 0.0
    }
}, { timestamps: true });

const Configuration = mongoose.model('Configuration', configurationSchema);

export default Configuration;

