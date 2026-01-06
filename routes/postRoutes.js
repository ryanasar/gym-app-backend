import express from 'express';
import {
  getPostsByUserId,
  getPostsByUserIds,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getFollowingPosts
} from '../controllers/postController.js';
import {
  createLike,
  deleteLike
} from '../controllers/likeController.js';
import {
  getCommentsByPostId,
  createComment
} from '../controllers/commentController.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/following/:userId', getFollowingPosts);
router.get('/user/:userId', getPostsByUserId);
router.post('/multiple', getPostsByUserIds);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);

// Like routes for posts
router.post('/:postId/like', createLike);
router.delete('/:postId/like/:userId', deleteLike);

// Comment routes for posts
router.get('/:postId/comments', getCommentsByPostId);
router.post('/:postId/comments', createComment);

export default router;
