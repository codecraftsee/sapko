import { AfterViewInit, Component, computed, effect, inject, input, signal } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterLink } from '@angular/router';
import { UrgentService } from '../../core/services/urgent.service';
import { UrgentRequest, UrgentType } from '../../core/models/api.models';
import { ThemeService, PetType } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

interface ReportCard {
  id?: string;
  title: string;
  description: string;
  city: string;
  species?: PetType;
  time: string;
  imageUrl?: string;
}

interface BoardConfig {
  eyebrow: string;
  eyebrowIcon: string;
  title: string;
  lead: string;
  emptyText: string;
  ctaTitle: string;
  ctaLead: string;
  ctaLabel: string;
  ctaLink: string;
}

const CONFIGS: Record<'lost_pet' | 'injured_stray', BoardConfig> = {
  lost_pet: {
    eyebrow: 'Izgubljeni ljubimci',
    eyebrowIcon: 'search',
    title: 'Vlasnici traže svoje ljubimce.',
    lead: 'Otvoreni oglasi vlasnika kojima nedostaje ljubimac. Ako ste videli nekog od ovih životinja, javite se preko detalja oglasa.',
    emptyText: 'Trenutno nema otvorenih oglasa za izgubljene ljubimce.',
    ctaTitle: 'Vaš ljubimac je nestao?',
    ctaLead: 'Postavite oglas — što pre objavite, veće su šanse da ga neko prepozna.',
    ctaLabel: 'Prijavi izgubljenog',
    ctaLink: '/prijavi/izgubljen',
  },
  injured_stray: {
    eyebrow: 'Pronađeni ljubimci',
    eyebrowIcon: 'map-pin',
    title: 'Lutalice i pronađeni ljubimci.',
    lead: 'Životinje koje su građani pronašli na ulici. Ako tražite svog ljubimca, proverite ovu listu — moguće je da je već neko prijavio.',
    emptyText: 'Trenutno nema otvorenih oglasa za pronađene ljubimce.',
    ctaTitle: 'Pronašli ste lutalicu?',
    ctaLead: 'Pre slanja, sistem će vam pokazati slične nedavne oglase u blizini — da izbegnemo duplikate.',
    ctaLabel: 'Prijavi pronađenog',
    ctaLink: '/prijavi/pronadjen',
  },
};

const PAGE_SIZE = 12;

