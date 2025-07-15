import { precacheAndRoute } from 'workbox-precaching';

// Precache files injected by Webpack
// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST);

// Handle skipWaiting via message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Claim all clients immediately on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
