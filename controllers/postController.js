// controllers/postController.js

import prisma from '../prismaClient.js';

/**
 * GET posts for a specific user by user ID
 */
export const getPostsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      include: {
        author: true,
        workout: true,
        workoutSession: {
          include: {
            exercises: {
              include: {
                sets: true
              }
            }
          }
        },
        split: true,
        achievement: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
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
 * POST get posts by multiple user IDs
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
        workoutSession: {
          include: {
            exercises: {
              include: {
                sets: true
              }
            }
          }
        },
        split: true,
        achievement: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
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

/**
 * GET all posts
 */
export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: true,
        workoutSession: {
          include: {
            exercises: {
              include: {
                sets: true
              }
            }
          }
        },
        split: true,
        achievement: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(posts);
  } catch (error) {
    console.error('Error getting all posts:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
};

/**
 * GET post by ID
 */
export const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: true,
        workoutSession: {
          include: {
            exercises: {
              include: {
                sets: true
              }
            }
          }
        },
        split: true,
        achievement: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error getting post by ID:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
};

/**
 * CREATE post
 */
export const createPost = async (req, res) => {
  const { title, description, published, authorId, workoutId, workoutSessionId, splitId, achievementId } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        description,
        published: published || false,
        authorId: parseInt(authorId),
        workoutId: workoutId ? parseInt(workoutId) : null,
        workoutSessionId: workoutSessionId ? parseInt(workoutSessionId) : null,
        splitId: splitId ? parseInt(splitId) : null,
        achievementId: achievementId ? parseInt(achievementId) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: true,
        workoutSession: {
          include: {
            exercises: {
              include: {
                sets: true
              }
            }
          }
        },
        split: true,
        achievement: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

/**
 * UPDATE post
 */
export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, description, published } = req.body;

  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        published,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        workout: true,
        workoutSession: {
          include: {
            exercises: {
              include: {
                sets: true
              }
            }
          }
        },
        split: true,
        achievement: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
      },
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

/**
 * DELETE post
 */
export const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};