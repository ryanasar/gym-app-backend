// controllers/profileController.js

import prisma from '../prismaClient.js';

/**
 * GET user profile by user ID
 */
export const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            createdAt: true,
            _count: {
              select: {
                workouts: true,
                splits: true,
                // Note: The relation names in the schema are inverted
                // followedBy = users this user is following (followedById = this user)
                // following = users following this user (followingId = this user)
                followedBy: true, // Count of users this user is following
                following: true,  // Count of users following this user
                posts: true
              }
            }
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Swap the inverted counts for correct display
    const correctedProfile = {
      ...profile,
      user: {
        ...profile.user,
        _count: {
          ...profile.user._count,
          followedBy: profile.user._count.following, // Swap: followers
          following: profile.user._count.followedBy, // Swap: following
        }
      }
    };

    res.json(correctedProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET profile by username
 */
export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        _count: {
          select: {
            workouts: true,
            workoutPlans: true,
            followedBy: true,
            following: true,
            posts: true
          }
        }
      }
    });

    if (!user || !user.profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Don't return private profiles unless it's the user's own profile
    if (user.profile.isPrivate && req.user?.id !== user.id) {
      return res.status(403).json({ error: 'Profile is private' });
    }

    res.json({
      ...user.profile,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt,
        _count: user._count
      }
    });
  } catch (error) {
    console.error('Error fetching profile by username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST create a new profile
 */
export const createProfile = async (req, res) => {
  try {
    const { userId, bio, isPrivate = false } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists for this user' });
    }

    const profile = await prisma.profile.create({
      data: {
        userId: parseInt(userId),
        bio,
        isPrivate
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            createdAt: true
          }
        }
      }
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PUT update profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, isPrivate } = req.body;

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Authorization check (assuming req.user contains authenticated user info)
    if (req.user && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    const updatedProfile = await prisma.profile.update({
      where: { userId: parseInt(userId) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            createdAt: true
          }
        }
      }
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * DELETE profile
 */
export const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Authorization check
    if (req.user && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: 'Not authorized to delete this profile' });
    }

    await prisma.profile.delete({
      where: { userId: parseInt(userId) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET all public profiles (for discovery/search)
 */
export const getPublicProfiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      isPrivate: false,
      ...(search && {
        user: {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } }
          ]
        }
      })
    };

    const profiles = await prisma.profile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            createdAt: true,
            _count: {
              select: {
                workouts: true,
                splits: true,
                followedBy: true,
                following: true,
                posts: true
              }
            }
          }
        }
      },
      skip: offset,
      take: parseInt(limit),
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    const totalCount = await prisma.profile.count({
      where: whereClause
    });

    res.json({
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching public profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};