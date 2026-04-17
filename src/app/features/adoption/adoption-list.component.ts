import { Component, inject, signal, effect } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterLink } from '@angular/router';
import { AdoptionService } from '../../core/services/adoption.service';
import { AdoptionListing, Species } from '../../core/models/api.models';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-adoption-list',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>
        <i [attr.data-lucide]="theme.petType() === 'dog' ? 'dog' : 'cat'" class="heading-icon"></i>
        {{ theme.petType() === 'dog' ? 'Psi za udomljavanje' : 'Mačke za udomljavanje' }}
      </h1>
      <p>{{ theme.petType() === 'dog' ? 'Psi iz azila i od privatnih lica traže svoj zauvek dom.' : 'Mačke iz azila i od privatnih lica traže svoj zauvek dom.' }}</p>
    </header>

    @if (loading()) { <p>Učitavanje…</p> }
    @else if (listings().length === 0) { <p class="empty">Trenutno nema otvorenih oglasa.</p> }
    @else {
      <div class="grid">
        @for (l of listings(); track l.id) {
          <a [routerLink]="['/udomi', l.id]" class="card">
            @if (l.pet?.photos?.[0]) {
              <img [src]="photoUrl(l.pet!.photos[0].url)" [alt]="l.pet!.name" />
            } @else {
              <div class="placeholder"><i data-lucide="paw-print" class="placeholder-icon"></i></div>
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
    .page-header { margin-bottom: 0.5rem; }
    .page-header h1 { margin: 0 0 0.5rem; font-family: var(--font-display); display: flex; align-items: center; gap: 0.5rem; }
    .page-header p { color: var(--color-text-muted); margin: 0; }
    .heading-icon { width: 1.6rem; height: 1.6rem; color: var(--color-primary); flex-shrink: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 1.75rem; }

    /* Animal card */
    .card {
      background: var(--color-surface-alt);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      display: block;
      transition: box-shadow 0.3s, transform 0.3s;
    }
    .card:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-3px);
    }
    .card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
      border-radius: var(--radius-card) var(--radius-card) 0 0;
    }
    .placeholder {
      width: 100%;
      height: 200px;
      background: var(--color-surface-alt);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      border-radius: var(--radius-card) var(--radius-card) 0 0;
    }
    .placeholder-icon { width: 3rem; height: 3rem; }
    .body { padding: 1.1rem 1.25rem 1.25rem; }
    .body h3 {
      margin: 0 0 0.3rem;
      font-family: var(--font-display);
      font-size: 1.1rem;
      color: var(--color-text);
    }
    .meta { margin: 0 0 0.5rem; font-size: 0.85rem; color: var(--color-text-muted); }
    .desc {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .empty { text-align: center; color: var(--color-text-muted); padding: 3rem; }
  `],
})
export class AdoptionListComponent {
  private svc = inject(AdoptionService);
  theme = inject(ThemeService);

  listings = signal<AdoptionListing[]>([]);
  loading = signal(true);

  constructor() {
    effect(() => {
      this.theme.petType();
      this.load();
    });
  }

  photoUrl(url: string): string {
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  }

  private load() {
    this.loading.set(true);
    this.svc.list({ species: this.theme.petType() as Species }).subscribe({
      next: (res) => {
        this.listings.set(res);
        this.loading.set(false);
        setTimeout(() => createIcons({ icons }), 0);
      },
      error: () => this.loading.set(false),
    });
  }
}
