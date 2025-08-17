import express from 'express';
import {
  getProfileByUserId,
  getProfileByUsername,
  createProfile,
  updateProfile,
  deleteProfile,
  getPublicProfiles
} from '../controllers/profileController.js';

const router = express.Router();

// Get all public profiles (with optional search and pagination)
router.get('/public', getPublicProfiles);

// Get profile by username
router.get('/username/:username', getProfileByUsername);

// Get profile by user ID
router.get('/user/:userId', getProfileByUserId);

// Create a new profile
router.post('/', createProfile);

// Update profile by user ID
router.put('/user/:userId', updateProfile);

// Delete profile by user ID
router.delete('/user/:userId', deleteProfile);

export default router;