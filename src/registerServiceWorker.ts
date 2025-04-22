/**
 * Service worker registration for PWA functionality
 * Handles caching, offline support, and updates
 */

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service worker registered: ', registration);
        })
        .catch(error => {
          console.error('Service worker registration failed: ', error);
        });
    });
  }
}

/**
 * Detects if the app is running offline
 * @returns boolean indicating if the app is offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Add listener for online/offline events
 * @param onOffline callback for offline event
 * @param onOnline callback for online event
 */
export function addConnectivityListeners(
  onOffline: () => void,
  onOnline: () => void
): void {
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);
}

/**
 * Remove listeners for online/offline events
 * @param onOffline callback for offline event
 * @param onOnline callback for online event
 */
export function removeConnectivityListeners(
  onOffline: () => void,
  onOnline: () => void
): void {
  window.removeEventListener('offline', onOffline);
  window.removeEventListener('online', onOnline);
}
