/// <reference types="vite-plugin-pwa/client" />

// Declare module for virtual:pwa-register
declare module 'virtual:pwa-register' {
  // Return type of the registerSW function
  export type RegisterSWOptions = {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
  };

  // Export the registerSW function
  export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
