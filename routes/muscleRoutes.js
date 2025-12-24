import express from 'express';
import {
  getAllMuscles,
  getMuscleById,
  createMuscle,
  updateMuscle,
  deleteMuscle
} from '../controllers/muscleController.js';

const router = express.Router();

router.get('/', getAllMuscles);
router.get('/:id', getMuscleById);
router.post('/', createMuscle);
router.put('/:id', updateMuscle);
router.delete('/:id', deleteMuscle);

export default router;