import express from 'express';
import {
  getEvacuationCenters,
  getAllEvacuationCenters,
  getEvacuationCenter,
  createEvacuationCenter,
  updateEvacuationCenter,
  deleteEvacuationCenter
} from '../controllers/evacuation_center.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getEvacuationCenters);
router.get('/:id', getEvacuationCenter);

// Admin routes (require authentication)
router.get('/admin/all', auth, getAllEvacuationCenters);
router.post('/', auth, createEvacuationCenter);
router.put('/:id', auth, updateEvacuationCenter);
router.delete('/:id', auth, deleteEvacuationCenter);

export default router;

