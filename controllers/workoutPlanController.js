import prisma from '../prismaClient.js';

/**
 * GET workout plans by userId
 */
export const getWorkoutPlansByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workoutDays: {
          include: {
            workout: {
              include: {
                exercises: true
              }
            }
          }
        },
        likes: true,
        comments: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    if (!plans || plans.length === 0) {
      return res.status(404).json({ error: 'No workout plans found for this user' });
    }

    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch workout plans' });
  }
};

/**
 * POST create a new workout plan
 */
export const createWorkoutPlan = async (req, res) => {
  const { userId, isPublic, numDays, workoutDays } = req.body;

  try {
    const newPlan = await prisma.workoutPlan.create({
      data: {
        userId,
        isPublic,
        numDays,
        workoutDays: {
          create: workoutDays.map(day => ({
            dayIndex: day.dayIndex,
            isRest: day.isRest,
            workoutId: day.workoutId || null
          }))
        }
      },
      include: {
        workoutDays: true
      }
    });

    res.status(201).json(newPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create workout plan' });
  }
};

/**
 * PUT update workout plan
 */
export const updateWorkoutPlan = async (req, res) => {
  const { planId } = req.params;
  const { isPublic, numDays } = req.body;

  try {
    const updatedPlan = await prisma.workoutPlan.update({
      where: { id: parseInt(planId) },
      data: {
        isPublic,
        numDays
      }
    });

    res.json(updatedPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update workout plan' });
  }
};

/**
 * DELETE workout plan
 */
export const deleteWorkoutPlan = async (req, res) => {
  const { planId } = req.params;

  try {
    await prisma.workoutPlan.delete({
      where: { id: parseInt(planId) }
    });

    res.json({ message: 'Workout plan deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete workout plan' });
  }
};
