import express from 'express';
import {
  getWorkoutSessionsByUserId,
  getWorkoutSessionById,
  createWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
  getExerciseHistory,
  getUserWorkoutStats
} from '../controllers/workoutSessionController.js';

const router = express.Router();

router.get('/user/:userId', getWorkoutSessionsByUserId);
router.get('/user/:userId/stats', getUserWorkoutStats);
router.get('/exercise-history/:userId/:exerciseName', getExerciseHistory);
router.get('/:id', getWorkoutSessionById);
router.post('/', createWorkoutSession);
router.put('/:id', updateWorkoutSession);
router.delete('/:id', deleteWorkoutSession);

export default router;
