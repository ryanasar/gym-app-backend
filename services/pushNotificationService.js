import { Expo } from 'expo-server-sdk';
import prisma from '../prismaClient.js';

const expo = new Expo();

/**
 * Send push notifications to a user
 * @param {string} recipientId - The user ID of the recipient
 * @param {object} notification - The notification data from DB
 */
export const sendPushNotification = async (recipientId, notification) => {
  try {
    // Get recipient user and their push tokens
    const recipient = await prisma.user.findUnique({
      where: { id: parseInt(recipientId) },
      include: {
        pushTokens: true,
        profile: true
      }
    });

    if (!recipient || recipient.pushTokens.length === 0) {
      console.log('[Push] No push tokens found for user:', recipientId);
      return;
    }

    // Get actor info for the notification message
    const actor = await prisma.user.findUnique({
      where: { id: parseInt(notification.actor_id) },
      select: {
        username: true,
        firstName: true,
        lastName: true
      }
    });

    if (!actor) {
      console.log('[Push] Actor not found:', notification.actor_id);
      return;
    }

    // Build notification message based on type
    const { title, body } = buildNotificationContent(notification.type, actor);

    // Build messages for all user's devices
    const messages = [];
    for (const pushToken of recipient.pushTokens) {
      if (!Expo.isExpoPushToken(pushToken.token)) {
        console.warn('[Push] Invalid Expo push token:', pushToken.token);
        continue;
      }

      messages.push({
        to: pushToken.token,
        sound: 'default',
        title,
        body,
        data: {
          type: notification.type,
          postId: notification.post_id,
          commentId: notification.comment_id,
          actorId: notification.actor_id
        }
      });
    }

    if (messages.length === 0) {
      console.log('[Push] No valid tokens to send to');
      return;
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('[Push] Error sending chunk:', error);
      }
    }

    // Handle failed tickets (remove invalid tokens)
    await handlePushTickets(tickets, recipient.pushTokens);

    console.log('[Push] Sent notifications:', tickets.length);
    return tickets;
  } catch (error) {
    console.error('[Push] Error sending push notification:', error);
    throw error;
  }
};

/**
 * Build notification title and body based on type
 */
const buildNotificationContent = (type, actor) => {
  const actorName = actor.username || `${actor.firstName || ''} ${actor.lastName || ''}`.trim() || 'Someone';

  const templates = {
    like: {
      title: 'Gymvy',
      body: `${actorName} liked your post`
    },
    comment: {
      title: 'Gymvy',
      body: `${actorName} commented on your post`
    },
    follow: {
      title: 'Gymvy',
      body: `${actorName} started following you`
    },
    tag: {
      title: 'Gymvy',
      body: `${actorName} tagged you in a post`
    },
    comment_like: {
      title: 'Gymvy',
      body: `${actorName} liked your comment`
    }
  };

  return templates[type] || {
    title: 'Gymvy',
    body: `${actorName} interacted with you`
  };
};

/**
 * Handle push notification tickets and remove invalid tokens
 */
const handlePushTickets = async (tickets, pushTokens) => {
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const token = pushTokens[i];

    if (ticket.status === 'error') {
      if (ticket.details?.error === 'DeviceNotRegistered') {
        // Remove invalid token
        console.log('[Push] Removing invalid token:', token.token);
        await prisma.pushToken.delete({
          where: { id: token.id }
        }).catch(err => console.error('[Push] Error deleting token:', err));
      }
    }
  }
};

export default { sendPushNotification };