@Component({
  selector: 'app-report-list',
  imports: [RouterLink],
  template: `
    <section class="page-header">
      <div class="container">
        <div class="page-header__inner">
          <div>
            <span class="eyebrow">
              <i [attr.data-lucide]="cfg().eyebrowIcon" class="icon--sm"></i>
              {{ cfg().eyebrow }}
            </span>
            <h1>{{ cfg().title }}</h1>
            <p class="lead">{{ cfg().lead }}</p>
          </div>
          <div class="page-header__stats">
            <div class="ph-stat">
              <span class="ph-stat__num">{{ totalCount() }}</span>
              <span class="ph-stat__label">otvorenih oglasa</span>
            </div>
            <div class="ph-stat">
              <span class="ph-stat__num">{{ dogCount() }}</span>
              <span class="ph-stat__label">psa</span>
            </div>
            <div class="ph-stat">
              <span class="ph-stat__num">{{ catCount() }}</span>
              <span class="ph-stat__label">mačaka</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="toolbar-bar">
      <div class="container">
        <div class="toolbar__filters">
          <button class="filter-chip" [class.is-active]="!speciesFilter()" (click)="setSpecies(undefined)">Sve vrste</button>
          <button class="filter-chip" [class.is-active]="speciesFilter() === 'dog'" (click)="setSpecies('dog')">
            <i data-lucide="dog"></i> Psi
          </button>
          <button class="filter-chip" [class.is-active]="speciesFilter() === 'cat'" (click)="setSpecies('cat')">
            <i data-lucide="cat"></i> Mačke
          </button>
        </div>
        <div class="toolbar__meta">
          <span><strong>{{ filtered().length }}</strong> oglasa{{ pagedRangeLabel() }}</span>
          <a [routerLink]="cfg().ctaLink" class="btn btn--sm">
            <i data-lucide="plus" class="icon--sm"></i>
            {{ cfg().ctaLabel }}
          </a>
        </div>
      </div>
    </section>

    <section class="block block--tight-top">
      <div class="container">
        @if (loading()) {
          <p class="empty">Učitavanje…</p>
        } @else if (paged().length === 0) {
          <p class="empty">{{ cfg().emptyText }}</p>
        } @else {
          <div class="pets-grid">
            @for (p of paged(); track p.id ?? p.title) {
              <a [routerLink]="p.id ? ['/urgentno', p.id] : ['.']" class="pet-card">
                <div class="pet-card__media">
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.title" class="pet-card__img" />
                  } @else {
                    <i [attr.data-lucide]="cfg().eyebrowIcon" class="pet-card__placeholder"></i>
                  }
                  <span class="pet-card__time">{{ p.time }}</span>
                </div>
                <div class="pet-card__body">
                  <h3>{{ p.title }}</h3>
                  <p class="pet-card__meta">
                    <i data-lucide="map-pin" class="icon--sm"></i>
                    {{ p.city }}
                  </p>
                  <p class="pet-card__desc">{{ p.description }}</p>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <section class="block block--tight-top">
      <div class="container">
        <div class="help-strip">
          <div>
            <h2>{{ cfg().ctaTitle }}</h2>
            <p>{{ cfg().ctaLead }}</p>
          </div>
          <div class="help-strip__actions">
            <a [routerLink]="cfg().ctaLink" class="btn">
              <i data-lucide="bell-plus"></i>
              {{ cfg().ctaLabel }}
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
    section.block { padding: 4.5rem 0; }
    section.block--tight-top { padding-top: 2rem; }

    .page-header {
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 60%),
        var(--bg-base);
      padding: 2.5rem 1.5rem 2rem;
      border-bottom: 1px solid var(--border);
    }
    .page-header__inner {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2.5rem;
      align-items: end;
    }
    .page-header h1 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      margin: 0.6rem 0;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .page-header .lead {
      margin: 0;
      color: var(--text-muted);
      font-size: 1.02rem;
      max-width: 540px;
    }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.8rem;
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
      border: 1px solid var(--primary-soft-border);
      border-radius: var(--radius-pill);
      font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
    }
    .eyebrow [data-lucide] { width: 0.95rem; height: 0.95rem; }
    .page-header__stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem;
    }
    .ph-stat {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      text-align: center;
    }
    .ph-stat__num {
      display: block; font-size: 1.4rem; font-weight: 800;
      color: var(--primary); letter-spacing: -0.02em; line-height: 1;
    }
    .ph-stat__label {
      display: block; margin-top: 0.3rem;
      font-size: 0.74rem; color: var(--text-muted);
    }

    .toolbar-bar {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem 0.75rem;
      position: sticky; top: 64px; z-index: 20;
    }
    .toolbar__filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font: inherit; font-size: 0.85rem; font-weight: 500;
      color: var(--text); cursor: pointer;
      transition: all 0.15s;
    }
    .filter-chip [data-lucide] { width: 1rem; height: 1rem; }
    .filter-chip:hover { border-color: var(--border-strong); }
    .filter-chip.is-active {
      background: var(--primary); color: var(--on-primary); border-color: var(--primary);
    }
    .toolbar__meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 0.65rem; padding-top: 0.65rem;
      border-top: 1px dashed var(--border);
      font-size: 0.85rem; color: var(--text-muted);
    }

    .pets-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .pet-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      color: inherit; text-decoration: none;
      display: flex; flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .pet-card:hover {
      transform: translateY(-3px);
      border-color: var(--primary-soft-border);
      box-shadow: var(--shadow-md);
    }
    .pet-card__media {
      height: 180px;
      background: var(--primary-soft-bg);
      color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .pet-card__img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
    }
    .pet-card__placeholder { width: 2.6rem; height: 2.6rem; opacity: 0.55; }
    .pet-card__time {
      position: absolute; top: 0.65rem; right: 0.65rem;
      background: rgba(255,255,255,0.92);
      color: var(--text-muted);
      border-radius: var(--radius-pill);
      padding: 0.22rem 0.6rem;
      font-size: 0.7rem; font-weight: 600;
      z-index: 1;
    }
    .pet-card__body { padding: 0.85rem 1rem 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
    .pet-card__body h3 { font-size: 1rem; margin: 0; letter-spacing: -0.015em; }
    .pet-card__meta {
      margin: 0; color: var(--text-muted); font-size: 0.82rem;
      display: inline-flex; align-items: center; gap: 0.3rem;
    }
    .pet-card__meta [data-lucide] { width: 0.85rem; height: 0.85rem; }
    .pet-card__desc {
      margin: 0; font-size: 0.85rem; color: var(--text-muted);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }

    .help-strip {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem 2rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 2rem; flex-wrap: wrap;
    }
    .help-strip h2 { font-size: 1.3rem; margin: 0 0 0.3rem; }
    .help-strip p { margin: 0; color: var(--text-muted); font-size: 0.95rem; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem 1.35rem;
      background: var(--primary); color: var(--on-primary);
      border: none; border-radius: var(--radius-sm);
      font: inherit; font-size: 0.95rem; font-weight: 600;
      cursor: pointer; text-decoration: none;
      transition: background 0.15s;
    }
    .btn [data-lucide] { width: 1.05rem; height: 1.05rem; }
    .btn:hover { background: var(--primary-hover); color: var(--on-primary); }
    .btn--sm { padding: 0.45rem 0.95rem; font-size: 0.85rem; }

    .empty {
      text-align: center; color: var(--text-muted);
      padding: 3rem 1rem; font-size: 1rem;
    }

    @media (max-width: 980px) {
      .pets-grid { grid-template-columns: repeat(2, 1fr); }
      .page-header__inner { grid-template-columns: 1fr; gap: 1.5rem; }
      .toolbar-bar { position: static; }
    }
    @media (max-width: 560px) {
      .pets-grid { grid-template-columns: 1fr; }
      .page-header__stats { grid-template-columns: 1fr; }
    }
  `],
})
export class ReportListComponent implements AfterViewInit {
  reportType = input.required<'lost_pet' | 'injured_stray'>();

