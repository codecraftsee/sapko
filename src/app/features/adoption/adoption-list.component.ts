import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdoptionService } from '../../core/services/adoption.service';
import { AdoptionListing, Species } from '../../core/models/api.models';

@Component({
  selector: 'app-adoption-list',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>Udomljavanje</h1>
      <p>Psi i mačke koji traže svoj zauvek dom.</p>
      <div class="filters">
        <button (click)="setSpecies(undefined)" [class.active]="!species()">Sve</button>
        <button (click)="setSpecies('dog')" [class.active]="species() === 'dog'">🐶 Psi</button>
        <button (click)="setSpecies('cat')" [class.active]="species() === 'cat'">🐱 Mačke</button>
      </div>
    </header>

    @if (loading()) { <p>Učitavanje…</p> }
    @else if (listings().length === 0) { <p class="empty">Trenutno nema otvorenih oglasa.</p> }
    @else {
      <div class="grid">
        @for (l of listings(); track l.id) {
          <a [routerLink]="['/udomi', l.id]" class="card">
            @if (l.pet?.photos?.[0]) {
              <img [src]="l.pet!.photos[0].url" [alt]="l.pet!.name" />
            } @else {
              <div class="placeholder">🐾</div>
            }
            <div class="body">
              <h3>{{ l.pet?.name }}</h3>
              <p class="meta">{{ l.pet?.species === 'dog' ? 'Pas' : 'Mačka' }} · {{ l.city }}</p>
              <p class="desc">{{ l.pet?.description }}</p>
            </div>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .page-header h1 { margin: 0; }
    .filters { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .filters button { padding: 0.5rem 1rem; background: #fff; border: 1px solid #ddd; border-radius: 20px; cursor: pointer; }
    .filters button.active { background: #d94d4d; color: white; border-color: #d94d4d; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.25rem; margin-top: 1.5rem; }
    .card { background: #fff; border: 1px solid #eee; border-radius: 10px; overflow: hidden; text-decoration: none; color: inherit; display: block; }
    .card img { width: 100%; height: 200px; object-fit: cover; display: block; }
    .placeholder { width: 100%; height: 200px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
    .body { padding: 1rem; }
    .body h3 { margin: 0 0 0.25rem; }
    .meta { margin: 0 0 0.5rem; font-size: 0.85rem; color: #888; }
    .desc { margin: 0; font-size: 0.9rem; color: #555; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .empty { text-align: center; color: #888; padding: 3rem; }
  `],
})
export class AdoptionListComponent {
  private svc = inject(AdoptionService);

  listings = signal<AdoptionListing[]>([]);
  species = signal<Species | undefined>(undefined);
  loading = signal(true);

  constructor() {
    this.load();
  }

  setSpecies(s: Species | undefined) {
    this.species.set(s);
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.svc.list({ species: this.species() }).subscribe({
      next: (res) => {
        this.listings.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
