import { Component, Input, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, ElementRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  ModalController,
  IonList,
} from '@ionic/angular/standalone';
import { IconComponent } from '../icon/icon.component';
import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import type { PluginListenerHandle } from '@capacitor/core';

@Component({
  selector: 'app-outfit-naming-modal',
  templateUrl: './outfit-naming-modal.component.html',
  styleUrls: ['./outfit-naming-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IconComponent,
  ],
})
export class OutfitNamingModalComponent implements OnInit, OnDestroy {
  @Input() suggestedNames: string[] = [];
  @ViewChild('customNameInput', { read: ElementRef }) customNameInput?: ElementRef<HTMLInputElement>;
  @ViewChild(IonContent) content?: IonContent;

  @HostBinding('style.--keyboard-height') keyboardHeight = '0px';
  
  selectedName: string = '';
  customName: string = '';
  isCustomName: boolean = false;
  private isDismissing = false; // Prevent multiple dismissals
  private keyboardShowListener?: PluginListenerHandle;
  private keyboardHideListener?: PluginListenerHandle;

  constructor(
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Set first suggested name as default if available
    if (this.suggestedNames && this.suggestedNames.length > 0) {
      this.selectedName = this.suggestedNames[0];
    }
  }

  ngOnDestroy() {
    this.keyboardShowListener?.remove();
    this.keyboardHideListener?.remove();
  }

  selectName(name: string, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Prevent multiple dismissals
    if (this.isDismissing) {
      return;
    }
    
    this.isDismissing = true;
    
    // Update selection state immediately and synchronously
    this.selectedName = name;
    this.isCustomName = false;
    
    // Force change detection to update UI
    this.cdr.detectChanges();
    
    // Dismiss immediately - no delay needed
    this.modalController.dismiss(name, 'confirm').catch(() => {
      // Ignore errors
      this.isDismissing = false;
    });
  }

  toggleCustomName(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (!this.isCustomName) {
      this.isCustomName = true;
      this.customName = '';
      this.selectedName = ''; // Clear selected name when switching to custom
      // Force change detection
      this.cdr.detectChanges();
      // Start listening for keyboard height so we can pad the content
      void this.startKeyboardListeners();

      // Focus on input after a brief delay to ensure it's rendered
      setTimeout(() => {
        if (this.customNameInput?.nativeElement) {
          const input = this.customNameInput.nativeElement;
          input.focus();
          
          // Scroll input into view when keyboard appears - use longer delay for keyboard
          setTimeout(() => {
            input.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            });
            
            this.scrollInputIntoView();
          }, 500);
        }
      }, 200);
    }
  }

  onCustomNameFocus() {
    // Scroll input into view when it gets focus (keyboard appears)
    setTimeout(() => {
      this.scrollInputIntoView();
    }, 300);
    void this.expandModalForKeyboard();
  }

  async onCustomNameBlur() {
    // Auto-submit if custom name has value when input loses focus
    // Use setTimeout to avoid race conditions with focus events
    setTimeout(() => {
    if (this.customName.trim().length > 0) {
      this.assignName();
    }
    }, 100);
    void this.resetModalBreakpoint();
  }

  onCustomNameEnter() {
    // Auto-submit when user presses Enter
    if (this.customName.trim().length > 0) {
      this.assignName();
    }
  }

  cancel() {
    if (this.isDismissing) {
      return;
    }
    this.isDismissing = true;
    this.modalController.dismiss(null, 'cancel').catch(() => {
      this.isDismissing = false;
    });
  }

  assignName() {
    if (this.isDismissing) {
      return;
    }
    const finalName = this.customName.trim();
    if (finalName) {
      this.isDismissing = true;
      this.modalController.dismiss(finalName, 'confirm').catch(() => {
        this.isDismissing = false;
      });
    }
  }

  private async startKeyboardListeners() {
    if (this.keyboardShowListener || this.keyboardHideListener) {
      return;
    }
    this.keyboardShowListener = await Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      this.keyboardHeight = `${info.keyboardHeight || 0}px`;
      this.cdr.detectChanges();
    });
    this.keyboardHideListener = await Keyboard.addListener('keyboardWillHide', () => {
      this.keyboardHeight = '0px';
      this.cdr.detectChanges();
    });
  }

  private async scrollInputIntoView() {
    if (!this.customNameInput?.nativeElement) {
      return;
    }
    const input = this.customNameInput.nativeElement;
    input.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });

    if (this.content) {
      const scrollTop = Math.max(input.offsetTop - 120, 0);
      try {
        await this.content.scrollToPoint(0, scrollTop, 300);
      } catch {
        // Ignore scroll errors
      }
    }
  }

  private async expandModalForKeyboard() {
    try {
      const modal = await this.modalController.getTop();
      if (modal && typeof (modal as HTMLIonModalElement).setCurrentBreakpoint === 'function') {
        await (modal as HTMLIonModalElement).setCurrentBreakpoint(0.9);
      }
    } catch {
      // Ignore modal errors
    }
  }

  private async resetModalBreakpoint() {
    try {
      const modal = await this.modalController.getTop();
      if (modal && typeof (modal as HTMLIonModalElement).setCurrentBreakpoint === 'function') {
        await (modal as HTMLIonModalElement).setCurrentBreakpoint(0.5);
      }
    } catch {
      // Ignore modal errors
    }
  }
}

