import express from 'express';
import { reverseGeocode } from '../controllers/geocoding.js';

const router = express.Router();

router.get('/reverse-geocode', reverseGeocode);

export default router;

