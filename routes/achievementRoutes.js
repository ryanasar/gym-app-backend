import express from 'express';
import {
  getAchievementsByUserId,
  getAchievementById,
  createAchievement,
  deleteAchievement,
  getAllAchievements
} from '../controllers/achievementController.js';

const router = express.Router();

router.get('/', getAllAchievements);
router.get('/user/:userId', getAchievementsByUserId);
router.get('/:id', getAchievementById);
router.post('/', createAchievement);
router.delete('/:id', deleteAchievement);

export default router;