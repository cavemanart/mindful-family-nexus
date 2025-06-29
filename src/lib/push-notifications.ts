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
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission;
      } catch (error) {
        console.error('Error requesting permission:', error);
        return 'denied';
      }
    }

    return Notification.permission;
  }

  /**
   * Check if service worker is ready
   */
  private async checkServiceWorkerSupport(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      return !!registration.pushManager;
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
      
      // Check if already subscribed first
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        this.storeSubscription(existingSubscription).catch(error => {
          console.error('Background subscription storage failed:', error);
        });
        return existingSubscription;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
      });

      console.log('Subscribed to push notifications:', subscription);
      
      this.storeSubscription(subscription).catch(error => {
        console.error('Background subscription storage failed:', error);
      });
      
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Store push subscription in the database
   */
  private async storeSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const p256dhKey = subscription.getKey('p256dh') ? 
        btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null;
      const authKey = subscription.getKey('auth') ? 
        btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null;

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: p256dhKey,
          auth_key: authKey,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        console.error('Error storing push subscription:', error);
        throw error;
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
        const success = await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications:', success);
        
        if (success) {
          this.deactivateSubscription(subscription.endpoint).catch(error => {
            console.error('Background deactivation failed:', error);
          });
        }
        
        return success;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Deactivate subscription in database
   */
  private async deactivateSubscription(endpoint: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
   * Send a local notification (simplified and more reliable)
   */
  async sendLocalNotification(data: Omit<PushNotificationData, 'householdId' | 'userId'>): Promise<void> {
    console.log('Attempting to send local notification:', data);
    
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser');
    }

    // Check permission first
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: data.message,
        icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
        badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
        tag: data.type,
        data: {
          type: data.type,
          url: data.url || '/dashboard',
          id: data.id
        },
        requireInteraction: false,
        silent: false
      };

      const title = this.getNotificationTitle(data.type);
      console.log('Creating notification with title:', title);
      
      // Try service worker first, fallback to regular notification
      let notificationCreated = false;
      
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration?.showNotification) {
            console.log('Using service worker registration');
            await registration.showNotification(title, notificationOptions);
            notificationCreated = true;
            console.log('Service worker notification created');
          }
        } catch (swError) {
          console.warn('Service worker notification failed:', swError);
        }
      }
      
      // Fallback to regular notification
      if (!notificationCreated) {
        console.log('Using regular Notification constructor');
        const notification = new Notification(title, notificationOptions);
        
        notification.onclick = () => {
          console.log('Notification clicked');
          window.focus();
          if (data.url) {
            window.location.href = data.url;
          }
          notification.close();
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }
      
      // Add vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      
      console.log('Notification sent successfully');
      
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test push notifications (simplified)
   */
  async testNotification(): Promise<void> {
    console.log('Starting test notification...');
    
    try {
      if (!('Notification' in window)) {
        throw new Error('Push notifications are not supported in this browser');
      }
      
      const permission = await this.requestPermission();
      console.log('Permission status:', permission);
      
      if (permission !== 'granted') {
        throw new Error('Notification permission was denied. Please enable notifications in your browser settings.');
      }

      await this.sendLocalNotification({
        type: 'default',
        message: 'Test notification from Hublie! Push notifications are working correctly.',
        url: '/dashboard'
      });
      
      console.log('Test notification completed successfully');
      
    } catch (error) {
      console.error('Test notification failed:', error);
      throw error;
    }
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
