import express from 'express';
import {
  getSavedWorkoutsByUserId,
  getSavedWorkoutById,
  createSavedWorkout,
  updateSavedWorkout,
  deleteSavedWorkout
} from '../controllers/savedWorkoutController.js';

const router = express.Router();

// GET all saved workouts for a user
router.get('/user/:userId', getSavedWorkoutsByUserId);

// GET single saved workout by id
router.get('/:workoutId', getSavedWorkoutById);

// POST create a new saved workout
router.post('/', createSavedWorkout);

// PUT update a saved workout
router.put('/:workoutId', updateSavedWorkout);

// DELETE a saved workout
router.delete('/:workoutId', deleteSavedWorkout);

export default router;
