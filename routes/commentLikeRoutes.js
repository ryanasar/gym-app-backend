import express from 'express';
import { toggleCommentLike } from '../controllers/commentLikeController.js';

const router = express.Router();

router.post('/toggle', toggleCommentLike);

export default router;
