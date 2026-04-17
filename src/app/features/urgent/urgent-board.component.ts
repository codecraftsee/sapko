import { Component, inject, signal, effect } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterLink } from '@angular/router';
import { UrgentService } from '../../core/services/urgent.service';
import { UrgentRequest, UrgentType } from '../../core/models/api.models';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

const TYPE_ICONS: Record<UrgentType, string> = {
  blood: 'droplets',
  food_donation: 'bone',
  lost_pet: 'search',
  injured_stray: 'ambulance',
  medical_fundraising: 'syringe',
  other: 'circle-help',
};

const TYPE_LABELS: Record<UrgentType, string> = {
  blood: 'Krv',
  food_donation: 'Hrana',
  lost_pet: 'Izgubljeni',
  injured_stray: 'Povređeni',
  medical_fundraising: 'Lečenje',
  other: 'Ostalo',
};

@Component({
  selector: 'app-urgent-board',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>Hitni oglasi</h1>
      <p>Sve hitne potrebe na jednom mestu.</p>
      <div class="tabs">
        <button (click)="setType(undefined)" [class.active]="!type()">Sve</button>
        @for (t of types; track t) {
          <button (click)="setType(t)" [class.active]="type() === t">
            <i [attr.data-lucide]="icons[t]" class="tab-icon"></i>{{ labels[t] }}
          </button>
        }
      </div>
    </header>

    @if (loading()) { <p>Učitavanje…</p> }
    @else if (items().length === 0) { <p class="empty">Trenutno nema otvorenih zahteva.</p> }
    @else {
      <div class="list">
        @for (r of items(); track r.id) {
          <a [routerLink]="['/urgentno', r.id]" class="row">
            @if (r.photos[0]) {
              <img [src]="photoUrl(r.photos[0].url)" [alt]="r.title" class="row-photo" />
            }
            <div class="row-content">
              <div class="badge">
                <i [attr.data-lucide]="icons[r.type]" class="badge-icon"></i>{{ labels[r.type] }}
              </div>
              <div class="main">
                <h3>{{ r.title }}</h3>
                <p class="meta">{{ r.city }} · {{ formatDate(r.created_at) }}</p>
                <p class="desc">{{ r.description }}</p>
              </div>
            </div>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .page-header { margin-bottom: 0.5rem; }
    .page-header h1 { margin: 0 0 0.5rem; font-family: var(--font-display); }
    .page-header p { color: var(--color-text-muted); margin: 0; }
    .tabs { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .tab-icon { width: 1rem; height: 1rem; }
    .badge-icon { width: 0.8rem; height: 0.8rem; }
    .tabs button {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 1.1rem;
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
      border-radius: 20px;
      cursor: pointer;
      font-family: var(--font-body);
      font-weight: 500;
      color: var(--color-primary);
      transition: all 0.2s;
    }
    .tabs button:hover { transform: translateY(-1px); box-shadow: 0 3px 10px color-mix(in srgb, var(--color-primary) 20%, transparent); }
    .tabs button:active { transform: scale(0.95); box-shadow: none; }
    .tabs button.active { background: var(--color-primary); color: white; border-color: var(--color-primary); box-shadow: 0 3px 10px color-mix(in srgb, var(--color-primary) 30%, transparent); }
    .list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.75rem; }

    /* Card row */
    .row {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      padding: 1.25rem;
      background: color-mix(in srgb, var(--color-primary) 8%, var(--color-surface));
      border: 1px solid color-mix(in srgb, var(--color-primary) 25%, transparent);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
      text-decoration: none;
      color: inherit;
      transition: box-shadow 0.3s, transform 0.3s;
    }
    .row:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-3px);
    }
    /* Badge */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      font-weight: 600;
      font-size: 0.8rem;
      color: white;
      background: var(--color-primary);
      border: 1px solid var(--color-primary);
      border-radius: 20px;
      padding: 0.25rem 0.75rem;
      white-space: nowrap;
    }

    .row-photo { width: 110px; height: 110px; object-fit: cover; border-radius: calc(var(--radius-card) - 2px); flex-shrink: 0; }
    .row-content { display: flex; flex-direction: row; gap: 1rem; flex: 1; min-width: 0; align-items: flex-start; }
    .main { flex: 1; min-width: 0; }
    .main h3 { margin: 0 0 0.25rem; font-family: var(--font-display); font-size: 1.05rem; }
    .meta { margin: 0 0 0.4rem; font-size: 0.85rem; color: var(--color-text-muted); }
    .desc { margin: 0; font-size: 0.9rem; color: var(--color-text-muted); }
    .empty { text-align: center; color: var(--color-text-muted); padding: 3rem; }
  `],
})
export class UrgentBoardComponent {
  private svc   = inject(UrgentService);
  theme         = inject(ThemeService);

  items   = signal<UrgentRequest[]>([]);
  type    = signal<UrgentType | undefined>(undefined);
  loading = signal(true);

  readonly types: UrgentType[] = ['blood', 'food_donation', 'lost_pet', 'injured_stray', 'medical_fundraising'];
  readonly labels = TYPE_LABELS;
  readonly icons  = TYPE_ICONS;

  constructor() {
    effect(() => {
      this.theme.petType();
      this.load();
    });
  }

  setType(t: UrgentType | undefined) {
    this.type.set(t);
    this.load();
  }

  photoUrl(url: string): string {
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('sr-RS');
  }

  private load() {
    this.loading.set(true);
    this.svc.list({ type: this.type(), species: this.theme.petType() }).subscribe({
      next: (res) => {
        this.items.set(res);
        this.loading.set(false);
        setTimeout(() => createIcons({ icons }), 0);
      },
      error: () => this.loading.set(false),
    });
  }
}
