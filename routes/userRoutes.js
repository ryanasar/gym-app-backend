import express from 'express';
import {
  getOrCreateUserBySupabaseId,
  getUserByUsername,
  updateUserAndCreateProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  completeOnboarding,
  checkUsernameAvailability,
  searchUsers
} from '../controllers/userController.js';

const router = express.Router();

router.get('/search', searchUsers);
router.get('/check-username/:username', checkUsernameAvailability);
router.post('/auth/:supabaseId', getOrCreateUserBySupabaseId);
router.get('/:username', getUserByUsername);
router.put('/create-profile/:supabaseId', updateUserAndCreateProfile);
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);
router.post('/:username/follow', followUser);
router.delete('/:username/unfollow', unfollowUser);
router.put('/complete-onboarding/:supabaseId', completeOnboarding);

export default router;
