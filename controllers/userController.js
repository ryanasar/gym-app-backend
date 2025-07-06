// controllers/userController.js

import prisma from '../prismaClient.js';

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
          followedBy: { select: { followedById: true } },
          following: { select: { followingId: true } }
        }
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const workoutCount = user.workouts?.length || 0;
      const followerCount = user.followedBy?.length || 0;
      const followingCount = user.following?.length || 0;
  
      res.json({
        ...user,
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
 * POST newly registered user
 */
export const registerUser = async (req, res) => {
  const { email, username, name } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: { email, username, name }
    });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * PUT profile edits
 */
export const updateUserProfile = async (req, res) => {
  const { username } = req.params;
  const { bio, isPrivate } = req.body;

  try {
    const user = await prisma.user.update({
      where: { username },
      data: {
        Profile: {
          upsert: {
            create: { bio, isPrivate },
            update: { bio, isPrivate }
          }
        }
      },
      include: { Profile: true }
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
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
