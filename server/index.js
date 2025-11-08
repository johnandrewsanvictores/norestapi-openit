import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import testRoutes from './routes/test.js';
import connectDbB from "./config/db.js";

const app = express();

//connectDbB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Specific origin required when using credentials
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/test', testRoutes);

app.get('/', (req, res) => {
    res.json({"msg": "Hello world"});
});

app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
});