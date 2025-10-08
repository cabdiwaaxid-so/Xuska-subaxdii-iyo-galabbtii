const CACHE_NAME = 'xuska-v2';
const ASSETS = [
  './',
  './index.html',
  './data.json',
  './styles.css',
  './script.js',
  './so.json',
  './en.json',
  './ar.json',
  './logo.jpg',
  './manifest.json'
];

// Install & cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate & clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Serve cached assets first (offline support)
self.addEventListener('fetch', event => {
  const req = event.request;

  // Always serve index.html for navigation requests
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(cached => 
        cached || fetch(req).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // Try cache first, fallback to network
  event.respondWith(
    caches.match(req).then(cached => 
      cached || fetch(req).then(res => {
        // Only cache GET and valid responses
        if (req.method === 'GET' && res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
