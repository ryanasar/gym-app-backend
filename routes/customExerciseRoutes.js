import express from 'express';
import {
  getUserCustomExercises,
  getCustomExerciseById,
  getCustomExercisesByIds,
  createCustomExercise,
  updateCustomExercise,
  deleteCustomExercise,
  copyCustomExercises
} from '../controllers/customExerciseController.js';

const router = express.Router();

// GET all custom exercises for a user
router.get('/user/:userId', getUserCustomExercises);

// POST batch lookup by IDs
router.post('/batch', getCustomExercisesByIds);

// POST copy custom exercises for a target user
router.post('/copy', copyCustomExercises);

// GET single custom exercise by id
router.get('/:id', getCustomExerciseById);

// POST create a new custom exercise
router.post('/', createCustomExercise);

// PUT update a custom exercise
router.put('/:id', updateCustomExercise);

// DELETE a custom exercise
router.delete('/:id', deleteCustomExercise);

export default router;
