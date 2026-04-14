import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UrgentService } from '../../core/services/urgent.service';
import { UrgentRequest, UrgentType } from '../../core/models/api.models';

const TYPE_LABELS: Record<UrgentType, string> = {
  blood: '🩸 Krv',
  food_donation: '🥫 Hrana',
  lost_pet: '🔍 Izgubljeni',
  injured_stray: '🚑 Povređeni',
  medical_fundraising: '💉 Lečenje',
  other: '❓ Ostalo',
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
          <button (click)="setType(t)" [class.active]="type() === t">{{ labels[t] }}</button>
        }
      </div>
    </header>

    @if (loading()) { <p>Učitavanje…</p> }
    @else if (items().length === 0) { <p class="empty">Trenutno nema otvorenih zahteva.</p> }
    @else {
      <div class="list">
        @for (r of items(); track r.id) {
          <a [routerLink]="['/urgentno', r.id]" class="row" [class.blood]="r.type === 'blood'">
            <div class="badge">{{ labels[r.type] }}</div>
            <div class="main">
              <h3>{{ r.title }}</h3>
              <p class="meta">{{ r.city }} · {{ formatDate(r.created_at) }}</p>
              <p class="desc">{{ r.description }}</p>
            </div>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; max-width: 1000px; margin: 0 auto; padding: 2rem; }
    .page-header h1 { margin: 0; }
    .tabs { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
    .tabs button { padding: 0.5rem 1rem; background: #fff; border: 1px solid #ddd; border-radius: 20px; cursor: pointer; }
    .tabs button.active { background: #d94d4d; color: white; border-color: #d94d4d; }
    .list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1.5rem; }
    .row { display: flex; gap: 1rem; padding: 1rem; background: #fff; border: 1px solid #eee; border-radius: 10px; text-decoration: none; color: inherit; }
    .row.blood { border-color: #fecaca; background: #fef2f2; }
    .badge { flex: 0 0 auto; font-weight: 600; font-size: 0.85rem; color: #b91c1c; }
    .main h3 { margin: 0 0 0.25rem; }
    .meta { margin: 0 0 0.5rem; font-size: 0.85rem; color: #888; }
    .desc { margin: 0; font-size: 0.9rem; color: #555; }
    .empty { text-align: center; color: #888; padding: 3rem; }
  `],
})
export class UrgentBoardComponent {
  private svc = inject(UrgentService);

  items = signal<UrgentRequest[]>([]);
  type = signal<UrgentType | undefined>(undefined);
  loading = signal(true);

  readonly types: UrgentType[] = ['blood', 'food_donation', 'lost_pet', 'injured_stray', 'medical_fundraising'];
  readonly labels = TYPE_LABELS;

  constructor() {
    this.load();
  }

  setType(t: UrgentType | undefined) {
    this.type.set(t);
    this.load();
  }

  formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('sr-RS');
  }

  private load() {
    this.loading.set(true);
    this.svc.list({ type: this.type() }).subscribe({
      next: (res) => {
        this.items.set(res);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
