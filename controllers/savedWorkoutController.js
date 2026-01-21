import prisma from '../prismaClient.js';

// GET all saved workouts for a user
export const getSavedWorkoutsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const savedWorkouts = await prisma.savedWorkout.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' }
    });

    // Parse exercises JSON for each workout
    const workoutsWithParsedExercises = savedWorkouts.map(workout => ({
      ...workout,
      exercises: workout.exercises ?
        (typeof workout.exercises === 'string' ? JSON.parse(workout.exercises) : workout.exercises)
        : []
    }));

    res.json(workoutsWithParsedExercises);
  } catch (err) {
    console.error('Error fetching saved workouts:', err);
    res.status(500).json({ error: 'Failed to fetch saved workouts' });
  }
};

// GET single saved workout by id
export const getSavedWorkoutById = async (req, res) => {
  const { workoutId } = req.params;

  try {
    const savedWorkout = await prisma.savedWorkout.findUnique({
      where: { id: parseInt(workoutId) }
    });

    if (!savedWorkout) {
      return res.status(404).json({ error: 'Saved workout not found' });
    }

    res.json({
      ...savedWorkout,
      exercises: savedWorkout.exercises ?
        (typeof savedWorkout.exercises === 'string' ? JSON.parse(savedWorkout.exercises) : savedWorkout.exercises)
        : []
    });
  } catch (err) {
    console.error('Error fetching saved workout:', err);
    res.status(500).json({ error: 'Failed to fetch saved workout' });
  }
};

// POST create a new saved workout
export const createSavedWorkout = async (req, res) => {
  const { userId, name, description, emoji, workoutType, exercises } = req.body;

  try {
    // Validate required fields
    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required' });
    }

    // Validate exercise limit (same as WorkoutDay: max 20)
    if (exercises && Array.isArray(exercises) && exercises.length > 20) {
      return res.status(400).json({
        error: `Workout has ${exercises.length} exercises. Maximum is 20 exercises per workout.`
      });
    }

    const savedWorkout = await prisma.savedWorkout.create({
      data: {
        userId: parseInt(userId),
        name,
        description: description || null,
        emoji: emoji || '💪',
        workoutType: workoutType || null,
        exercises: exercises ? JSON.stringify(exercises) : null
      }
    });

    res.status(201).json({
      ...savedWorkout,
      exercises: savedWorkout.exercises ? JSON.parse(savedWorkout.exercises) : []
    });
  } catch (err) {
    console.error('Error creating saved workout:', err);
    res.status(500).json({ error: 'Failed to create saved workout' });
  }
};

// PUT update a saved workout
export const updateSavedWorkout = async (req, res) => {
  const { workoutId } = req.params;
  const { name, description, emoji, workoutType, exercises } = req.body;

  try {
    // Build update data object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (emoji !== undefined) updateData.emoji = emoji;
    if (workoutType !== undefined) updateData.workoutType = workoutType;

    if (exercises !== undefined) {
      // Validate exercise limit
      if (Array.isArray(exercises) && exercises.length > 20) {
        return res.status(400).json({
          error: `Workout has ${exercises.length} exercises. Maximum is 20 exercises per workout.`
        });
      }
      updateData.exercises = JSON.stringify(exercises);
    }

    const savedWorkout = await prisma.savedWorkout.update({
      where: { id: parseInt(workoutId) },
      data: updateData
    });

    res.json({
      ...savedWorkout,
      exercises: savedWorkout.exercises ?
        (typeof savedWorkout.exercises === 'string' ? JSON.parse(savedWorkout.exercises) : savedWorkout.exercises)
        : []
    });
  } catch (err) {
    console.error('Error updating saved workout:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Saved workout not found' });
    }
    res.status(500).json({ error: 'Failed to update saved workout' });
  }
};

// DELETE a saved workout
export const deleteSavedWorkout = async (req, res) => {
  const { workoutId } = req.params;

  try {
    await prisma.savedWorkout.delete({
      where: { id: parseInt(workoutId) }
    });

    res.json({ message: 'Saved workout deleted successfully' });
  } catch (err) {
    console.error('Error deleting saved workout:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Saved workout not found' });
    }
    res.status(500).json({ error: 'Failed to delete saved workout' });
  }
};
