import { sendPushNotification } from './pushNotification.service.js';
import User from '../models/user.model.js';

export const processContext = async (userId, activityLog) => {
  const user = await User.findById(userId);
  if (!user) return;

  const type = activityLog.type;
  const data = activityLog.data;

  if (type === 'location' && data.location === 'gym') {
    await sendPushNotification(
      userId,
      'Gym Time!',
      'Aap gym pahunch gaye. Yeh raha aapka workout playlist suggestion.'
    );
  }

  if (type === 'calendar' && data.eventName.toLowerCase().includes('meeting')) {
    if (user.lastForecast?.mood === 'stressed') {
      await sendPushNotification(
        userId,
        'Pre-Meeting Calm Down',
        'Aapki meeting 30 min mein hai. Ek 2-minute breathing exercise try karo?'
      );
    }
  }

  if (type === 'appUsage' && data.app === 'spotify' && data.duration > 3600) {
    await sendPushNotification(
      userId,
      'Taking a break?',
      'Aap 1 ghante se music sun rahe hain. Sab theek hai? Humse baat karna chahoge?'
    );
  }
};