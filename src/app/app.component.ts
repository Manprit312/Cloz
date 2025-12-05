import { Component, inject } from '@angular/core';
import { TranslationService } from '@app-core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { translations } from '@translations';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  private translate = inject(TranslationService);

  constructor() {
    this.translate.init();
  }
}
