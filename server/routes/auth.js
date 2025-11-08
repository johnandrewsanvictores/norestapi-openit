import express from "express";
import {
    createUser, getSpecificUser,
    getUser, getUserProfile,
    logout,
    signIn,
    validateUserInfo,
    getPhilippinesEarthquakeData
} from "../controllers/auth.js";
import auth from "../middleware/auth.js";


const router = express.Router();
router.get('/philippines', getPhilippinesEarthquakeData);
router.get("/me", getUser);
router.post("/logout", logout);
router.post("/signin", signIn);
router.post("/signup", validateUserInfo, createUser);
router.get('/user/profile', auth, getUserProfile);
router.get('/specificUser', auth, getSpecificUser);

export default router;