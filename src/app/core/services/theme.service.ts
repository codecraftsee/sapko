import { Injectable, effect, signal } from '@angular/core';

export type PetType = 'dog' | 'cat';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'sapko.petType';

  private _petType = signal<PetType>(this.loadFromStorage());
  readonly petType = this._petType.asReadonly();

  constructor() {
    effect(() => {
      const type = this._petType();
      document.documentElement.setAttribute('data-theme', type);
      localStorage.setItem(this.STORAGE_KEY, type);
    });
  }

  set(type: PetType): void {
    this._petType.set(type);
  }

  private loadFromStorage(): PetType {
    return localStorage.getItem(this.STORAGE_KEY) === 'cat' ? 'cat' : 'dog';
  }
}
