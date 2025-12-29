import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-outfits',
  templateUrl: './outfits.page.html',
  styleUrls: ['./outfits.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, EmptyStateComponent]
})
export class OutfitsPage implements OnInit {
  private router = inject(Router);
  outfits: any[] = []; // Empty array to show empty state

  constructor() { }

  ngOnInit() {
  }

  onCreateOutfit(): void {
    this.router.navigate(['/tabs/outfits/create-outfit']);
  }

}
