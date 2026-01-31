import { inject, Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular/standalone';

export type SortMode = 'color' | 'newest' | 'subtype';

@Injectable({
  providedIn: 'root',
})
export class SortActionSheetService {
  private actionSheetController = inject(ActionSheetController);

  async openSortActionSheet(current: SortMode): Promise<SortMode> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Sort by',
      cssClass: 'sorting-sheet sorting-sheet-color',
      buttons: [
        {
          text: 'Color',
          role: current === 'color' ? 'selected' : undefined,
          htmlAttributes: {
            role: 'radio',
            'aria-checked': current === 'color' ? 'true' : 'false',
          },
          data: { sortMode: 'color' as SortMode },
        },
        {
          text: 'Newest',
          role: current === 'newest' ? 'selected' : undefined,
          htmlAttributes: {
            role: 'radio',
            'aria-checked': current === 'newest' ? 'true' : 'false',
          },
          data: { sortMode: 'newest' as SortMode },
        },
        {
          text: 'Subtype',
          role: current === 'subtype' ? 'selected' : undefined,
          htmlAttributes: {
            role: 'radio',
            'aria-checked': current === 'subtype' ? 'true' : 'false',
          },
          data: { sortMode: 'subtype' as SortMode },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
    const { data } = await actionSheet.onDidDismiss<{ sortMode?: SortMode }>();

    if (data?.sortMode) {
      console.log('[SortActionSheetService] Selected sort mode:', data.sortMode);
      return data.sortMode;
    }

    console.log('[SortActionSheetService] Sort mode unchanged:', current);
    return current;
  }
}

