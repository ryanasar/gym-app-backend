import prisma from '../prismaClient.js';

/**
 * Register or update a push token for a user
 */
export const registerPushToken = async (req, res) => {
  const { supabaseId } = req.params;
  const { token, platform } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { supabaseId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Upsert the token (create or update)
    const pushToken = await prisma.pushToken.upsert({
      where: { token },
      update: {
        userId: user.id,
        platform: platform || null,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        token,
        platform: platform || null
      }
    });

    res.json({ message: 'Push token registered', pushToken });
  } catch (error) {
    console.error('[PushToken] Error registering token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
};

/**
 * Remove a push token (e.g., on logout)
 */
export const removePushToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    await prisma.pushToken.delete({
      where: { token }
    }).catch(() => {
      // Token might not exist, that's ok
    });

    res.json({ message: 'Push token removed' });
  } catch (error) {
    console.error('[PushToken] Error removing token:', error);
    res.status(500).json({ error: 'Failed to remove push token' });
  }
};

/**
 * Get all push tokens for a user (admin/debug)
 */
export const getUserPushTokens = async (req, res) => {
  const { supabaseId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      include: {
        pushTokens: {
          select: {
            id: true,
            platform: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.pushTokens);
  } catch (error) {
    console.error('[PushToken] Error getting tokens:', error);
    res.status(500).json({ error: 'Failed to get push tokens' });
  }
};
