// PWA utilities for HealthATM+
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

// PWA installation utilities
export class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('HealthATM+ PWA was installed');
      this.isInstalled = true;
      this.hideInstallButton();
    });

    // Check if already installed
    this.checkIfInstalled();
  }

  // Check if PWA is already installed
  private checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return true;
    }

    // Check if running as PWA on iOS
    if ((window.navigator as any).standalone) {
      this.isInstalled = true;
      return true;
    }

    return false;
  }

  // Show install button
  private showInstallButton() {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton && !this.isInstalled) {
      installButton.style.display = 'block';
    }
  }

  // Hide install button
  private hideInstallButton() {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  // Trigger PWA installation
  public async installPWA(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('PWA installation not available');
      return false;
    }

    try {
      // Show the installation prompt
      this.deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      
      if (outcome === 'accepted') {
        console.log('User accepted PWA installation');
        return true;
      } else {
        console.log('User dismissed PWA installation');
        return false;
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  }

  // Check if installation is available
  public canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  // Get installation status
  public getInstallationStatus(): 'installed' | 'installable' | 'not-installable' {
    if (this.isInstalled) return 'installed';
    if (this.deferredPrompt) return 'installable';
    return 'not-installable';
  }
}

// Service Worker registration and management
export class ServiceWorkerManager {
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.registerServiceWorker();
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        console.log('Registering HealthATM+ Service Worker...');
        
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully:', this.swRegistration);

        // Listen for updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration!.installing;
          if (newWorker) {
            this.handleServiceWorkerUpdate(newWorker);
          }
        });

        // Check for updates every 30 minutes
        setInterval(() => {
          this.swRegistration?.update();
        }, 30 * 60 * 1000);

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private handleServiceWorkerUpdate(worker: ServiceWorker) {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          this.showUpdateNotification();
        }
      }
    });
  }

  private showUpdateNotification() {
    // Show update notification to user
    const updateBar = document.createElement('div');
    updateBar.className = 'fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 text-center z-50';
    updateBar.innerHTML = `
      <span>New version available!</span>
      <button id="sw-update-btn" class="ml-4 bg-blue-800 px-3 py-1 rounded">Update</button>
      <button id="sw-dismiss-btn" class="ml-2 text-blue-200">×</button>
    `;
    
    document.body.prepend(updateBar);

    // Handle update button click
    document.getElementById('sw-update-btn')?.addEventListener('click', () => {
      this.updateServiceWorker();
      updateBar.remove();
    });

    // Handle dismiss button click
    document.getElementById('sw-dismiss-btn')?.addEventListener('click', () => {
      updateBar.remove();
    });
  }

  private updateServiceWorker() {
    if (this.swRegistration?.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  // Get offline status
  public async getOfflineStatus(): Promise<boolean> {
    if (!navigator.serviceWorker.controller) {
      return !navigator.onLine;
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.isOffline);
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_OFFLINE_STATUS' },
        [messageChannel.port2]
      );
    });
  }
}

// Network monitoring
export class NetworkMonitor {
  private callbacks: Array<(isOnline: boolean) => void> = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.init();
  }

  private init() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyCallbacks(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyCallbacks(false);
    });

    // Additional network quality monitoring
    this.monitorNetworkQuality();
  }

  private monitorNetworkQuality() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnectionInfo = () => {
        const quality = this.getNetworkQuality(connection);
        console.log('Network quality:', quality);
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }
  }

  private getNetworkQuality(connection: any): 'slow' | 'medium' | 'fast' {
    const downlink = connection.downlink || 0;
    const effectiveType = connection.effectiveType || '';

    if (effectiveType === '4g' && downlink > 5) return 'fast';
    if (effectiveType === '3g' || (effectiveType === '4g' && downlink > 1)) return 'medium';
    return 'slow';
  }

  private notifyCallbacks(isOnline: boolean) {
    this.callbacks.forEach(callback => callback(isOnline));
  }

  // Subscribe to network status changes
  public onNetworkChange(callback: (isOnline: boolean) => void) {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  // Get current network status
  public getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      quality: this.getNetworkQualityStatus()
    };
  }

  private getNetworkQualityStatus(): 'slow' | 'medium' | 'fast' | 'unknown' {
    if ('connection' in navigator) {
      return this.getNetworkQuality((navigator as any).connection);
    }
    return 'unknown';
  }
}

// Initialize PWA utilities
export function initializePWA() {
  const pwaManager = new PWAManager();
  const swManager = new ServiceWorkerManager();
  const networkMonitor = new NetworkMonitor();

  // Expose to global scope for debugging
  (window as any).HealthATM_PWA = {
    pwaManager,
    swManager,
    networkMonitor
  };

  return {
    pwaManager,
    swManager,
    networkMonitor
  };
}

// Performance monitoring for rural connectivity
export function trackPerformance() {
  if ('performance' in window) {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log('Page load time:', loadTime + 'ms');
      
      // Log performance for offline analysis
      const perfData = {
        loadTime,
        domContentLoaded: performance.getEntriesByType('navigation')[0],
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('healthatm-perf', JSON.stringify(perfData));
    });
  }
}

// Storage management for offline data
export class OfflineStorage {
  private dbName = 'healthatm-offline';
  private version = 1;

  async storePatientData(data: any) {
    const db = await this.openDB();
    const tx = db.transaction(['patients'], 'readwrite');
    const store = tx.objectStore('patients');
    await store.put(data);
  }

  async getPatientData(id: string) {
    const db = await this.openDB();
    const tx = db.transaction(['patients'], 'readonly');
    const store = tx.objectStore('patients');
    return await store.get(id);
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('patients')) {
          db.createObjectStore('patients', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('medicines')) {
          db.createObjectStore('medicines', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('consultations')) {
          db.createObjectStore('consultations', { keyPath: 'id' });
        }
      };
    });
  }
}