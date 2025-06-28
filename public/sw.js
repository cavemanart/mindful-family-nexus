
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
  '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
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

// Handle background sync (for future offline functionality)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Add background sync logic here
      console.log('Background sync triggered')
    );
  }
});

// Enhanced push notification handler with different notification types
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData;
  
  try {
    // Try to parse the push data
    notificationData = event.data ? event.data.json() : {};
  } catch (error) {
    console.error('Error parsing push data:', error);
    notificationData = {};
  }

  // Define notification types and their configurations
  const notificationTypes = {
    'chore_reminder': {
      title: '🏠 Chore Reminder',
      body: notificationData.message || 'You have chores to complete!',
      icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      badge: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      tag: 'chore-reminder',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Chores', icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'bill_reminder': {
      title: '💰 Bill Due Soon',
      body: notificationData.message || 'You have bills due soon!',
      icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      badge: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      tag: 'bill-reminder',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Bills', icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'family_message': {
      title: '💬 New Family Message',
      body: notificationData.message || 'You have a new family message!',
      icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      badge: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      tag: 'family-message',
      actions: [
        { action: 'view', title: 'View Message', icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'calendar_event': {
      title: '📅 Upcoming Event',
      body: notificationData.message || 'You have an upcoming event!',
      icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      badge: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      tag: 'calendar-event',
      actions: [
        { action: 'view', title: 'View Event', icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'mvp_announcement': {
      title: '⭐ MVP of the Day!',
      body: notificationData.message || 'Check out today\'s MVP!',
      icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      badge: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      tag: 'mvp-announcement',
      actions: [
        { action: 'view', title: 'View MVP', icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    },
    'default': {
      title: '🏠 Hublie',
      body: notificationData.message || 'You have a new notification!',
      icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      badge: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png',
      tag: 'general',
      actions: [
        { action: 'view', title: 'Open App', icon: '/lovable-uploads/ad26d0f4-2b94-4736-96fd-7cad06272616.png' },
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
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || 1,
      type: notificationType,
      url: notificationData.url || '/dashboard',
      ...notificationData
    }
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  let targetUrl = '/dashboard';

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
      default:
        targetUrl = notificationData.url || '/dashboard';
    }
  } else if (event.action === 'dismiss') {
    // Just close the notification, don't open the app
    return;
  } else {
    // Default click action (no specific action button clicked)
    targetUrl = notificationData.url || '/dashboard';
  }

  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        
        // Open new window if app isn't open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle notification close events (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
  
  // You could send analytics data here about notification dismissals
  const notificationData = event.notification.data || {};
  
  // Optional: Track notification dismissals
  // fetch('/api/track-notification-close', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     type: notificationData.type,
  //     dismissedAt: Date.now()
  //   })
  // });
});
