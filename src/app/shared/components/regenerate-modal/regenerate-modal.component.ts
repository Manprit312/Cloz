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
  selector: 'app-regenerate-modal',
  templateUrl: './regenerate-modal.component.html',
  styleUrls: ['./regenerate-modal.component.scss'],
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
export class RegenerateModalComponent implements OnInit {
  @Input() previousDescription: string = '';

  description: string = '';

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.description = this.previousDescription || '';
  }

  cancel() {
    this.modalController.dismiss(null, 'cancel');
  }

  regenerate() {
    this.modalController.dismiss(
      { description: this.description.trim() },
      'confirm'
    );
  }
}






















