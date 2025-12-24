import express from 'express';
import {
  getLikesByPostId,
  getLikesBySplitId,
  getLikesByUserId,
  createLike,
  deleteLike,
  toggleLike
} from '../controllers/likeController.js';

const router = express.Router();

router.get('/post/:postId', getLikesByPostId);
router.get('/split/:splitId', getLikesBySplitId);
router.get('/user/:userId', getLikesByUserId);
router.post('/', createLike);
router.delete('/:id', deleteLike);
router.post('/toggle', toggleLike);

export default router;