const CACHE = 'kananote-v18';
const ASSETS = [
  './', './index.html', './styles.css', './styles.css?v=12', './base.css', './base.css?v=2', './study.css', './chart.css',
  './writing.css', './writing.css?v=4', './words.css', './words.css?v=7', './navigation.css', './responsive.css', './responsive.css?v=2',
  './manifest.webmanifest', './manifest.webmanifest?v=10',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './app.js', './app.js?v=16', './ui.js', './state.js', './storage.js', './seed.js', './seed_words.json', './kana.js', './kana.js?v=16',
  './review.js', './study.js', './chart.js', './chart.js?v=16', './writing.js', './writing.js?v=16', './words.js', './backup.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./index.html'))));
});

