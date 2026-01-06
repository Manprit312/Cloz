import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { TranslationService, AuthService } from '@app-core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { translations } from '@translations';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private translate = inject(TranslationService);
  private authService = inject(AuthService);
  private appStateListener?: any; // PluginListenerHandle from Capacitor

  constructor() {
    this.translate.init();
  }

  ngOnInit() {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-is-open');
    });
    
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-is-open');
    });
    
    // Apply backdrop blur to all Ionic backdrops as they're created
    // This ensures blur is applied even if CSS doesn't catch them
    this.applyBackdropBlur();
    
    // Watch for new backdrops being added to the DOM
    const observer = new MutationObserver(() => {
      this.applyBackdropBlur();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Listen for app state changes (foreground/background)
    this.setupAppStateListener();
    
    // Validate session when app initializes (in case it was closed and reopened)
    this.validateSessionOnStartup();
  }

  ngOnDestroy() {
    // Clean up app state listener if needed
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
  }

  /**
   * Setup listener for app state changes (foreground/background)
   */
  private async setupAppStateListener(): Promise<void> {
    this.appStateListener = await App.addListener('appStateChange', async ({ isActive }) => {
      if (isActive) {
        // App came to foreground - validate session
        // But skip validation if user is on verification page (they might be checking email)
        const currentUrl = window.location.pathname;
        if (currentUrl.includes('/verification')) {
          console.log('AppComponent - App came to foreground, but user is on verification page, skipping session validation');
          return;
        }
        
        console.log('AppComponent - App came to foreground, validating session');
        await this.authService.validateSessionOnResume();
      } else {
        console.log('AppComponent - App went to background');
      }
    });
  }

  /**
   * Validate session when app starts up
   * This handles the case where app was closed and reopened after some time
   */
  private async validateSessionOnStartup(): Promise<void> {
    // Small delay to ensure auth service is fully initialized
    setTimeout(async () => {
      // Check if user data exists (even if token is missing/expired)
      // validateSessionOnResume will handle checking for token and redirecting if needed
      if (this.authService.isLoggedIn()) {
        console.log('AppComponent - Validating session on startup');
        const isValid = await this.authService.validateSessionOnResume();
        if (!isValid) {
          console.log('AppComponent - Session validation failed, user should be redirected to login');
        }
      }
    }, 1000);
  }

  private applyBackdropBlur() {
    // Find all ion-backdrop elements (used by both alerts and modals) and apply blur
    const backdrops = document.querySelectorAll('ion-backdrop');
    
    backdrops.forEach((backdrop: Element) => {
      const htmlElement = backdrop as HTMLElement;
      // Increased blur for better visual effect (16px instead of 8px)
      htmlElement.style.backdropFilter = 'blur(16px)';
      // Use setProperty for webkit prefix to avoid TypeScript error
      htmlElement.style.setProperty('-webkit-backdrop-filter', 'blur(16px)');
    });
  }
}
