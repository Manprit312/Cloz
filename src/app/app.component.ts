import { Component, inject, OnInit } from '@angular/core';
import { TranslationService, AuthService } from '@app-core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { translations } from '@translations';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private translate = inject(TranslationService);
  private authService = inject(AuthService);

  constructor() {
    this.translate.init();
  }

  ngOnInit() {
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
