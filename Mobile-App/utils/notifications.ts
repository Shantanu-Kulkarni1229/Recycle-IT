import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }
    
    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pickup-notifications', {
        name: 'Pickup Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
        sound: 'default',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule a pickup notification
 */
export const schedulePickupNotification = async (
  deviceType: string, 
  brand: string, 
  model: string,
  pickupDate: string
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notification: Permission not granted');
      return;
    }

    // Schedule immediate notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Pickup Scheduled Successfully!',
        body: `Your ${brand} ${model} (${deviceType}) pickup has been scheduled. We'll contact you soon!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#10b981',
        data: {
          type: 'pickup_scheduled',
          deviceType,
          brand,
          model,
          pickupDate,
        },
      },
      trigger: null, // Show immediately
    });

    // Schedule reminder notification for pickup day (if date is in future)
    const pickupDateTime = new Date(pickupDate);
    const now = new Date();
    
    if (pickupDateTime > now) {
      const reminderTime = new Date(pickupDateTime);
      reminderTime.setHours(9, 0, 0, 0); // 9 AM on pickup day
      
      if (reminderTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '📅 Pickup Reminder',
            body: `Your e-waste pickup for ${brand} ${model} is scheduled for today. Please keep your device ready!`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            color: '#10b981',
            data: {
              type: 'pickup_reminder',
              deviceType,
              brand,
              model,
              pickupDate,
            },
          },
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: Math.floor((reminderTime.getTime() - now.getTime()) / 1000) 
          },
        });
      }
    }

    console.log('✅ Pickup notifications scheduled successfully');
  } catch (error) {
    console.error('Error scheduling pickup notification:', error);
  }
};

/**
 * Schedule a pickup approval notification
 */
export const scheduleApprovalNotification = async (
  deviceType: string, 
  brand: string, 
  model: string,
  recyclerName?: string
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notification: Permission not granted');
      return;
    }

    // Schedule immediate approval notification
    const recyclerText = recyclerName ? ` by ${recyclerName}` : '';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Pickup Approved!',
        body: `Great news! Your ${brand} ${model} (${deviceType}) pickup has been approved${recyclerText}. You'll be contacted soon!`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#059669',
        data: {
          type: 'pickup_approved',
          deviceType,
          brand,
          model,
          recyclerName,
        },
      },
      trigger: null, // Show immediately
    });

    console.log('✅ Pickup approval notification scheduled successfully');
  } catch (error) {
    console.error('Error scheduling approval notification:', error);
  }
};

/**
 * Schedule a pickup status change notification
 */
export const scheduleStatusChangeNotification = async (
  deviceType: string, 
  brand: string, 
  model: string,
  newStatus: string,
  recyclerName?: string
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notification: Permission not granted');
      return;
    }

    let title = '📦 Pickup Update';
    let emoji = '📦';
    let body = '';

    switch (newStatus) {
      case 'Scheduled':
        emoji = '🎉';
        title = 'Pickup Approved!';
        body = `Great news! Your ${brand} ${model} pickup has been approved${recyclerName ? ` by ${recyclerName}` : ''}!`;
        break;
      case 'In Transit':
        emoji = '🚚';
        title = 'Pickup In Progress';
        body = `Your ${brand} ${model} is being collected by our recycler team!`;
        break;
      case 'Collected':
        emoji = '✅';
        title = 'Device Collected';
        body = `Your ${brand} ${model} has been successfully collected and is being processed!`;
        break;
      case 'Delivered':
        emoji = '🏭';
        title = 'Device Delivered';
        body = `Your ${brand} ${model} has been delivered to the recycling facility!`;
        break;
      case 'Verified':
        emoji = '🌟';
        title = 'Recycling Complete';
        body = `Congratulations! Your ${brand} ${model} has been successfully recycled. Thank you for helping the environment!`;
        break;
      case 'Cancelled':
        emoji = '❌';
        title = 'Pickup Cancelled';
        body = `Your ${brand} ${model} pickup has been cancelled. Please contact support if you need assistance.`;
        break;
      default:
        body = `Your ${brand} ${model} pickup status has been updated to: ${newStatus}`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} ${title}`,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: newStatus === 'Cancelled' ? '#ef4444' : '#059669',
        data: {
          type: 'status_change',
          deviceType,
          brand,
          model,
          newStatus,
          recyclerName,
        },
      },
      trigger: null, // Show immediately
    });

    console.log(`✅ Status change notification scheduled for: ${newStatus}`);
  } catch (error) {
    console.error('Error scheduling status change notification:', error);
  }
};

/**
 * Cancel all pickup notifications (useful for logout or app reset)
 */
export const cancelAllPickupNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All pickup notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
};

/**
 * Get notification token for push notifications (if using server)
 */
export const getNotificationToken = async (): Promise<string | null> => {
  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.error('Error getting notification token:', error);
    return null;
  }
};