import express from 'express';
import {
    createSimulatedEarthquake,
    getSimulatedEarthquakes,
    deleteSimulatedEarthquake,
    deleteAllSimulatedEarthquakes
} from '../controllers/simulated_earthquake.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createSimulatedEarthquake);

router.get('/', auth, getSimulatedEarthquakes);

router.delete('/:id', auth, deleteSimulatedEarthquake);

router.delete('/', auth, deleteAllSimulatedEarthquakes);

export default router;

