import express from 'express';
import {
  getExercisesByWorkoutId,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  addMuscleToExercise,
  removeMuscleFromExercise
} from '../controllers/exerciseController.js';

const router = express.Router();

router.get('/workout/:workoutId', getExercisesByWorkoutId);
router.get('/:id', getExerciseById);
router.post('/', createExercise);
router.put('/:id', updateExercise);
router.delete('/:id', deleteExercise);
router.post('/muscle', addMuscleToExercise);
router.delete('/:exerciseId/muscle/:muscleId', removeMuscleFromExercise);

export default router;