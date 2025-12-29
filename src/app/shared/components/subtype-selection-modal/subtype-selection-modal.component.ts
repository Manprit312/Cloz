import { Component, Input, OnInit } from '@angular/core';
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
  IonList,
  ModalController,
} from '@ionic/angular/standalone';
import { Gender } from '@models/user.model';
import { SubtypesService, SubtypeOption } from '../../../core/services/subtypes.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-subtype-selection-modal',
  templateUrl: './subtype-selection-modal.component.html',
  styleUrls: ['./subtype-selection-modal.component.scss'],
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
    
  ],
})
export class SubtypeSelectionModalComponent implements OnInit {
  @Input() currentSubtype: string = '';
  @Input() category: 'upper-garments' | 'bottoms' | 'shoes' | 'accessories' = 'upper-garments';
  @Input() gender: Gender = 'Female'; // Default to Female

  selectedSubtype: string = '';

  private subtypesService = inject(SubtypesService);
  private modalController = inject(ModalController);

  get options(): SubtypeOption[] {
    return this.subtypesService.getSubtypeOptionsForCategory(this.category, this.gender);
  }

  ngOnInit() {
    this.selectedSubtype = this.currentSubtype;
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  onSubtypeChange(value: string) {
    this.selectedSubtype = value;
    // Auto-dismiss on selection
    this.modalController.dismiss(value, 'confirm');
  }
}

