import { supabase } from "@/integrations/supabase/client";

export interface PushNotificationData {
  type: 'chore_reminder' | 'bill_reminder' | 'family_message' | 'calendar_event' | 'mvp_announcement' | 'default';
  message: string;
  url?: string;
  id?: string;
  householdId?: string;
  userId?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  
  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Check if service worker is ready and supports push
   */
  private async checkServiceWorkerSupport(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) {
        console.warn('Push manager not available');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Service worker not ready:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      const isSupported = await this.checkServiceWorkerSupport();
      if (!isSupported) {
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        // Still store/update the subscription in case it's not in our database
        await this.storeSubscription(existingSubscription);
        return existingSubscription;
      }

      // For now, we'll use a basic subscription without VAPID keys
      // In production, you would need to configure proper VAPID keys
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Commenting out VAPID key for now - this should be configured properly in production
        // applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
      });

      console.log('Subscribed to push notifications:', subscription);
      
      // Store subscription in database
      await this.storeSubscription(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error; // Re-throw to handle in UI
    }
  }

  /**
   * Store push subscription in the database using direct insert/upsert
   */
  private async storeSubscription(subscription: PushSubscription): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const p256dhKey = subscription.getKey('p256dh') ? 
        btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null;
      const authKey = subscription.getKey('auth') ? 
        btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null;

      // First try to update existing subscription
      const { data: existingData, error: selectError } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing subscription:', selectError);
        throw selectError;
      }

      if (existingData) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('push_subscriptions')
          .update({
            p256dh_key: p256dhKey,
            auth_key: authKey,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);

        if (updateError) {
          console.error('Error updating push subscription:', updateError);
          throw updateError;
        }
      } else {
        // Insert new subscription
        const { error: insertError } = await supabase
          .from('push_subscriptions')
          .insert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh_key: p256dhKey,
            auth_key: authKey,
            is_active: true
          });

        if (insertError) {
          console.error('Error inserting push subscription:', insertError);
          throw insertError;
        }
      }

      console.log('Push subscription stored successfully');
    } catch (error) {
      console.error('Error storing push subscription:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPushNotifications(): Promise<boolean> {
    try {
      const isSupported = await this.checkServiceWorkerSupport();
      if (!isSupported) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
        
        // Mark subscription as inactive in database
        await this.deactivateSubscription(subscription.endpoint);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  /**
   * Deactivate subscription in database
   */
  private async deactivateSubscription(endpoint: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('endpoint', endpoint);

      if (error) {
        console.error('Error deactivating push subscription:', error);
      }
    } catch (error) {
      console.error('Error deactivating push subscription:', error);
    }
  }

  /**
   * Send a local notification (for testing or immediate feedback)
   */
  async sendLocalNotification(data: Omit<PushNotificationData, 'householdId' | 'userId'>): Promise<void> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const notificationOptions: NotificationOptions = {
      body: data.message,
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: data.type,
      data: {
        type: data.type,
        url: data.url || '/dashboard',
        id: data.id
      }
    };

    const title = this.getNotificationTitle(data.type);
    const notification = new Notification(title, notificationOptions);
    
    // Add vibration manually if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  /**
   * Test push notifications (sends a local notification)
   */
  async testNotification(): Promise<void> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    await this.sendLocalNotification({
      type: 'default',
      message: 'Test notification from Hublie! Push notifications are working correctly.',
      url: '/dashboard'
    });
  }

  /**
   * Send different types of family notifications
   */
  async sendChoreReminder(choreName: string, assignedMember: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'chore_reminder',
      message: `${assignedMember}, don't forget about your chore: ${choreName}`,
      url: '/dashboard#chores'
    });
  }

  async sendBillReminder(billName: string, dueDate: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'bill_reminder',
      message: `Bill reminder: ${billName} is due on ${dueDate}`,
      url: '/dashboard#bills'
    });
  }

  async sendFamilyMessage(fromMember: string, message: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'family_message',
      message: `${fromMember}: ${message}`,
      url: '/dashboard#messages'
    });
  }

  async sendCalendarReminder(eventTitle: string, eventTime: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'calendar_event',
      message: `Upcoming event: ${eventTitle} at ${eventTime}`,
      url: '/dashboard#calendar'
    });
  }

  async sendMVPAnnouncement(mvpName: string): Promise<void> {
    await this.sendLocalNotification({
      type: 'mvp_announcement',
      message: `🌟 ${mvpName} is today's MVP! Great job!`,
      url: '/dashboard#mvp'
    });
  }

  private getNotificationTitle(type: string): string {
    const titles = {
      'chore_reminder': '🏠 Chore Reminder',
      'bill_reminder': '💰 Bill Due Soon',
      'family_message': '💬 New Family Message',
      'calendar_event': '📅 Upcoming Event',
      'mvp_announcement': '⭐ MVP of the Day!',
      'default': '🏠 Hublie'
    };
    return titles[type as keyof typeof titles] || titles.default;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
