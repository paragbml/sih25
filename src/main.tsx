import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import PWA utilities
import { initializePWA, trackPerformance } from './utils/pwa.ts';
import { initializeAccessibility } from './utils/accessibility.ts';

// Initialize PWA features
const pwaUtils = initializePWA();
const accessibilityUtils = initializeAccessibility();

// Track performance for rural optimization
trackPerformance();

// Update page title for PWA
document.title = 'HealthATM+ | ਤੁਹਾਡਾ ਪਿੰਡ ਕਲੀਨਿਕ';

// Create root and render app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Add PWA install button to the app
const addInstallButton = () => {
  const installButton = document.createElement('button');
  installButton.id = 'pwa-install-btn';
  installButton.className = 'fixed bottom-20 left-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 z-40';
  installButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  `;
  installButton.setAttribute('aria-label', 'Install HealthATM+ App');
  installButton.style.display = 'none';
  
  installButton.addEventListener('click', async () => {
    const success = await pwaUtils.pwaManager.installPWA();
    if (success) {
      installButton.style.display = 'none';
    }
  });
  
  document.body.appendChild(installButton);
};

// Add install button when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addInstallButton);
} else {
  addInstallButton();
}

// Add accessibility toolbar
const addAccessibilityToolbar = () => {
  const toolbar = document.createElement('div');
  toolbar.className = 'fixed top-16 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-50 hidden';
  toolbar.id = 'accessibility-toolbar';
  
  toolbar.innerHTML = `
    <div class="flex flex-col space-y-2">
      <button id="toggle-contrast" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
        High Contrast
      </button>
      <button id="increase-font" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
        Font Size +
      </button>
      <button id="decrease-font" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
        Font Size -
      </button>
    </div>
  `;
  
  document.body.appendChild(toolbar);
  
  // Add toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'fixed top-20 right-4 bg-blue-600 text-white p-2 rounded-full z-50';
  toggleButton.innerHTML = '⚙️';
  toggleButton.setAttribute('aria-label', 'Accessibility Options');
  
  toggleButton.addEventListener('click', () => {
    toolbar.classList.toggle('hidden');
  });
  
  document.body.appendChild(toggleButton);
  
  // Bind accessibility controls
  document.getElementById('toggle-contrast')?.addEventListener('click', () => {
    accessibilityUtils.accessibility.toggleHighContrast();
  });
  
  document.getElementById('increase-font')?.addEventListener('click', () => {
    accessibilityUtils.accessibility.increaseFontSize();
  });
  
  document.getElementById('decrease-font')?.addEventListener('click', () => {
    accessibilityUtils.accessibility.decreaseFontSize();
  });
};

// Add accessibility toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addAccessibilityToolbar);
} else {
  addAccessibilityToolbar();
}

// Announce app ready to screen readers
setTimeout(() => {
  accessibilityUtils.screenReader.announce(
    'HealthATM+ ਲੋਡ ਹੋ ਗਿਆ ਹੈ। ਸਿਹਤ ਜਾਂਚ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਤਿਆਰ ਹੈ।',
    'polite'
  );
}, 2000);

// Log initialization complete
console.log('HealthATM+ PWA initialized successfully');
console.log('PWA Features:', pwaUtils);
console.log('Accessibility Features:', accessibilityUtils);