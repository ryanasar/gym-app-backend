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
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
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
        likes: {
          select: {
            userId: true,
          }
        },
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
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

    // Transform taggedUsers to flatten the structure
    const transformedPosts = posts.map(post => ({
      ...post,
      taggedUsers: post.taggedUsers.map(tag => tag.user)
    }));

    res.json(transformedPosts);
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
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
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
        likes: {
          select: {
            userId: true,
          }
        },
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
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

    // Transform taggedUsers to flatten the structure
    const transformedPosts = posts.map(post => ({
      ...post,
      taggedUsers: post.taggedUsers.map(tag => tag.user)
    }));

    res.json(transformedPosts);
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
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
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
        likes: {
          select: {
            userId: true,
          }
        },
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
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

    // Transform taggedUsers to flatten the structure
    const transformedPosts = posts.map(post => ({
      ...post,
      taggedUsers: post.taggedUsers.map(tag => tag.user)
    }));

    res.json(transformedPosts);
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
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
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
        likes: {
          select: {
            userId: true,
          }
        },
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
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

    // Transform taggedUsers to flatten the structure
    const transformedPost = {
      ...post,
      taggedUsers: post.taggedUsers.map(tag => tag.user)
    };

    res.json(transformedPost);
  } catch (error) {
    console.error('Error getting post by ID:', error);
    res.status(500).json({ error: 'Failed to get post' });
  }
};

/**
 * CREATE post
 */
export const createPost = async (req, res) => {
  const { title, description, imageUrl, published, authorId, workoutId, workoutSessionId, splitId, achievementId, streak, taggedUserIds } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        description,
        imageUrl,
        published: published || false,
        authorId: parseInt(authorId),
        workoutId: workoutId ? parseInt(workoutId) : null,
        workoutSessionId: workoutSessionId ? parseInt(workoutSessionId) : null,
        splitId: splitId ? parseInt(splitId) : null,
        achievementId: achievementId ? parseInt(achievementId) : null,
        streak: streak ? parseInt(streak) : null,
        taggedUsers: taggedUserIds && taggedUserIds.length > 0 ? {
          create: taggedUserIds.map(userId => ({
            userId: parseInt(userId)
          }))
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
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
        likes: {
          select: {
            userId: true,
          }
        },
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
      },
    });

    // Transform taggedUsers to flatten the structure
    const transformedPost = {
      ...post,
      taggedUsers: post.taggedUsers.map(tag => tag.user)
    };

    res.status(201).json(transformedPost);
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
  const { title, description, imageUrl, published } = req.body;

  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        imageUrl,
        published,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
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
        likes: {
          select: {
            userId: true,
          }
        },
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        },
      },
    });

    // Transform taggedUsers to flatten the structure
    const transformedPost = {
      ...post,
      taggedUsers: post.taggedUsers.map(tag => tag.user)
    };

    res.json(transformedPost);
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
    // First, fetch the post to get the imageUrl
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      select: { imageUrl: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete the post from database
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    // If post had an image, delete it from Supabase storage
    if (post.imageUrl) {
      try {
        // Extract the file path from the imageUrl
        // URL format: https://[project-id].supabase.co/storage/v1/object/public/images/posts/filename.jpg
        // We need to extract: posts/filename.jpg
        const urlParts = post.imageUrl.split('/images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];

          // Delete from Supabase storage
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY // Use service key for admin operations
          );

          const { error: deleteError } = await supabase.storage
            .from('images')
            .remove([filePath]);

          if (deleteError) {
            console.error('Error deleting image from storage:', deleteError);
            // Don't fail the whole operation if image deletion fails
          }
        }
      } catch (storageError) {
        console.error('Error deleting image from storage:', storageError);
        // Don't fail the whole operation if image deletion fails
      }
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

/**
 * GET posts from users that the current user is following (with pagination)
 */
export const getFollowingPosts = async (req, res) => {
  const { userId } = req.params;
  const { cursor, limit = 10 } = req.query;

  try {
    // Get the list of users that this user is following
    // Note: Schema inversion - followedBy contains users this user is following
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        followedBy: {
          select: {
            followingId: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the IDs of followed users (schema is inverted)
    const followedUserIds = user.followedBy.map(f => f.followingId);

    // Include the current user's own posts in the feed
    const userIdsToShow = [...followedUserIds, parseInt(userId)];

    // If not following anyone and not including self, return empty array
    if (userIdsToShow.length === 0) {
      return res.json({ posts: [], nextCursor: null, hasMore: false });
    }

    // Build query options
    const queryOptions = {
      where: {
        authorId: { in: userIdsToShow },
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                isVerified: true
              }
            }
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
        likes: {
          select: {
            userId: true,
          }
        },
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    avatarUrl: true
                  }
                }
              }
            }
          }
        },
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
      take: parseInt(limit) + 1, // Fetch one extra to determine if there are more
    };

    // Add cursor if provided
    if (cursor) {
      queryOptions.cursor = {
        id: parseInt(cursor)
      };
      queryOptions.skip = 1; // Skip the cursor
    }

    // Fetch posts from followed users
    const posts = await prisma.post.findMany(queryOptions);

    // Check if there are more posts
    const hasMore = posts.length > parseInt(limit);
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? postsToReturn[postsToReturn.length - 1].id : null;

    // Transform taggedUsers to flatten the structure
    const transformedPosts = postsToReturn.map(post => ({
      ...post,
      taggedUsers: post.taggedUsers.map(tag => tag.user)
    }));

    res.json({
      posts: transformedPosts,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error('Error getting following posts:', error);
    res.status(500).json({ error: 'Failed to get following posts' });
  }
};