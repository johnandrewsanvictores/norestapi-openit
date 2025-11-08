import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import authRoutes from './routes/auth.js';
import earthquakeRoutes from './routes/earthquake_data.js';
import connectDbB from "./config/db.js";
import session from 'express-session';

const app = express();

connectDbB();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/auth", authRoutes);
app.get("/earthquake",  earthquakeRoutes)

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

app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});