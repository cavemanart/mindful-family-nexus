
const CACHE_NAME = 'hublie-v2';
const urlsToCache = [
  '/',
  '/dashboard',
  '/auth',
  '/profile',
  '/nanny',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests specially for PWA
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/') || caches.match('/dashboard');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Enhanced push notification handler with better error handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData;
  
  try {
    // Try to parse the push data
    notificationData = event.data ? event.data.json() : {};
    console.log('Parsed notification data:', notificationData);
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData = {
      type: 'default',
      message: 'You have a new notification from Hublie!'
    };
  }

  // Define notification types and their configurations
  const notificationTypes = {
    'chore_reminder': {
      title: '🏠 Chore Reminder',
      body: notificationData.message || 'You have chores to complete!',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'chore-reminder',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Chores', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'bill_reminder': {
      title: '💰 Bill Due Soon',
      body: notificationData.message || 'You have bills due soon!',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'bill-reminder',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Bills', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'family_message': {
      title: '💬 New Family Message',
      body: notificationData.message || 'You have a new family message!',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'family-message',
      actions: [
        { action: 'view', title: 'View Message', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'calendar_event': {
      title: '📅 Upcoming Event',
      body: notificationData.message || 'You have an upcoming event!',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'calendar-event',
      actions: [
        { action: 'view', title: 'View Event', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'mvp_announcement': {
      title: '⭐ MVP of the Day!',
      body: notificationData.message || 'Check out today\'s MVP!',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'mvp-announcement',
      actions: [
        { action: 'view', title: 'View MVP', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'reward_redemption': {
      title: '🎁 Reward Redeemed!',
      body: notificationData.message || 'A child has redeemed a reward!',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'reward-redemption',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Rewards', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'test': {
      title: '🧪 Test Notification - Hublie',
      body: notificationData.message || 'Test notification is working! 🎉',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'test-notification',
      actions: [
        { action: 'view', title: 'Open App', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'default': {
      title: '🏠 Hublie',
      body: notificationData.message || 'You have a new notification!',
      icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      badge: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png',
      tag: 'general',
      actions: [
        { action: 'view', title: 'Open App', icon: '/lovable-uploads/674563d8-00ea-49e9-927c-e98b96abd606.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    }
  };

  // Get notification configuration based on type
  const notificationType = notificationData.type || 'default';
  const notificationConfig = notificationTypes[notificationType] || notificationTypes.default;

  // Merge custom data with notification config
  const options = {
    ...notificationConfig,
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || Date.now(),
      type: notificationType,
      url: notificationData.url || '/dashboard',
      timestamp: Date.now(),
      ...notificationData
    }
  };

  console.log('Showing notification with options:', options);

  event.waitUntil(
    self.registration.showNotification(options.title, options)
      .then(() => {
        console.log('Notification displayed successfully');
      })
      .catch((error) => {
        console.error('Error showing notification:', error);
      })
  );
});

// Handle notification click events with improved error handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  let targetUrl = '/dashboard';

  try {
    // Determine target URL based on notification type and action
    if (event.action === 'view') {
      switch (notificationData.type) {
        case 'chore_reminder':
          targetUrl = '/dashboard#chores';
          break;
        case 'bill_reminder':
          targetUrl = '/dashboard#bills';
          break;
        case 'family_message':
          targetUrl = '/dashboard#messages';
          break;
        case 'calendar_event':
          targetUrl = '/dashboard#calendar';
          break;
        case 'mvp_announcement':
          targetUrl = '/dashboard#mvp';
          break;
        case 'reward_redemption':
          targetUrl = '/dashboard#rewards-admin';
          break;
        case 'test':
          targetUrl = '/dashboard';
          break;
        default:
          targetUrl = notificationData.url || '/dashboard';
      }
    } else if (event.action === 'dismiss') {
      // Just close the notification, don't open the app
      console.log('Notification dismissed');
      return;
    } else {
      // Default click action (no specific action button clicked)
      targetUrl = notificationData.url || '/dashboard';
    }

    console.log('Opening/focusing app with URL:', targetUrl);

    // Open or focus the app window
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          console.log('Found clients:', clientList.length);
          
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes(self.location.origin) && 'focus' in client) {
              console.log('Focusing existing client');
              client.focus();
              if ('navigate' in client) {
                client.navigate(targetUrl);
              }
              return client;
            }
          }
          
          // Open new window if app isn't open
          if (clients.openWindow) {
            console.log('Opening new window');
            return clients.openWindow(targetUrl);
          }
        })
        .catch((error) => {
          console.error('Error handling notification click:', error);
        })
    );
  } catch (error) {
    console.error('Error in notification click handler:', error);
  }
});

// Handle notification close events (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  const notificationData = event.notification.data || {};
  
  // Log notification dismissal for analytics
  console.log('Notification dismissed:', {
    type: notificationData.type,
    dismissedAt: Date.now(),
    tag: event.notification.tag
  });
});

// Handle background sync (for future offline functionality)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Add background sync logic here
      Promise.resolve().then(() => {
        console.log('Background sync completed');
      })
    );
  }
});

// Handle service worker messages
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Global error handler
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service worker unhandled promise rejection:', event.reason);
});

console.log('Service Worker: Loaded and ready');
