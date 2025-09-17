// Accessibility utilities for HealthATM+
export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Text-to-Speech manager for multi-lanuage support
export class TextToSpeechManager {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentLang: string = 'pa-IN';

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();

    // Listen for voices loaded event
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
    console.log('Available voices:', this.voices);
  }

  // Speak text with language detection
  public speak(text: string, options: SpeechOptions = {}) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language
    utterance.lang = options.lang || this.currentLang;

    // Find appropriate voice
    const voice = this.findBestVoice(utterance.lang);
    if (voice) {
      utterance.voice = voice;
    }

    // Set speech parameters optimized for rural users
    utterance.rate = options.rate || 0.8; // Slower rate for clarity
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Error handling
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
    };

    this.synthesis.speak(utterance);
  }

  private findBestVoice(lang: string): SpeechSynthesisVoice | null {
    // Try to find exact language match
    let voice = this.voices.find(v => v.lang === lang);

    // Fallback to language family (e.g., 'pa' for 'pa-IN')
    if (!voice) {
      const langFamily = lang.split('-')[0];
      voice = this.voices.find(v => v.lang.startsWith(langFamily));
    }

    // Fallback to default voice
    if (!voice && this.voices.length > 0) {
      voice = this.voices[0];
    }

    return voice || null;
  }

  // Set current language
  public setLanguage(lang: string) {
    this.currentLang = lang;
  }

  // Stop current speech
  public stop() {
    this.synthesis.cancel();
  }

  // Get available voices for a language
  public getVoicesForLanguage(lang: string): SpeechSynthesisVoice[] {
    return this.voices.filter(voice =>
      voice.lang.startsWith(lang.split('-')[0])
    );
  }
}

// High contrast and visual accessibility
export class AccessibilityManager {
  private currentTheme: 'normal' | 'high-contrast' = 'normal';
  private fontSize: 'normal' | 'large' | 'extra-large' = 'normal';

  constructor() {
    this.loadPreferences();
    this.applyAccessibilitySettings();
  }

  // Toggle high contrast mode
  public toggleHighContrast() {
    this.currentTheme = this.currentTheme === 'normal' ? 'high-contrast' : 'normal';
    this.applyTheme();
    this.savePreferences();
  }

  // Increase font size
  public increaseFontSize() {
    const sizes: Array<'normal' | 'large' | 'extra-large'> = ['normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(this.fontSize);

    if (currentIndex < sizes.length - 1) {
      this.fontSize = sizes[currentIndex + 1];
      this.applyFontSize();
      this.savePreferences();
    }
  }

  // Decrease font size
  public decreaseFontSize() {
    const sizes: Array<'normal' | 'large' | 'extra-large'> = ['normal', 'large', 'extra-large'];
    const currentIndex = sizes.indexOf(this.fontSize);

    if (currentIndex > 0) {
      this.fontSize = sizes[currentIndex - 1];
      this.applyFontSize();
      this.savePreferences();
    }
  }

  private applyTheme() {
    const root = document.documentElement;

    if (this.currentTheme === 'high-contrast') {
      root.classList.add('high-contrast');
      // Apply high contrast colors
      root.style.setProperty('--bg-primary', '#000000');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--accent-color', '#00ff00');
      root.style.setProperty('--border-color', '#ffffff');
    } else {
      root.classList.remove('high-contrast');
      // Reset to normal colors
      root.style.removeProperty('--bg-primary');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--accent-color');
      root.style.removeProperty('--border-color');
    }
  }

  private applyFontSize() {
    const root = document.documentElement;
    const fontSizeMap = {
      'normal': '16px',
      'large': '20px',
      'extra-large': '24px'
    };

    root.style.setProperty('--base-font-size', fontSizeMap[this.fontSize]);
  }

  private applyAccessibilitySettings() {
    this.applyTheme();
    this.applyFontSize();

    // Add focus indicators
    this.addFocusIndicators();

    // Ensure minimum touch targets
    this.ensureMinimumTouchTargets();
  }

  private addFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 3px solid #007cba;
        outline-offset: 2px;
      }
      
