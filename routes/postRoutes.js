import express from 'express';
import { getPostsByUserId, getPostsByUserIds } from '../controllers/postController.js';

const router = express.Router();

// GET posts for a specific user
router.get('/user/:userId', getPostsByUserId);

// POST posts for multiple users (pass array of userIds in body)
router.post('/multiple', getPostsByUserIds);

export default router;
