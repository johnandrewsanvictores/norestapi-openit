import express from "express";
import {
    getPhilippinesEarthquakeData
} from "../controllers/earthquake_data.js";
import { notifyUsersInRange } from "../controllers/earthquake_notification.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get('/philippines', getPhilippinesEarthquakeData);
router.post('/notify-users', auth, notifyUsersInRange);

export default router;