  private svc = inject(UrgentService);
  private theme = inject(ThemeService);

  loading = signal(true);
  private fetched = signal<ReportCard[]>([]);
  speciesFilter = signal<PetType | undefined>(undefined);
  page = signal(1);

  cfg = computed(() => CONFIGS[this.reportType()]);

  constructor() {
    effect(() => {
      this.speciesFilter.set(this.theme.petType());
    });
    effect(() => {
      this.reportType();
      this.theme.petType();
      this.load();
    });
    effect(() => {
      this.paged();
      setTimeout(() => createIcons({ icons }), 0);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }

  filtered = computed(() => {
    const sp = this.speciesFilter();
    return sp ? this.fetched().filter(p => !p.species || p.species === sp) : this.fetched();
  });

  paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  totalCount = computed(() => this.fetched().length);
  dogCount = computed(() => this.fetched().filter(p => p.species === 'dog').length);
  catCount = computed(() => this.fetched().filter(p => p.species === 'cat').length);

  pagedRangeLabel = computed(() => {
    const total = this.filtered().length;
    if (total === 0) return '';
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    const end = Math.min(this.page() * PAGE_SIZE, total);
    return ` · prikazano ${start}–${end}`;
  });

  setSpecies(s: PetType | undefined): void {
    this.speciesFilter.set(s);
    this.page.set(1);
  }

  private load(): void {
    this.loading.set(true);
    this.svc.list({ type: this.reportType() }).subscribe({
      next: (rows) => {
        this.fetched.set(rows.map(r => this.toCard(r)));
        this.loading.set(false);
        this.page.set(1);
      },
      error: () => {
        this.fetched.set([]);
        this.loading.set(false);
      },
    });
  }

  private toCard(r: UrgentRequest): ReportCard {
    const photo = r.photos?.[0]?.url;
    const imageUrl = photo
      ? (photo.startsWith('http') ? photo : `${environment.apiUrl}${photo}`)
      : undefined;
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      city: r.city,
      species: r.species,
      time: this.relativeTime(r.created_at),
      imageUrl,
    };
  }

  private relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.round(diff / 3_600_000);
    if (h < 1) return 'Upravo';
    if (h < 24) return `Pre ${h}h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'Juče' : `Pre ${d} dana`;
  }
}
