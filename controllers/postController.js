import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get posts for a specific user by user ID
 */
export const getPostsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      include: {
        author: true,
        workout: true,
        workoutPlan: true,
        achievement: true,
        likes: true,
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(posts);
  } catch (error) {
    console.error('Error getting posts by userId:', error);
    res.status(500).json({ error: 'Failed to get posts for this user' });
  }
};

/**
 * Get posts by multiple user IDs
 */
export const getPostsByUserIds = async (req, res) => {
  const { userIds } = req.body; // Expecting userIds as an array in request body

  if (!Array.isArray(userIds)) {
    return res.status(400).json({ error: 'userIds must be an array' });
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: userIds.map(id => parseInt(id)) },
      },
      include: {
        author: true,
        workout: true,
        workoutPlan: true,
        achievement: true,
        likes: true,
        comments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(posts);
  } catch (error) {
    console.error('Error getting posts by userIds:', error);
    res.status(500).json({ error: 'Failed to get posts for these users' });
  }
};
