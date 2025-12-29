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
  IonRadio,
  IonRadioGroup,
  IonList,
  ModalController,
} from '@ionic/angular/standalone';
import { Gender } from '@models/user.model';

@Component({
  selector: 'app-gender-edit-modal',
  templateUrl: './gender-edit-modal.component.html',
  styleUrls: ['./gender-edit-modal.component.scss'],
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
    IonRadio,
    IonRadioGroup,
    IonList,
  ],
})
export class GenderEditModalComponent implements OnInit {
  @Input() currentGender: Gender = 'Male';

  selectedGender: Gender = 'Male';

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.selectedGender = this.currentGender;
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.selectedGender) {
      this.modalController.dismiss(this.selectedGender, 'confirm');
    }
  }
}

