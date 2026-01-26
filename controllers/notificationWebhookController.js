import { sendPushNotification } from '../services/pushNotificationService.js';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * Handle notification created webhook from Supabase
 * Triggered when a new notification is inserted into the Notifications table
 */
export const handleNotificationCreated = async (req, res) => {
  console.log('[Webhook] Received:', JSON.stringify(req.body, null, 2));

  // Verify webhook secret
  const webhookSecret = req.headers['x-webhook-secret'];

  if (WEBHOOK_SECRET && webhookSecret !== WEBHOOK_SECRET) {
    console.warn('[Webhook] Invalid webhook secret');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { type, record, old_record } = req.body;

  // Only process INSERT events
  if (type !== 'INSERT') {
    return res.json({ message: 'Ignored non-INSERT event' });
  }

  const notification = record;

  if (!notification) {
    return res.status(400).json({ error: 'No notification data' });
  }

  // Don't send push for notifications the user creates for themselves
  if (notification.recipient_id === notification.actor_id) {
    return res.json({ message: 'Skipped self-notification' });
  }

  try {
    await sendPushNotification(notification.recipient_id, notification);
    res.json({ message: 'Push notification sent' });
  } catch (error) {
    console.error('[Webhook] Error processing notification:', error);
    // Return 200 to prevent Supabase from retrying
    res.json({ message: 'Error sending push', error: error.message });
  }
};
