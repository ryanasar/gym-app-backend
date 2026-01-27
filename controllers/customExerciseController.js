import prisma from '../prismaClient.js';

// GET all custom exercises for a user
export const getUserCustomExercises = async (req, res) => {
  const { userId } = req.params;

  try {
    const exercises = await prisma.customExercise.findMany({
      where: { creatorUserId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });

    res.json(exercises);
  } catch (err) {
    console.error('Error fetching custom exercises:', err);
    res.status(500).json({ error: 'Failed to fetch custom exercises' });
  }
};

// GET single custom exercise by id
export const getCustomExerciseById = async (req, res) => {
  const { id } = req.params;

  try {
    const exercise = await prisma.customExercise.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Custom exercise not found' });
    }

    res.json(exercise);
  } catch (err) {
    console.error('Error fetching custom exercise:', err);
    res.status(500).json({ error: 'Failed to fetch custom exercise' });
  }
};

// POST batch lookup by IDs
export const getCustomExercisesByIds = async (req, res) => {
  const { ids } = req.body;

  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const exercises = await prisma.customExercise.findMany({
      where: { id: { in: ids.map(id => parseInt(id)) } }
    });

    res.json(exercises);
  } catch (err) {
    console.error('Error fetching custom exercises by IDs:', err);
    res.status(500).json({ error: 'Failed to fetch custom exercises' });
  }
};

// POST create a new custom exercise
export const createCustomExercise = async (req, res) => {
  const { userId, name, category, primaryMuscles, secondaryMuscles, equipment, difficulty } = req.body;

  try {
    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required' });
    }

    const exercise = await prisma.customExercise.create({
      data: {
        creatorUserId: parseInt(userId),
        name: name.trim(),
        category: category || null,
        primaryMuscles: primaryMuscles || [],
        secondaryMuscles: secondaryMuscles || [],
        equipment: equipment || null,
        difficulty: difficulty || null,
      }
    });

    res.status(201).json(exercise);
  } catch (err) {
    console.error('Error creating custom exercise:', err);
    res.status(500).json({ error: 'Failed to create custom exercise' });
  }
};

// PUT update a custom exercise
export const updateCustomExercise = async (req, res) => {
  const { id } = req.params;
  const { name, category, primaryMuscles, secondaryMuscles, equipment, difficulty } = req.body;

  try {
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category;
    if (primaryMuscles !== undefined) updateData.primaryMuscles = primaryMuscles;
    if (secondaryMuscles !== undefined) updateData.secondaryMuscles = secondaryMuscles;
    if (equipment !== undefined) updateData.equipment = equipment;
    if (difficulty !== undefined) updateData.difficulty = difficulty;

    const exercise = await prisma.customExercise.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(exercise);
  } catch (err) {
    console.error('Error updating custom exercise:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Custom exercise not found' });
    }
    res.status(500).json({ error: 'Failed to update custom exercise' });
  }
};

// DELETE a custom exercise
export const deleteCustomExercise = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.customExercise.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Custom exercise deleted successfully' });
  } catch (err) {
    console.error('Error deleting custom exercise:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Custom exercise not found' });
    }
    res.status(500).json({ error: 'Failed to delete custom exercise' });
  }
};

// POST copy custom exercises for a target user
export const copyCustomExercises = async (req, res) => {
  const { sourceExerciseIds, targetUserId } = req.body;

  try {
    if (!sourceExerciseIds || !Array.isArray(sourceExerciseIds) || sourceExerciseIds.length === 0) {
      return res.status(400).json({ error: 'sourceExerciseIds array is required' });
    }
    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }

    // Fetch source exercises
    const sourceExercises = await prisma.customExercise.findMany({
      where: { id: { in: sourceExerciseIds.map(id => parseInt(id)) } }
    });

    if (sourceExercises.length === 0) {
      return res.status(404).json({ error: 'No source exercises found' });
    }

    // Create copies for the target user
    const idMapping = {};
    const newExercises = [];

    for (const source of sourceExercises) {
      const copy = await prisma.customExercise.create({
        data: {
          creatorUserId: parseInt(targetUserId),
          name: source.name,
          category: source.category,
          primaryMuscles: source.primaryMuscles,
          secondaryMuscles: source.secondaryMuscles,
          equipment: source.equipment,
          difficulty: source.difficulty,
        }
      });

      idMapping[source.id] = copy.id;
      newExercises.push(copy);
    }

    res.status(201).json({ idMapping, exercises: newExercises });
  } catch (err) {
    console.error('Error copying custom exercises:', err);
    res.status(500).json({ error: 'Failed to copy custom exercises' });
  }
};
