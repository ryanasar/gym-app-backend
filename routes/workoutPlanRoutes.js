import express from 'express';
import {
  getWorkoutPlansByUserId,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan
} from '../controllers/workoutPlanController.js';

const router = express.Router();

router.get('/user/:userId', getWorkoutPlansByUserId);
router.post('/', createWorkoutPlan);
router.put('/:planId', updateWorkoutPlan);
router.delete('/:planId', deleteWorkoutPlan);

export default router;
