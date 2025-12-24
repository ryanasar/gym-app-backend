import prisma from '../prismaClient.js';

export const getAchievementsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await prisma.achievement.findMany({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true
          }
        },
        posts: {
          select: {
            id: true,
            title: true,
            description: true,
            published: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};

export const getAchievementById = async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await prisma.achievement.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true,
            exercises: {
              select: {
                id: true,
                name: true,
                sets: true,
                reps: true,
                weight: true
              }
            }
          }
        },
        posts: {
          select: {
            id: true,
            title: true,
            description: true,
            published: true
          }
        }
      }
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({ error: 'Failed to fetch achievement' });
  }
};

export const createAchievement = async (req, res) => {
  try {
    const { userId, workoutId } = req.body;

    const achievement = await prisma.achievement.create({
      data: {
        userId: parseInt(userId),
        workoutId: workoutId ? parseInt(workoutId) : null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
};

export const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.achievement.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
};

export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching all achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};