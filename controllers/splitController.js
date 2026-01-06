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
        comments: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
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
 * GET public splits by userId
 */
export const getPublicSplitsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const splits = await prisma.split.findMany({
      where: {
        userId: parseInt(userId),
        isPublic: true
      },
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
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
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
    res.status(500).json({ error: 'Failed to fetch public splits' });
  }
};

/**
 * POST create a new split
 */
export const createSplit = async (req, res) => {
  const { userId, name, emoji, description, isPublic, numDays, workoutDays } = req.body;

  try {
    // Check if user already has 3 splits
    const existingSplitsCount = await prisma.split.count({
      where: { userId: parseInt(userId) }
    });

    if (existingSplitsCount >= 3) {
      return res.status(400).json({
        error: 'Split limit reached. You can only have 3 splits at once. Please delete one to create a new split.'
      });
    }

    // Validate that each workout day has max 20 exercises
    for (const day of workoutDays) {
      if (day.exercises && Array.isArray(day.exercises) && day.exercises.length > 20) {
        return res.status(400).json({
          error: `Workout "${day.workoutName || 'Unnamed'}" has ${day.exercises.length} exercises. Maximum is 20 exercises per workout.`
        });
      }
    }

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
  const { isPublic, numDays, name, emoji, description } = req.body;

  try {
    const updateData = {};
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (numDays !== undefined) updateData.numDays = numDays;
    if (name !== undefined) updateData.name = name;
    if (emoji !== undefined) updateData.emoji = emoji;
    if (description !== undefined) updateData.description = description;

    const updatedSplit = await prisma.split.update({
      where: { id: parseInt(splitId) },
      data: updateData
    });

    res.json(updatedSplit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update split' });
  }
};

/**
 * PUT update split visibility
 */
export const updateSplitVisibility = async (req, res) => {
  const { splitId } = req.params;
  const { isPublic } = req.body;

  try {
    const updatedSplit = await prisma.split.update({
      where: { id: parseInt(splitId) },
      data: { isPublic }
    });

    res.json(updatedSplit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update split visibility' });
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
