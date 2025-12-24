import prisma from '../prismaClient.js';

/**
 * GET splits by userId
 */
export const getSplitsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const splits = await prisma.split.findMany({
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
          orderBy: {
            dayIndex: 'asc'
          },
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
        createdAt: 'desc'
      }
    });

    const splitsWithParsedExercises = splits.map(split => ({
      ...split,
      workoutDays: split.workoutDays.map(day => ({
        ...day,
        exercises: day.exercises ? JSON.parse(day.exercises) : null
      }))
    }));

    res.json(splitsWithParsedExercises);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch splits' });
  }
};

/**
 * POST create a new split
 */
export const createSplit = async (req, res) => {
  const { userId, name, emoji, description, isPublic, numDays, workoutDays } = req.body;

  try {
    const newSplit = await prisma.split.create({
      data: {
        userId,
        name,
        emoji,
        description,
        isPublic,
        numDays,
        workoutDays: {
          create: workoutDays.map(day => ({
            dayIndex: day.dayIndex,
            workoutName: day.workoutName,
            workoutDescription: day.workoutDescription,
            workoutType: day.workoutType,
            emoji: day.emoji,
            isRest: day.isRest,
            exercises: day.exercises ? JSON.stringify(day.exercises) : null,
            workoutId: day.workoutId || null
          }))
        }
      },
      include: {
        workoutDays: {
          orderBy: {
            dayIndex: 'asc'
          }
        }
      }
    });

    res.status(201).json(newSplit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create split' });
  }
};

/**
 * PUT update split
 */
export const updateSplit = async (req, res) => {
  const { splitId } = req.params;
  const { isPublic, numDays } = req.body;

  try {
    const updatedSplit = await prisma.split.update({
      where: { id: parseInt(splitId) },
      data: {
        isPublic,
        numDays
      }
    });

    res.json(updatedSplit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update split' });
  }
};

/**
 * DELETE split
 */
export const deleteSplit = async (req, res) => {
  const { splitId } = req.params;

  try {
    await prisma.split.delete({
      where: { id: parseInt(splitId) }
    });

    res.json({ message: 'Split deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete split' });
  }
};