      button:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 3px solid #007cba;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  private ensureMinimumTouchTargets() {
    const style = document.createElement('style');
    style.textContent = `
      button, 
      .clickable,
      input[type="button"],
      input[type="submit"] {
        min-height: 48px;
        min-width: 48px;
        padding: 12px;
      }
      
      .touch-target {
        min-height: 48px;
        min-width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
    document.head.appendChild(style);
  }

  private savePreferences() {
    const preferences = {
      theme: this.currentTheme,
      fontSize: this.fontSize
    };

    localStorage.setItem('healthatm-accessibility', JSON.stringify(preferences));
  }

  private loadPreferences() {
    const stored = localStorage.getItem('healthatm-accessibility');
    if (stored) {
      try {
        const preferences = JSON.parse(stored);
        this.currentTheme = preferences.theme || 'normal';
        this.fontSize = preferences.fontSize || 'normal';
      } catch (error) {
        console.error('Failed to load accessibility preferences:', error);
      }
    }
  }

  // Get current settings
  public getSettings() {
    return {
      theme: this.currentTheme,
      fontSize: this.fontSize
    };
  }
}

// Keyboard navigation helper
export class KeyboardNavigationManager {
  private focusableElements: string = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  private currentFocusIndex: number = 0;
  private elements: NodeListOf<HTMLElement> | null = null;

  constructor() {
    this.initKeyboardNavigation();
  }

  private initKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardNavigation(event);
    });

    // Update focusable elements when DOM changes
    const observer = new MutationObserver(() => {
      this.updateFocusableElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private handleKeyboardNavigation(event: KeyboardEvent) {
    // Handle arrow key navigation for mobile-like experience
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      this.navigateWithArrows(event.key);
    }

    // Handle Enter key as touch
    if (event.key === 'Enter' || event.key === ' ') {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.click) {
        event.preventDefault();
        activeElement.click();
      }
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      this.handleEscape();
    }
  }

  private navigateWithArrows(direction: string) {
    this.updateFocusableElements();

    if (!this.elements || this.elements.length === 0) return;

    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = Array.from(this.elements).indexOf(currentElement);

    let newIndex: number;

    switch (direction) {
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : this.elements.length - 1;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = currentIndex < this.elements.length - 1 ? currentIndex + 1 : 0;
        break;
      default:
        return;
    }

    this.elements[newIndex].focus();
  }

  private updateFocusableElements() {
    this.elements = document.querySelectorAll(this.focusableElements);
  }

  private handleEscape() {
    // Close modals, go back, etc.
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      const closeButton = activeModal.querySelector('.close-button');
      if (closeButton) {
        (closeButton as HTMLElement).click();
      }
    }
  }

  // Trap focus within a container (for modals)
  public trapFocus(container: HTMLElement) {
    const focusable = container.querySelectorAll(this.focusableElements);
    const firstFocusable = focusable[0] as HTMLElement;
    const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

    container.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    });

    // Focus first element
    firstFocusable?.focus();
  }
}

// Screen reader announcements
export class ScreenReaderManager {
  private liveRegion: HTMLElement;

  constructor() {
    this.createLiveRegion();
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.liveRegion);
  }

  // Announce message to screen readers
  public announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    this.liveRegion.setAttribute('aria-live', priority);

    // Clear and set new message
    this.liveRegion.textContent = '';
    setTimeout(() => {
      this.liveRegion.textContent = message;
    }, 100);
  }

  // Announce status changes
  public announceStatus(status: string, context: string = '') {
    const message = context ? `${context}: ${status}` : status;
    this.announce(message, 'assertive');
  }
}

// Initialize all accessibility features
export function initializeAccessibility() {
  const tts = new TextToSpeechManager();
  const accessibility = new AccessibilityManager();
  const keyboard = new KeyboardNavigationManager();
  const screenReader = new ScreenReaderManager();

  // Expose to global scope for debugging and manual control
  (window as any).HealthATM_Accessibility = {
    tts,
    accessibility,
    keyboard,
    screenReader
  };

  return {
    tts,
    accessibility,
    keyboard,
    screenReader
  };
}

// Utility function to make any element speak its content
export function makeSpeakable(element: HTMLElement, tts: TextToSpeechManager, lang?: string) {
  const button = document.createElement('button');
  button.className = 'speak-button';
  button.innerHTML = '🔊';
  button.setAttribute('aria-label', 'Listen to this content');
  button.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
  `;

  button.addEventListener('click', () => {
    const text = element.textContent || element.innerText;
    if (text) {
      tts.speak(text, { lang });
    }
  });

  element.style.position = 'relative';
  element.appendChild(button);
}
