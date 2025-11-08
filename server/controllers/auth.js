import dotenv from 'dotenv';
import User from "../models/User.js";
import {hashPassword} from "../utils/hash.js";
import {body, validationResult} from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();


const createToken = (userId, is_new_user, role) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign({ _id: userId, is_new_user, role }, process.env.JWT_SECRET, { expiresIn: '7d'});
}


export const getUser = (req, res) => {
    if (req.isAuthenticated()) {
        return res.json(req.user);            
    }
    res.status(401).json({ message: 'Not authenticated' });
}


export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            path: '/',
        });
        
        res.status(200).json({ 
            success: true,
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to logout' 
        });
    }
}


export const createUser = async (req, res) => {
    try {
        const {phone_number, password, username} = req.body;

        if (!username || !password || !phone_number) {
            return res.status(400).json({ error: 'Username, password, and phone number are required' });
        }

        const hashedPassword = await hashPassword(password);

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const isAdmin = username.toLowerCase().includes('admin') || username.toLowerCase() === 'admin';
        
        const user = await User.create({
            phone_number, 
            password: hashedPassword, 
            username,
            role: isAdmin ? 'admin' : 'user'
        });

        const token = createToken(user._id, user.is_new_user, user.role);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        res.status(201).json({
            user: {
                _id: user._id,
                username: user.username,
                phone_number: user.phone_number,
                is_new_user: user.is_new_user,
                role: user.role
            },
            success: "true",
            message: "User created successfully"
        });
    } catch(error) {
        console.error('Create user error:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Username already exists' });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: Object.values(error.errors).map(e => e.message).join(', ') });
        }
        
        res.status(500).json({ 
            error: 'Server error', 
            message: error.message 
        });
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

        
        const token = createToken(user._id, user.is_new_user, user.role);

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
                is_new_user: false,
                role: user.role || 'user'
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
    body('password').trim().isLength({ min: 6}).withMessage('Password must be at least 6 characters'),
    body('phone_number').trim().isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),  
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