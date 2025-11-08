import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import authRoutes from './routes/auth.js';
import earthquakeRoutes from './routes/earthquake_data.js';
import simulatedEarthquakeRoutes from './routes/simulated_earthquake.js';
import connectDbB from "./config/db.js";
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not set in environment variables');
    process.exit(1);
}

if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not set in environment variables');
    process.exit(1);
}

connectDbB().catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/auth", authRoutes);
app.use("/earthquake", earthquakeRoutes);
app.use("/simulated-earthquake", simulatedEarthquakeRoutes);

app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.get('/', (req, res) => {
    res.json({"msg": "Server is running"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});