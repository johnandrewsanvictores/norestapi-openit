import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    is_new_user: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;

