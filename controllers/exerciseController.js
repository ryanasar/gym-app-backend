import prisma from '../prismaClient.js';

export const getExercisesByWorkoutId = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const exercises = await prisma.exercise.findMany({
      where: { workoutId: parseInt(workoutId) },
      include: {
        template: {
          include: {
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        muscles: {
          include: {
            muscle: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
};

export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({
      where: { id: parseInt(id) },
      include: {
        template: {
          include: {
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        muscles: {
          include: {
            muscle: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
};

export const createExercise = async (req, res) => {
  try {
    const { workoutId, exerciseTemplateId, sets, reps, weight, muscles } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        workoutId: parseInt(workoutId),
        exerciseTemplateId: parseInt(exerciseTemplateId),
        sets,
        reps,
        weight,
        muscles: muscles ? {
          create: muscles.map(muscleId => ({
            muscleId: parseInt(muscleId)
          }))
        } : undefined
      },
      include: {
        template: {
          include: {
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        muscles: {
          include: {
            muscle: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });

    res.status(201).json(exercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
};

export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { sets, reps, weight, exerciseTemplateId } = req.body;

    const exercise = await prisma.exercise.update({
      where: { id: parseInt(id) },
      data: {
        sets,
        reps,
        weight,
        ...(exerciseTemplateId && { exerciseTemplateId: parseInt(exerciseTemplateId) })
      },
      include: {
        template: {
          include: {
            muscles: {
              include: {
                muscle: true
              }
            }
          }
        },
        muscles: {
          include: {
            muscle: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        }
      }
    });

    res.json(exercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.exercise.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
};

export const addMuscleToExercise = async (req, res) => {
  try {
    const { exerciseId, muscleId } = req.body;

    const muscleExercise = await prisma.muscleExercise.create({
      data: {
        exerciseId: parseInt(exerciseId),
        muscleId: parseInt(muscleId)
      },
      include: {
        muscle: true,
        exercise: true
      }
    });

    res.status(201).json(muscleExercise);
  } catch (error) {
    console.error('Error adding muscle to exercise:', error);
    res.status(500).json({ error: 'Failed to add muscle to exercise' });
  }
};

export const removeMuscleFromExercise = async (req, res) => {
  try {
    const { exerciseId, muscleId } = req.params;

    await prisma.muscleExercise.delete({
      where: {
        muscleId_exerciseId: {
          muscleId: parseInt(muscleId),
          exerciseId: parseInt(exerciseId)
        }
      }
    });

    res.json({ message: 'Muscle removed from exercise successfully' });
  } catch (error) {
    console.error('Error removing muscle from exercise:', error);
    res.status(500).json({ error: 'Failed to remove muscle from exercise' });
  }
};