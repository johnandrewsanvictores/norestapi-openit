import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import authRoutes from './routes/auth.js';
import earthquakeRoutes from './routes/earthquake_data.js';
import connectDbB from "./config/db.js";
import session from 'express-session';
import axios from 'axios';

const app = express();

connectDbB();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Specific origin required when using credentials
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/auth", authRoutes);
app.use("/earthquake",  earthquakeRoutes)

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));

app.get('/', (req, res) => {
    res.json({"msg": "Hello sdfsdfdsfdsfds"});
});


app.post('/send-sms', async (req, res) => {
    try {
        const { phoneNumbers, text } = req.body;
        const smsApiUrl = 'https://api.sms-gate.app/3rdparty/v1/message';
        const smsApiUsername = process.env.SMS_API_USERNAME;
        const smsApiPassword = process.env.SMS_API_PASSWORD;

        await axios.post(smsApiUrl, {
            textMessage: { text },
            phoneNumbers,
            "simNumber": 1,
        }, {
            auth: {
                username: smsApiUsername,
                password: smsApiPassword
            }
        });

        res.status(200).json({ success: true, message: 'SMS sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send SMS', error: error.message });
    }
});



app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});