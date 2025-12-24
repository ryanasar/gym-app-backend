import prisma from '../prismaClient.js';

export const getWorkoutSessionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const workoutSessions = await prisma.workoutSession.findMany({
      where: { userId: parseInt(userId) },
      include: {
        exercises: {
          include: {
            sets: true,
            template: true
          },
          orderBy: { orderIndex: 'asc' }
        },
        split: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });
    res.json(workoutSessions);
  } catch (error) {
    console.error('Error fetching workout sessions:', error);
    res.status(500).json({ error: 'Failed to fetch workout sessions' });
  }
};

export const getWorkoutSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const workoutSession = await prisma.workoutSession.findUnique({
      where: { id: parseInt(id) },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: 'asc' }
            },
            template: true
          },
          orderBy: { orderIndex: 'asc' }
        },
        split: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    if (!workoutSession) {
      return res.status(404).json({ error: 'Workout session not found' });
    }

    res.json(workoutSession);
  } catch (error) {
    console.error('Error fetching workout session:', error);
    res.status(500).json({ error: 'Failed to fetch workout session' });
  }
};

export const createWorkoutSession = async (req, res) => {
  try {
    const { userId, splitId, dayName, weekNumber, dayNumber, notes, exercises } = req.body;

    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: parseInt(userId),
        splitId: splitId ? parseInt(splitId) : null,
        dayName,
        weekNumber: weekNumber ? parseInt(weekNumber) : null,
        dayNumber: dayNumber ? parseInt(dayNumber) : null,
        completedAt: new Date(),
        notes,
        exercises: {
          create: exercises.map((exercise, index) => ({
            exerciseName: exercise.name,
            exerciseTemplateId: exercise.templateId ? parseInt(exercise.templateId) : null,
            orderIndex: index,
            notes: exercise.notes,
            sets: {
              create: exercise.sets.map(set => ({
                setNumber: set.setNumber,
                weight: set.weight ? parseFloat(set.weight) : null,
                reps: set.reps ? parseInt(set.reps) : null,
                rpe: set.rpe ? parseFloat(set.rpe) : null,
                completed: set.completed || false,
                completedAt: set.completed ? new Date() : null
              }))
            }
          }))
        }
      },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: 'asc' }
            },
            template: true
          },
          orderBy: { orderIndex: 'asc' }
        },
        split: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(workoutSession);
  } catch (error) {
    console.error('Error creating workout session:', error);
    res.status(500).json({ error: 'Failed to create workout session' });
  }
};

export const updateWorkoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const workoutSession = await prisma.workoutSession.update({
      where: { id: parseInt(id) },
      data: { notes },
      include: {
        exercises: {
          include: {
            sets: {
              orderBy: { setNumber: 'asc' }
            },
            template: true
          },
          orderBy: { orderIndex: 'asc' }
        },
        split: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });

    res.json(workoutSession);
  } catch (error) {
    console.error('Error updating workout session:', error);
    res.status(500).json({ error: 'Failed to update workout session' });
  }
};

export const deleteWorkoutSession = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.workoutSession.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Workout session deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout session:', error);
    res.status(500).json({ error: 'Failed to delete workout session' });
  }
};

// Get exercise history for a specific exercise by name
export const getExerciseHistory = async (req, res) => {
  try {
    const { userId, exerciseName } = req.params;

    const exerciseHistory = await prisma.workoutSessionExercise.findMany({
      where: {
        exerciseName: exerciseName,
        workoutSession: {
          userId: parseInt(userId),
          completedAt: { not: null }
        }
      },
      include: {
        sets: {
          where: { completed: true },
          orderBy: { setNumber: 'asc' }
        },
        workoutSession: {
          select: {
            id: true,
            completedAt: true,
            dayName: true
          }
        }
      },
      orderBy: {
        workoutSession: {
          completedAt: 'desc'
        }
      },
      take: 20 // Last 20 sessions with this exercise
    });

    res.json(exerciseHistory);
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    res.status(500).json({ error: 'Failed to fetch exercise history' });
  }
};

// Get workout statistics for a user
export const getUserWorkoutStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const totalSessions = await prisma.workoutSession.count({
      where: {
        userId: parseInt(userId),
        completedAt: { not: null }
      }
    });

    const totalSets = await prisma.workoutSet.count({
      where: {
        exercise: {
          workoutSession: {
            userId: parseInt(userId),
            completedAt: { not: null }
          }
        },
        completed: true
      }
    });

    const recentSessions = await prisma.workoutSession.findMany({
      where: {
        userId: parseInt(userId),
        completedAt: { not: null }
      },
      select: {
        completedAt: true
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 30
    });

    res.json({
      totalSessions,
      totalSets,
      recentSessions: recentSessions.map(s => s.completedAt)
    });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    res.status(500).json({ error: 'Failed to fetch workout stats' });
  }
};
