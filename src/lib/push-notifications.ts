import { supabase } from "@/integrations/supabase/client";

export interface PushNotificationData {
  type: 'chore_reminder' | 'bill_reminder' | 'family_message' | 'calendar_event' | 'mvp_announcement' | 'test' | 'reward_redemption' | 'default';
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
   * Subscribe to push notifications (optimized for performance)
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
        
        // Store in background without blocking
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
      
      // Store in background
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
   * Store push subscription in the database (optimized)
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
   * Send a local test notification (optimized and more reliable)
   */
  async sendLocalTestNotification(): Promise<void> {
    console.log('Sending local test notification...');
    
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser');
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const notificationOptions: NotificationOptions = {
        body: 'Test notification from Hublie! Push notifications are working correctly. 🎉',
        icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
        badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
        tag: 'test-notification',
        data: {
          type: 'test',
          url: '/dashboard',
          timestamp: Date.now()
        },
        requireInteraction: false,
        silent: false
      };

      const title = '🧪 Test Notification - Hublie';
      console.log('Creating test notification with title:', title);
      
      // Try service worker first for better reliability
      let notificationCreated = false;
      
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration?.showNotification) {
            console.log('Using service worker for test notification');
            await registration.showNotification(title, notificationOptions);
            notificationCreated = true;
            console.log('Service worker test notification created successfully');
          }
        } catch (swError) {
          console.warn('Service worker notification failed, trying fallback:', swError);
        }
      }
      
      // Fallback to regular notification
      if (!notificationCreated) {
        console.log('Using regular Notification constructor for test');
        const notification = new Notification(title, notificationOptions);
        
        notification.onclick = () => {
          console.log('Test notification clicked');
          window.focus();
          window.location.href = '/dashboard';
          notification.close();
        };
        
        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      }
      
      // Add vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      
      console.log('Test notification sent successfully');
      
    } catch (error) {
      console.error('Error creating test notification:', error);
      throw new Error(`Failed to create test notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test push subscription endpoint
   */
  async testPushSubscription(): Promise<void> {
    try {
      const isSupported = await this.checkServiceWorkerSupport();
      if (!isSupported) {
        throw new Error('Push notifications not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        throw new Error('No active push subscription found');
      }

      console.log('Push subscription test successful - subscription exists:', subscription.endpoint);
      
      // Here we could call an edge function to send a real push notification
      // For now, we'll just verify the subscription exists
      
    } catch (error) {
      console.error('Push subscription test failed:', error);
      throw error;
    }
  }

  /**
   * Legacy test method - kept for compatibility
   */
  async testNotification(): Promise<void> {
    return this.sendLocalTestNotification();
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

  /**
   * Send reward redemption notification to parents
   */
  async sendRewardRedemptionNotification(householdId: string, rewardName: string, childName: string): Promise<void> {
    try {
      // Call the edge function to send push notifications to household parents
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          householdId,
          type: 'reward_redemption',
          title: '🎁 Reward Redeemed!',
          message: `${childName} has redeemed: ${rewardName}`,
          url: '/dashboard#rewards-admin'
        }
      });

      if (error) {
        console.error('Error sending reward redemption notification:', error);
        throw error;
      }

      // Also send local notification if supported
      await this.sendLocalNotification({
        type: 'reward_redemption',
        message: `${childName} has redeemed: ${rewardName}`,
        url: '/dashboard#rewards-admin'
      });

    } catch (error) {
      console.error('Failed to send reward redemption notification:', error);
      throw error;
    }
  }

  /**
   * Send a local notification (optimized version)
   */
  private async sendLocalNotification(data: Omit<PushNotificationData, 'householdId' | 'userId'>): Promise<void> {
    console.log('Sending local notification:', data);
    
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported in this browser');
    }

    if (Notification.permission !== 'granted') {
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
          id: data.id,
          timestamp: Date.now()
        },
        requireInteraction: false,
        silent: false
      };

      const title = this.getNotificationTitle(data.type);
      
      // Use service worker when available
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration?.showNotification) {
            await registration.showNotification(title, notificationOptions);
            return;
          }
        } catch (swError) {
          console.warn('Service worker notification failed, using fallback:', swError);
        }
      }
      
      // Fallback to regular notification
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
      
      // Add vibration if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check for upcoming bills and send reminders
   * This can be called periodically or triggered by the app
   */
  async sendUpcomingBillReminders(bills: any[]): Promise<void> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingBills = bills.filter(bill => {
      if (bill.is_paid) return false;
      
      const dueDate = new Date(bill.due_date);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Send reminder for bills due today, tomorrow, or in 3 days
      return daysDiff >= 0 && daysDiff <= 3;
    });

    for (const bill of upcomingBills) {
      const dueDate = new Date(bill.due_date);
      const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let message = '';
      if (daysDiff === 0) {
        message = `${bill.name} is due today! ($${bill.amount})`;
      } else if (daysDiff === 1) {
        message = `${bill.name} is due tomorrow! ($${bill.amount})`;
      } else {
        message = `${bill.name} is due in ${daysDiff} days ($${bill.amount})`;
      }

      try {
        await this.sendLocalNotification({
          type: 'bill_reminder',
          message,
          url: '/dashboard#bills'
        });
      } catch (error) {
        console.warn(`Failed to send reminder for bill ${bill.name}:`, error);
      }
    }
  }

  /**
   * Check for upcoming calendar events and send reminders
   */
  async sendUpcomingEventReminders(events: any[]): Promise<void> {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    const upcomingEvents = events.filter(event => {
      const eventStart = new Date(event.start_datetime);
      return eventStart > now && eventStart <= oneHourFromNow;
    });

    for (const event of upcomingEvents) {
      const eventTime = new Date(event.start_datetime).toLocaleTimeString();
      
      try {
        await this.sendLocalNotification({
          type: 'calendar_event',
          message: `${event.title} starts at ${eventTime}`,
          url: '/dashboard#calendar'
        });
      } catch (error) {
        console.warn(`Failed to send reminder for event ${event.title}:`, error);
      }
    }
  }

  private getNotificationTitle(type: string): string {
    const titles = {
      'chore_reminder': '🏠 Chore Reminder',
      'bill_reminder': '💰 Bill Due Soon',
      'family_message': '💬 New Family Message',
      'calendar_event': '📅 Upcoming Event',
      'mvp_announcement': '⭐ MVP of the Day!',
      'reward_redemption': '🎁 Reward Redeemed!',
      'test': '🧪 Test Notification - Hublie',
      'default': '🏠 Hublie'
    };
    return titles[type as keyof typeof titles] || titles.default;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
