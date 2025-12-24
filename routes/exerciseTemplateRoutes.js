import express from 'express';
import {
  getAllExerciseTemplates,
  getExerciseTemplateById,
  createExerciseTemplate,
  updateExerciseTemplate,
  deleteExerciseTemplate,
  addMuscleToTemplate,
  removeMuscleFromTemplate
} from '../controllers/exerciseTemplateController.js';

const router = express.Router();

router.get('/', getAllExerciseTemplates);
router.get('/:id', getExerciseTemplateById);
router.post('/', createExerciseTemplate);
router.put('/:id', updateExerciseTemplate);
router.delete('/:id', deleteExerciseTemplate);
router.post('/muscle', addMuscleToTemplate);
router.delete('/:templateId/muscle/:muscleId', removeMuscleFromTemplate);

export default router;