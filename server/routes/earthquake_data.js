import express from "express";
import {
    getPhilippinesEarthquakeData
} from "../controllers/earthquake_data.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get('/philippines', auth, getPhilippinesEarthquakeData);

export default router;
