import express from 'express';
import {
  getSplitsByUserId,
  createSplit,
  updateSplit,
  deleteSplit
} from '../controllers/splitController.js';

const router = express.Router();

router.get('/user/:userId', getSplitsByUserId);
router.post('/', createSplit);
router.put('/:splitId', updateSplit);
router.delete('/:splitId', deleteSplit);

export default router;
