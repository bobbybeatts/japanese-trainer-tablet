const CACHE = 'kananote-v12';
const ASSETS = [
  './', './index.html', './styles.css', './styles.css?v=9', './base.css', './study.css', './chart.css',
  './writing.css', './words.css', './words.css?v=7', './navigation.css', './responsive.css',
  './manifest.webmanifest', './manifest.webmanifest?v=10',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
  './app.js', './ui.js', './state.js', './storage.js', './seed.js', './seed_words.json', './kana.js',
  './review.js', './study.js', './chart.js', './writing.js', './words.js', './backup.js'
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
