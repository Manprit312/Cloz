import { Component, Input, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
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
export class OutfitNamingModalComponent implements OnInit {
  @Input() suggestedNames: string[] = [];
  @ViewChild('customNameInput', { read: ElementRef }) customNameInput?: ElementRef<HTMLInputElement>;
  
  selectedName: string = '';
  customName: string = '';
  isCustomName: boolean = false;
  private isDismissing = false; // Prevent multiple dismissals

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
            
            // Also try to scroll the parent container
            const container = input.closest('ion-content');
            if (container) {
              const scrollElement = container.shadowRoot?.querySelector('.inner-scroll') || container;
              if (scrollElement && 'scrollTo' in scrollElement) {
                (scrollElement as any).scrollTo({
                  top: input.offsetTop - 100,
                  behavior: 'smooth'
                });
              }
            }
          }, 500);
        }
      }, 200);
    }
  }

  onCustomNameFocus() {
    // Scroll input into view when it gets focus (keyboard appears)
    setTimeout(() => {
      if (this.customNameInput?.nativeElement) {
        const input = this.customNameInput.nativeElement;
        input.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 300);
  }

  async onCustomNameBlur() {
    // Auto-submit if custom name has value when input loses focus
    // Use setTimeout to avoid race conditions with focus events
    setTimeout(() => {
    if (this.customName.trim().length > 0) {
      this.assignName();
    }
    }, 100);
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
}

