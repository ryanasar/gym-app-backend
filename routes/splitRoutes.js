import express from 'express';
import {
  getSplitsByUserId,
  getPublicSplitsByUserId,
  createSplit,
  updateSplit,
  updateSplitVisibility,
  deleteSplit
} from '../controllers/splitController.js';

const router = express.Router();

// More specific routes must come first
router.get('/user/:userId/public', getPublicSplitsByUserId);
router.get('/user/:userId', getSplitsByUserId);
router.post('/', createSplit);
router.put('/:splitId/visibility', updateSplitVisibility);
router.put('/:splitId', updateSplit);
router.delete('/:splitId', deleteSplit);

export default router;
