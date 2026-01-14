import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private isOnlineSubject = new BehaviorSubject<boolean>(true);
  public isOnline$: Observable<boolean> = this.isOnlineSubject.asObservable();
  private alertShown = false;
  private currentAlert?: HTMLIonAlertElement;

  constructor(private alertController: AlertController) {
    this.initializeNetworkListener();
  }

  /**
   * Initialize network status listener
   */
  private async initializeNetworkListener(): Promise<void> {
    // Get current network status
    const status = await Network.getStatus();
    this.isOnlineSubject.next(status.connected);
    console.log('NetworkService - Initial network status:', status.connected ? 'Online' : 'Offline');

    // Listen for network status changes
    Network.addListener('networkStatusChange', (status) => {
      console.log('NetworkService - Network status changed:', status.connected ? 'Online' : 'Offline');
      this.isOnlineSubject.next(status.connected);

      if (!status.connected) {
        this.showOfflineAlert();
      } else {
        this.dismissOfflineAlert();
      }
    });
  }

  /**
   * Get current online status
   */
  isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  /**
   * Get current network status
   */
  async getNetworkStatus() {
    return await Network.getStatus();
  }

  /**
   * Show offline alert
   */
  private async showOfflineAlert(): Promise<void> {
    if (this.alertShown || this.currentAlert) {
      return;
    }

    this.alertShown = true;
    this.currentAlert = await this.alertController.create({
      header: 'No Internet Connection',
      message: 'Please check your internet connection and try again.',
      backdropDismiss: false,
      cssClass: 'offline-alert',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            this.alertShown = false;
            this.currentAlert = undefined;
          },
        },
      ],
    });

    await this.currentAlert.present();
  }

  /**
   * Dismiss offline alert when connection is restored
   */
  private async dismissOfflineAlert(): Promise<void> {
    if (this.currentAlert) {
      await this.currentAlert.dismiss();
      this.currentAlert = undefined;
      this.alertShown = false;

      // Show success message that connection is restored
      const successAlert = await this.alertController.create({
        header: 'Connection Restored',
        message: 'You are back online!',
        cssClass: 'online-alert',
        buttons: ['OK'],
      });

      await successAlert.present();

      // Auto-dismiss after 2 seconds
      setTimeout(() => {
        successAlert.dismiss();
      }, 2000);
    }
  }

  /**
   * Check if online before making API calls
   * Throws error if offline
   */
  async checkConnectionBeforeRequest(): Promise<void> {
    const status = await Network.getStatus();
    if (!status.connected) {
      await this.showOfflineAlert();
      throw new Error('No internet connection');
    }
  }
}

