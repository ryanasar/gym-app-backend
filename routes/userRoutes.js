import express from 'express';
import {
  getOrCreateUserBySupabaseId,
  getUserByUsername,
  updateUserAndCreateProfile,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
  completeOnboarding,
  checkUsernameAvailability
} from '../controllers/userController.js';

const router = express.Router();

router.get('/check-username/:username', checkUsernameAvailability)
router.post('/auth/:supabaseId', getOrCreateUserBySupabaseId)
router.get('/:username', getUserByUsername);
router.put('/create-profile/:supabaseId', updateUserAndCreateProfile);
router.get('/:username/followers', getUserFollowers);
router.get('/:username/following', getUserFollowing);
router.post('/:username/follow', followUser);
router.delete('/:username/unfollow', unfollowUser);
router.put('/complete-onboarding/:supabaseId', completeOnboarding)

export default router;
