import express from "express";
import {
    add_alert_threshold,
    update_alert_threshold,
    get_user_alert_threshold
} from "../controllers/alert_threshold.js";
import auth from "../middleware/auth.js";


const router = express.Router();
router.post('/add', auth, add_alert_threshold);
router.patch('/update', auth, update_alert_threshold);
router.get('/user', auth, get_user_alert_threshold);

export default router;