import dotenv from 'dotenv';
import User from "../models/User.js";
import {hashPassword} from "../utils/hash.js";
import {body, validationResult} from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();


const createToken = (userId, phone_number, is_new_user) => {
    return jwt.sign({ _id: userId, phone_number, is_new_user },  process.env.JWT_SECRET, { expiresIn: '7d'});
}


export const getUser = (req, res) => {
    if (req.isAuthenticated()) {
        return res.json(req.user);            
    }
    res.status(401).json({ message: 'Not authenticated' });
}


//logout controller without passport
export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });
    res.json({ message: 'Logged out successfully' });
}


export const createUser = async (req, res) => {
    try {
        const {phone_number, password, username} = req.body;

        const hashedPassword = await hashPassword(password);

        const users = await User.findOne({
            $or: [
                {username}
            ]
        })

        if (users) {
            if (users.username === username) {
                return res.status(409).json({ error: "Username already exists" });
            }
        }

        const user = await User.create({phone_number, password: hashedPassword, username});
        const token = createToken(user._id, user.phone_numer);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(201).json({
            user: {
                _id : user._id,
                username: user.username,
                phone_number: user.phone_number,        
        },
            success: "true",
            message: "User created successfully"
        });
    } catch(error) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


export const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        await User.findByIdAndUpdate(
            user._id,
            { $set: { is_new_user: false } },
            { new: true }
        );

        
        const token = createToken(user._id, user.role, user.is_new_user);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        
        res.status(200).json({
            user: {
                _id : user._id,
                username: user.username,
                phone_number: user.phone_number,
                is_new_user: false
            },
            success: "true",
            message: "Logged in successfully"
        });

    } catch (err) {
        res.status(500).json({ error: "Login failed "+ err.message });
    }
};

export const updateUser =  async (req, res) => {
    try {
        const { _id, ...updateFields } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            { $set: updateFields },
            { new: true }
        );

        res.status(200).json({ success: true, user: updatedUser, message: "Updated user successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password'); 

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: { ...user.toObject(), _id: user._id } });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
}

export const getSpecificUser = async (req, res) => {
    try {
        const filters = req.query;
        const users = await User.find(filters); 
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err });
    }
}


export const validateUserInfo = [
    body('username').trim().isLength({ min: 6}).withMessage('Username must be at least 6 characters'),
    body('password').trim().isLength({ min: 8}).withMessage('Password must be at least 8 characters'),
    body('phone_number').trim().isLength({ min: 11, max: 11 }).withMessage('Phone number must be 11 digits only'),  
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                error: errors.array()[0].msg,
            });
        }
        next();
    }
];


import axios from 'axios';
const USGS_EARTHQUAKE_API = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export const getPhilippinesEarthquakeData = async (req, res) => {
    try {
        // Fetch earthquake data for the Philippines region only  with start and end time, and magnitude filter

        var minMag = req.query.minMagnitude || 6.0;
        var startTime = req.query.starttime || '2025-10-01';
        var endTime = req.query.endtime || '2025-12-01';

        const response = await axios.get(USGS_EARTHQUAKE_API, {
            params: {
                starttime: startTime,
                endtime: endTime,
                format: 'geojson',
                minmagnitude: minMag,
                maxlatitude: 20.0,
                minlatitude: 5,
                maxlongitude: 130.0,
                minlongitude: 115.0,
                orderby: 'time'
            }
        });

        const filteredData = response.data.features.map(feature => ({
            time: feature.properties.time,
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
            depth: feature.geometry.coordinates[2],
            magnitude: feature.properties.mag,
            place: feature.properties.place,
            magnitude_type: feature.properties.magType,
            tsunami: feature.properties.tsunami
        }));

        res.status(200).json(filteredData);
    } catch (error) {
        console.error('Error fetching earthquake data:', error);
        res.status(500).json({ error: 'Failed to fetch earthquake data' });
    }
};