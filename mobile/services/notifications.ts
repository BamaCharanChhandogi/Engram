import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_STORAGE_KEY = '@engram_notifications_enabled';
const NOTIF_CHANNEL_ID = 'engram-daily-recall';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationService = {
  async init(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIF_CHANNEL_ID, {
        name: 'Daily Active Recall',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#e8c872',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }
  },

  async isEnabled(): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  async scheduleDailyReminder(): Promise<boolean> {
    try {
      await this.init();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        await AsyncStorage.setItem(NOTIF_STORAGE_KEY, 'false');
        return false;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Engram Daily Reps Ready',
          body: 'Your active recall reps are waiting. Reinforce your coding decisions and retain your context.',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          color: '#e8c872',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 18,
          minute: 0,
        },
      });

      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, 'true');
      return true;
    } catch (e) {
      console.log('Error scheduling daily reminder:', e);
      return false;
    }
  },

  async cancelDailyReminder(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, 'false');
    } catch (e) {
      console.log('Error cancelling daily reminder:', e);
    }
  },

  async sendTestNotification(): Promise<void> {
    try {
      await this.init();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Engram Active Recall',
          body: 'Daily recall notifications are active. You will receive prompt reps every evening at 6:00 PM.',
          sound: 'default',
          color: '#e8c872',
        },
        trigger: null,
      });
    } catch (e) {
      console.log('Error sending test notification:', e);
    }
  },
};
