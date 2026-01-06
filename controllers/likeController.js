import prisma from '../prismaClient.js';

export const getLikesByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const likes = await prisma.like.findMany({
      where: { postId: parseInt(postId) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};

export const getLikesBySplitId = async (req, res) => {
  try {
    const { splitId } = req.params;
    const likes = await prisma.like.findMany({
      where: { splitId: parseInt(splitId) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};

export const getLikesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const likes = await prisma.like.findMany({
      where: { userId: parseInt(userId) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        split: {
          select: {
            id: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    res.json(likes);
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
};

export const createLike = async (req, res) => {
  try {
    // Support both route params and body for postId
    const postId = req.params.postId || req.body.postId;
    const { userId, splitId } = req.body;

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: parseInt(userId),
        OR: [
          { postId: postId ? parseInt(postId) : null },
          { splitId: splitId ? parseInt(splitId) : null }
        ]
      }
    });

    if (existingLike) {
      return res.status(400).json({ error: 'You have already liked this item' });
    }

    const like = await prisma.like.create({
      data: {
        userId: parseInt(userId),
        postId: postId ? parseInt(postId) : null,
        splitId: splitId ? parseInt(splitId) : null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        split: {
          select: {
            id: true
          }
        }
      }
    });

    res.status(201).json(like);
  } catch (error) {
    console.error('Error creating like:', error);
    res.status(500).json({ error: 'Failed to create like' });
  }
};

export const deleteLike = async (req, res) => {
  try {
    const { id, postId, userId } = req.params;

    // Support deletion by id or by postId + userId
    if (id) {
      await prisma.like.delete({
        where: { id: parseInt(id) }
      });
    } else if (postId && userId) {
      const like = await prisma.like.findFirst({
        where: {
          postId: parseInt(postId),
          userId: parseInt(userId)
        }
      });

      if (!like) {
        return res.status(404).json({ error: 'Like not found' });
      }

      await prisma.like.delete({
        where: { id: like.id }
      });
    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    res.json({ message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ error: 'Failed to remove like' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { userId, postId, splitId } = req.body;

    const existingLike = await prisma.like.findFirst({
      where: {
        userId: parseInt(userId),
        OR: [
          { postId: postId ? parseInt(postId) : null },
          { splitId: splitId ? parseInt(splitId) : null }
        ]
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      res.json({ message: 'Like removed successfully', liked: false });
    } else {
      const like = await prisma.like.create({
        data: {
          userId: parseInt(userId),
          postId: postId ? parseInt(postId) : null,
          splitId: splitId ? parseInt(splitId) : null
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true
            }
          },
          post: {
            select: {
              id: true,
              title: true
            }
          },
          workoutPlan: {
            select: {
              id: true
            }
          }
        }
      });
      res.status(201).json({ like, liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};