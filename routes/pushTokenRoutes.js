import express from 'express';
import {
  registerPushToken,
  removePushToken,
  getUserPushTokens
} from '../controllers/pushTokenController.js';

const router = express.Router();

// Register a push token for a user
router.post('/register/:supabaseId', registerPushToken);

// Remove a push token (logout)
router.delete('/remove', removePushToken);

// Get user's push tokens (debug)
router.get('/user/:supabaseId', getUserPushTokens);

export default router;
