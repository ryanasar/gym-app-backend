// controllers/userController.js

import prisma from '../prismaClient.js';


export const getOrCreateUserBySupabaseId = async (req, res) => {
    const { supabaseId } = req.params;
    const { email }  = req.body;
    
    try {
      const user = await prisma.user.findUnique({
        where: { supabaseId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            supabaseId,
            email,
          },
        });
      }
      
      
      res.json(user);
    } catch (err) {
      console.error('[getOrCreateUserBySupabaseId]', err);
      res.status(500).json({ error: 'Failed to get or create user' });
    }
  };
  

/**
 * GET user by username
 */
export const getUserByUsername = async (req, res) => {
    const { username } = req.params;

    try {
      const user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          workouts: { select: { id: true } },
          profile: {
            select: {
              bio: true,
              isPrivate: true
            }
          },
          // Note: The relation names in the schema are inverted
          // followedBy = users this user is following (followedById = this user)
          // following = users following this user (followingId = this user)
          followedBy: { select: { followingId: true } }, // Users this user is following
          following: { select: { followedById: true } }  // Users following this user
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const workoutCount = user.workouts?.length || 0;
      // following contains the users following this user (followers)
      const followerCount = user.following?.length || 0;
      // followedBy contains the users this user is following
      const followingCount = user.followedBy?.length || 0;

      res.json({
        ...user,
        // Return with corrected field names for clarity
        followedBy: user.following, // Users following this user
        following: user.followedBy, // Users this user is following
        workoutCount,
        followerCount,
        followingCount
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
};

/**
 * PUT profile edits
 */
export const updateUserAndCreateProfile = async (req, res) => {
  const { supabaseId } = req.params;
  const { name, username } = req.body;

  try {
    const user = await prisma.user.update({
      where: {
        supabaseId: supabaseId
      },
      data: {
        name: name,
        username: username,
      },
    });

    // Create profile if it doesn't exist
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id }
    });

    if (!existingProfile) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          bio: '',
          isPrivate: false
        }
      });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};  

/**
 * GET user's followers
 */
export const getUserFollowers = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        followedBy: {
          include: { followedBy: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.followedBy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
};

/**
 * GET user's following
 */
export const getUserFollowing = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        following: {
          include: { following: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
};

/**
 * POST follow user
 */
export const followUser = async (req, res) => {
  const { username } = req.params;
  const { followerId } = req.body;

  try {
    const userToFollow = await prisma.user.findUnique({ where: { username } });

    if (!userToFollow) {
      return res.status(404).json({ error: 'User to follow not found' });
    }

    // Check if already following
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followingId_followedById: {
          followingId: userToFollow.id,
          followedById: followerId
        }
      }
    });

    // If already following, return success (idempotent operation)
    if (existingFollow) {
      return res.json({ message: 'Already following', alreadyFollowing: true });
    }

    await prisma.follows.create({
      data: {
        followingId: userToFollow.id,
        followedById: followerId
      }
    });

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

/**
 * DELETE unfollow user
 */
export const unfollowUser = async (req, res) => {
  const { username } = req.params;
  const { followerId } = req.body;

  try {
    const userToUnfollow = await prisma.user.findUnique({ where: { username } });

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User to unfollow not found' });
    }

    // Check if follow relationship exists
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followingId_followedById: {
          followingId: userToUnfollow.id,
          followedById: followerId
        }
      }
    });

    // If not following, return success (idempotent operation)
    if (!existingFollow) {
      return res.json({ message: 'Not following', wasNotFollowing: true });
    }

    await prisma.follows.delete({
      where: {
        followingId_followedById: {
          followingId: userToUnfollow.id,
          followedById: followerId
        }
      }
    });

    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

/**
 * GET followers list for a user
 */
export const getFollowers = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        // following relation contains users who are following this user (followers)
        following: {
          select: {
            followedBy: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    bio: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract followers from the relation
    const followers = user.following.map(f => f.followedBy);

    res.json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
};

/**
 * GET following list for a user
 */
export const getFollowing = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        // followedBy relation contains users this user is following
        followedBy: {
          select: {
            following: {
              select: {
                id: true,
                username: true,
                name: true,
                profile: {
                  select: {
                    bio: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract following from the relation
    const following = user.followedBy.map(f => f.following);

    res.json(following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
};

export const checkUsernameAvailability = async (req, res) => {
    const { username} = req.params;
  
    try {
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });
  
      res.json({ 
        available: !existingUser,
        username: username.toLowerCase()
      });
    } catch (err) {
      console.error('Error checking username availability:', err);
      res.status(500).json({ 
        error: 'Failed to check username availability',
        available: false 
      });
    }
  };

export const completeOnboarding = async (req, res) => {
    const { supabaseId } = req.params;

    try {
      const user = await prisma.user.update({
        where: { supabaseId: supabaseId },
        data: { hasCompletedOnboarding: true },
      });

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  };

/**
 * GET search users by username or name
 */
export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const { currentUserId } = req.query;

  if (!query || query.trim() === '') {
    return res.json([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ],
        hasCompletedOnboarding: true
      },
      select: {
        id: true,
        username: true,
        name: true,
        profile: {
          select: {
            bio: true,
            isPrivate: true
          }
        },
        _count: {
          select: {
            followedBy: true,
            following: true,
            posts: true
          }
        }
      },
      take: 20
    });

    // If currentUserId is provided, check if the current user follows each result
    if (currentUserId) {
      const usersWithFollowStatus = await Promise.all(
        users.map(async (user) => {
          const isFollowing = await prisma.follows.findUnique({
            where: {
              followingId_followedById: {
                followingId: user.id,
                followedById: parseInt(currentUserId)
              }
            }
          });

          return {
            ...user,
            isFollowing: !!isFollowing
          };
        })
      );

      return res.json(usersWithFollowStatus);
    }

    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
};
  