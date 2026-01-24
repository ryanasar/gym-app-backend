import express from 'express';
import { handleNotificationCreated } from '../controllers/notificationWebhookController.js';

const router = express.Router();

// Supabase webhook for new notifications
router.post('/notification-created', handleNotificationCreated);

export default router;
