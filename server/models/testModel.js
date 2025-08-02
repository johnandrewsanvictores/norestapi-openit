import mongoose from 'mongoose';
import {Timestamp} from "mongodb";

const userSchema = new mongoose.Schema({
    testField: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;