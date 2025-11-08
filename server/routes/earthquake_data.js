import express from "express";
import {
    getPhilippinesEarthquakeData
} from "../controllers/earthquake_data.js";

const router = express.Router();

router.get('/philippines', getPhilippinesEarthquakeData);

export default router;
