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
  ModalController,
} from '@ionic/angular/standalone';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-name-edit-modal',
  templateUrl: './name-edit-modal.component.html',
  styleUrls: ['./name-edit-modal.component.scss'],
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
    ButtonComponent,
  ],
})
export class NameEditModalComponent implements OnInit {
  @Input() currentName: string = '';

  name: string = '';

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.name = this.currentName;
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  save() {
    if (this.name && this.name.trim()) {
      this.modalController.dismiss(this.name.trim(), 'confirm');
    }
  }
}

