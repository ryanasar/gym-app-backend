import express from 'express';
import {
  getCommentsByPostId,
  getCommentsBySplitId,
  getCommentsByUserId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

router.get('/post/:postId', getCommentsByPostId);
router.get('/split/:splitId', getCommentsBySplitId);
router.get('/user/:userId', getCommentsByUserId);
router.get('/:id', getCommentById);
router.post('/', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;