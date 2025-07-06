import express from 'express';
import {
  getUserByUsername,
  registerUser,
  updateUserProfile,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser
} from '../controllers/userController.js';

const router = express.Router();

router.get('/:username', getUserByUsername);
router.post('/register', registerUser);
router.put('/:username/profile', updateUserProfile);
router.get('/:username/followers', getUserFollowers);
router.get('/:username/following', getUserFollowing);
router.post('/:username/follow', followUser);
router.delete('/:username/unfollow', unfollowUser);

export default router;
