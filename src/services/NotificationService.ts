/**
 * NotificationService - Content Flow Edition
 * Daily posting reminders at the user's optimal time
 *
 * Dependencies to install:
 *   npm install @notifee/react-native
 *   npx pod-install (iOS)
 *
 * Android: Add SCHEDULE_EXACT_ALARM permission to AndroidManifest.xml
 * iOS: Enable Push Notifications + Background Modes in Xcode capabilities
 */

import notifee, {
  AndroidImportance,
  AndroidStyle,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
  AuthorizationStatus,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'content-flow-reminders';
const NOTIFICATION_ID = 'daily-post-reminder';
const STORAGE_KEY_REMINDER = 'reminder_settings';

export interface ReminderSettings {
  enabled: boolean;
  hour: number;       // 0–23
  minute: number;     // 0–59
  niche: string;
  optimalTime: string; // human-readable e.g. "7:00 PM"
}

const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  hour: 19,
  minute: 0,
  niche: '',
  optimalTime: '7:00 PM',
};

// Motivational messages rotated daily
const REMINDER_MESSAGES = [
  "Your audience is waiting. Time to post! 🚀",
  "Peak engagement window is NOW. Don't miss it! 📈",
  "Creators who post consistently grow 3x faster. Go! 🔥",
  "Your best time to go viral is right now. Hit publish! ⚡",
  "Consistency beats perfection. Post today. 💪",
  "The algorithm rewards those who show up daily. That's you! 🎯",
  "Your next viral post is one upload away. Let's go! 🌟",
];

export const NotificationService = {

  /**
   * Request notification permissions from the OS
   */
  async requestPermissions(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return (
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
    );
  },

  /**
   * Check current permission status without prompting
   */
  async checkPermissions(): Promise<boolean> {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  },

  /**
   * Create the Android notification channel (no-op on iOS)
   */
  async createChannel(): Promise<void> {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Daily Posting Reminders',
      description: 'Reminds you to post at your optimal engagement time',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  },

  /**
   * Schedule a daily repeating notification at the given hour:minute
   */
  async scheduleDailyReminder(settings: ReminderSettings): Promise<boolean> {
    try {
      // Cancel any existing reminder first
      await this.cancelReminder();

      const granted = await this.requestPermissions();
      if (!granted) return false;

      await this.createChannel();

      // Build next trigger time
      const now = new Date();
      const trigger = new Date();
      trigger.setHours(settings.hour, settings.minute, 0, 0);

      // If today's time has already passed, start tomorrow
      if (trigger <= now) {
        trigger.setDate(trigger.getDate() + 1);
      }

      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const messageIndex = trigger.getDate() % REMINDER_MESSAGES.length;
      const body = REMINDER_MESSAGES[messageIndex];

      const triggerConfig: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: trigger.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };

      await notifee.createTriggerNotification(
        {
          id: NOTIFICATION_ID,
          title: `⚡ Post Now — ${settings.optimalTime} is your peak!`,
          body,
          android: {
            channelId: CHANNEL_ID,
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_notification', // must exist in android/app/src/main/res/drawable
            color: '#00D4FF',
            style: {
              type: AndroidStyle.BIGTEXT,
              text: body,
            },
            pressAction: { id: 'default' },
            actions: [
              {
                title: '📹 Upload Now',
                pressAction: { id: 'upload' },
              },
              {
                title: '⏰ Snooze 1hr',
                pressAction: { id: 'snooze' },
              },
            ],
          },
          ios: {
            sound: 'default',
            badgeCount: 1,
            categoryId: 'posting-reminder',
          },
        },
        triggerConfig
      );

      // Save settings
      await this.saveSettings({ ...settings, enabled: true });
      return true;
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      return false;
    }
  },

  /**
   * Cancel the daily reminder
   */
  async cancelReminder(): Promise<void> {
    try {
      await notifee.cancelNotification(NOTIFICATION_ID);
      const current = await this.loadSettings();
      await this.saveSettings({ ...current, enabled: false });
    } catch (error) {
      console.error('Failed to cancel reminder:', error);
    }
  },

  /**
   * Send an immediate test notification
   */
  async sendTestNotification(optimalTime: string): Promise<void> {
    await this.createChannel();
    await notifee.displayNotification({
      title: '⚡ Content Flow — Test Reminder',
      body: `Your daily reminder is set for ${optimalTime}. You're all set! 🚀`,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        color: '#00D4FF',
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'default',
      },
    });
  },

  /**
   * Parse a time string like "7-9 PM" into the midpoint hour/minute
   */
  parseOptimalTime(timeString: string): { hour: number; minute: number; label: string } {
    // e.g. "7-9 PM" → 8 PM, "12-2 PM" → 1 PM
    const match = timeString.match(/(\d+)(?:-(\d+))?\s*(AM|PM)/i);
    if (!match) return { hour: 19, minute: 0, label: '7:00 PM' };

    let startHour = parseInt(match[1], 10);
    const endHour = match[2] ? parseInt(match[2], 10) : startHour;
    const period = match[3].toUpperCase();

    // Midpoint
    let hour = Math.floor((startHour + endHour) / 2);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const label = `${hour > 12 ? hour - 12 : hour}:00 ${period}`;
    return { hour, minute: 0, label };
  },

  /**
   * Persist settings to AsyncStorage
   */
  async saveSettings(settings: ReminderSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_REMINDER, JSON.stringify(settings));
  },

  /**
   * Load saved settings (or defaults)
   */
  async loadSettings(): Promise<ReminderSettings> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_REMINDER);
    if (!raw) return DEFAULT_REMINDER;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_REMINDER;
    }
  },
};

export default NotificationService;
