// HealthATM+ Service Worker - Offline-first architecture
const CACHE_NAME = 'healthatm-v1.0.0';
const STATIC_CACHE_NAME = 'healthatm-static-v1.0.0';
const RUNTIME_CACHE_NAME = 'healthatm-runtime-v1.0.0';

// Critical resources to cache for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json'
];

// Runtime cache resources (API responses, images)
const RUNTIME_RESOURCES = [
  '/api/patients',
  '/api/medicines',
  '/api/consultation'
];

// Install event - Cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing HealthATM+ Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache critical static resources
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Initialize runtime cache
      caches.open(RUNTIME_CACHE_NAME).then((cache) => {
        console.log('[SW] Runtime cache initialized');
        return cache;
      })
    ])
  );
  
  // Force activation of new service worker
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating HealthATM+ Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== RUNTIME_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - Implement offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // Static resources - Cache First strategy
    if (isStaticResource(request)) {
      event.respondWith(cacheFirst(request));
    }
    // API requests - Network First with fallback
    else if (isAPIRequest(request)) {
      event.respondWith(networkFirst(request));
    }
    // Images and media - Cache First
    else if (isMediaRequest(request)) {
      event.respondWith(cacheFirst(request));
    }
    // Default - Network First
    else {
      event.respondWith(networkFirst(request));
    }
  }
  // POST/PUT requests - Network only with offline queue
  else if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    event.respondWith(handleWriteRequest(request));
  }
});

// Cache First Strategy - For static resources
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Update cache in background if needed
      updateCacheInBackground(request);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    await updateCache(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return getOfflineFallback(request);
  }
}

// Network First Strategy - For dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      await updateCache(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

// Handle POST/PUT requests with offline queue
async function handleWriteRequest(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Store request in IndexedDB for later sync
    await storeOfflineRequest(request);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        queued: true,
        message: 'Request queued for when online' 
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Update cache with new response
async function updateCache(request, response) {
  const cacheName = isStaticResource(request) ? STATIC_CACHE_NAME : RUNTIME_CACHE_NAME;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
}

// Background cache update
async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await updateCache(request, response);
    }
  } catch (error) {
    // Silently fail background updates
    console.log('[SW] Background update failed:', error);
  }
}

// Resource type detection
function isStaticResource(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|html|svg|woff2?|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/functions/');
}

function isMediaRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/);
}

// Offline fallbacks
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // HTML pages - return cached index.html
  if (request.headers.get('accept')?.includes('text/html')) {
    return caches.match('/');
  }
  
  // API requests - return offline data
  if (isAPIRequest(request)) {
    return new Response(
      JSON.stringify(getOfflineData(url.pathname)),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
  
  // Default fallback
  return new Response('Offline', { status: 503 });
}

// Store offline requests in IndexedDB
async function storeOfflineRequest(request) {
  try {
    const db = await openDB();
    const tx = db.transaction(['offline-requests'], 'readwrite');
    const store = tx.objectStore('offline-requests');
    
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: await request.text(),
      timestamp: Date.now()
    };
    
    await store.add(requestData);
    await tx.complete;
    
    console.log('[SW] Stored offline request:', request.url);
  } catch (error) {
    console.error('[SW] Failed to store offline request:', error);
  }
}

// Open IndexedDB for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('healthatm-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create offline requests store
      if (!db.objectStoreNames.contains('offline-requests')) {
        const store = db.createObjectStore('offline-requests', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        store.createIndex('timestamp', 'timestamp');
      }
      
      // Create offline data store
      if (!db.objectStoreNames.contains('offline-data')) {
        db.createObjectStore('offline-data', { keyPath: 'key' });
      }
    };
  });
}

// Get offline data for API requests
function getOfflineData(pathname) {
  const offlineResponses = {
    '/api/patients': {
      success: true,
      data: {
        name: "ਰਮਨਜੀਤ ਸਿੰਘ",
        age: 45,
        lastVisit: "2025-01-10",
        conditions: ["ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ", "ਡਾਇਬੀਟਿਸ"]
      }
    },
    '/api/medicines': {
      success: true,
      data: [
        { name: "Paracetamol", stock: true, pharmacy: "Nabha Medical Store" },
        { name: "Metformin", stock: true, pharmacy: "Punjab Pharmacy" },
        { name: "Amlodipine", stock: false, pharmacy: "Village Clinic" }
      ]
    },
    '/api/consultation': {
      success: true,
      data: { 
        status: 'queued',
        message: 'Your consultation request has been queued and will be processed when connection is restored'
      }
    }
  };
  
  return offlineResponses[pathname] || { 
    success: false, 
    error: 'Resource not available offline' 
  };
}

// Sync event - Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-requests-sync') {
    event.waitUntil(syncOfflineRequests());
  }
});

// Sync offline requests when back online
async function syncOfflineRequests() {
  try {
    const db = await openDB();
    const tx = db.transaction(['offline-requests'], 'readonly');
    const store = tx.objectStore('offline-requests');
    const requests = await store.getAll();
    
    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (response.ok) {
          // Remove synced request from storage
          const deleteTx = db.transaction(['offline-requests'], 'readwrite');
          const deleteStore = deleteTx.objectStore('offline-requests');
          await deleteStore.delete(requestData.id);
          
          console.log('[SW] Synced offline request:', requestData.url);
        }
      } catch (error) {
        console.error('[SW] Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Message handling for PWA features
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_OFFLINE_STATUS') {
    event.ports[0].postMessage({
      type: 'OFFLINE_STATUS',
      isOffline: !navigator.onLine
    });
  }
});

console.log('[SW] HealthATM+ Service Worker loaded successfully');