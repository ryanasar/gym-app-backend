import express from 'express';
import { getBodyWeightsByUserId, createBodyWeight, deleteBodyWeight } from '../controllers/bodyWeightController.js';

const router = express.Router();

router.get('/user/:userId', getBodyWeightsByUserId);
router.post('/', createBodyWeight);
router.delete('/:id', deleteBodyWeight);

export default router;
