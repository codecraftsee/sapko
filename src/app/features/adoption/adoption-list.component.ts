import { AfterViewInit, Component, computed, effect, inject, signal } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterLink } from '@angular/router';
import { AdoptionService } from '../../core/services/adoption.service';
import { AdoptionListing, Species } from '../../core/models/api.models';
import { ThemeService, PetType } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

interface PetCard {
  id?: string;
  name: string;
  species: 'dog' | 'cat';
  speciesLabel: string;
  city: string;
  age: string;
  sex: string;
  tags: string[];
  urgent?: boolean;
  imageHint?: string;
  imageUrl?: string;
}

const FALLBACK_PETS: PetCard[] = [
  { name: 'Luka', species: 'dog', speciesLabel: 'Pas',   city: 'Beograd',    age: '3 god', sex: 'Mužjak', tags: ['Druželjubiv', 'Vakcinisan'],   imageHint: 'luka.jpg' },
  { name: 'Mia',  species: 'dog', speciesLabel: 'Pas',   city: 'Novi Sad',   age: '5 god', sex: 'Ženka',  tags: ['Sterilisana', 'Sa decom'],     imageHint: 'mia.jpg' },
  { name: 'Mrva', species: 'cat', speciesLabel: 'Mačka', city: 'Niš',        age: '2 god', sex: 'Ženka',  tags: ['Privremeni dom'], urgent: true, imageHint: 'mrva.jpg' },
  { name: 'Reks', species: 'dog', speciesLabel: 'Pas',   city: 'Kragujevac', age: '4 god', sex: 'Mužjak', tags: ['Treniran', 'Velika rasa'],     imageHint: 'reks.jpg' },
  { name: 'Bela', species: 'cat', speciesLabel: 'Mačka', city: 'Beograd',    age: '1 god', sex: 'Ženka',  tags: ['Igračica', 'Vakcinisana'],     imageHint: 'bela.jpg' },
  { name: 'Argo', species: 'dog', speciesLabel: 'Pas',   city: 'Subotica',   age: '7 god', sex: 'Mužjak', tags: ['Stariji', 'Smiren'], urgent: true, imageHint: 'argo.jpg' },
  { name: 'Tara', species: 'dog', speciesLabel: 'Pas',   city: 'Beograd',    age: '4 mes', sex: 'Ženka',  tags: ['Štene', 'Mala rasa'],          imageHint: 'tara.jpg' },
  { name: 'Pufi', species: 'cat', speciesLabel: 'Mačka', city: 'Novi Sad',   age: '6 mes', sex: 'Mužjak', tags: ['Mače', 'Vakcinisan'],          imageHint: 'pufi.jpg' },
  { name: 'Žuća', species: 'dog', speciesLabel: 'Pas',   city: 'Niš',        age: '2 god', sex: 'Mužjak', tags: ['Aktivan', 'Sa drugim psima'],  imageHint: 'zuca.jpg' },
  { name: 'Sara', species: 'cat', speciesLabel: 'Mačka', city: 'Beograd',    age: '8 god', sex: 'Ženka',  tags: ['Starija', 'Mirna'],            imageHint: 'sara.jpg' },
  { name: 'Buca', species: 'dog', speciesLabel: 'Pas',   city: 'Pančevo',    age: '3 god', sex: 'Ženka',  tags: ['Sterilisana', 'Voli decu'],    imageHint: 'buca.jpg' },
  { name: 'Mrki', species: 'dog', speciesLabel: 'Pas',   city: 'Zrenjanin',  age: '5 god', sex: 'Mužjak', tags: ['Čuvar', 'Velika rasa'],        imageHint: 'mrki.jpg' },
];

const PAGE_SIZE = 12;

@Component({
  selector: 'app-adoption-list',
  imports: [RouterLink],
  template: `
    <!-- ===================== PAGE HEADER ===================== -->
    <section class="page-header">
      <div class="container">
        <div class="page-header__inner">
          <div>
            <span class="eyebrow eyebrow--inline">
              <i data-lucide="heart" class="icon--sm"></i>
              Udomljavanje
            </span>
            <h1>Pronađite svog ljubimca.</h1>
            <p class="lead">
              Trenutno aktivno <strong>{{ totalLabel() }}</strong> iz cele Srbije. Filtrirajte po vrsti,
              gradu i potrebi — i napravite prvi korak ka udomljavanju.
            </p>
          </div>
          <div class="page-header__stats">
            <div class="ph-stat">
              <span class="ph-stat__num">{{ dogCount() }}</span>
              <span class="ph-stat__label">pasa traži dom</span>
            </div>
            <div class="ph-stat">
              <span class="ph-stat__num">{{ catCount() }}</span>
              <span class="ph-stat__label">mačaka traži dom</span>
            </div>
            <div class="ph-stat ph-stat--urgent">
              <span class="ph-stat__num">{{ urgentCount() }}</span>
              <span class="ph-stat__label">urgentnih slučajeva</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TOOLBAR ===================== -->
    <section class="toolbar-bar">
      <div class="container">
        <div class="toolbar">
          <div class="toolbar__filters">
            <button
              class="filter-chip"
              [class.is-active]="!speciesFilter()"
              (click)="setSpecies(undefined)"
            >Sve vrste</button>
            <button
              class="filter-chip"
              [class.is-active]="speciesFilter() === 'dog'"
              (click)="setSpecies('dog')"
            >
              <i data-lucide="dog"></i> Psi
            </button>
            <button
              class="filter-chip"
              [class.is-active]="speciesFilter() === 'cat'"
              (click)="setSpecies('cat')"
            >
              <i data-lucide="cat"></i> Mačke
            </button>
            <span class="toolbar__divider"></span>
            <button class="filter-chip filter-chip--select" disabled>
              <i data-lucide="map-pin"></i> Bilo koji grad
              <i data-lucide="chevron-down"></i>
            </button>
            <button class="filter-chip filter-chip--select" disabled>
              Uzrast: bilo koji <i data-lucide="chevron-down"></i>
            </button>
            <button class="filter-chip filter-chip--select" disabled>
              Pol: bilo koji <i data-lucide="chevron-down"></i>
            </button>
            <button
              class="filter-chip filter-chip--urgent"
              [class.is-active]="urgentOnly()"
              (click)="toggleUrgent()"
            >
              <i data-lucide="alert-triangle"></i> Samo hitno
            </button>
          </div>
          <div class="toolbar__sort">
            <span class="toolbar__sort-label">Sortiraj:</span>
            <button class="filter-chip filter-chip--select" disabled>
              Najnoviji prvi <i data-lucide="chevron-down"></i>
            </button>
          </div>
        </div>
        <div class="toolbar__meta">
          <span><strong>{{ filtered().length }}</strong> oglasa{{ pagedRangeLabel() }}</span>
          <a (click)="resetFilters()" class="toolbar__clear" role="button" tabindex="0">Resetuj filtere</a>
        </div>
      </div>
    </section>

    <!-- ===================== PETS GRID ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        @if (loading()) {
          <p class="empty">Učitavanje…</p>
        } @else if (paged().length === 0) {
          <p class="empty">Nema oglasa koji odgovaraju filterima.</p>
        } @else {
          <div class="pets-grid pets-grid--lg">
            @for (p of paged(); track p.name + p.city) {
              <a [routerLink]="p.id ? ['/udomi', p.id] : ['/udomi']" class="pet-card">
                <div class="pet-card__media">
                  <span class="pet-card__species">
                    <i [attr.data-lucide]="p.species" style="font-size: 0.95rem;"></i>
                    {{ p.speciesLabel }}
                  </span>
                  @if (p.urgent) {
                    <span class="pet-card__urgency">Hitno</span>
                  }
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" class="pet-card__img" />
                  } @else {
                    <span class="pet-card__placeholder-text">[ {{ p.imageHint }} ]</span>
                  }
                </div>
                <div class="pet-card__body">
                  <h3>{{ p.name }}</h3>
                  <p class="pet-card__meta">
                    {{ p.city }}<span class="dot"></span>{{ p.age }}<span class="dot"></span>{{ p.sex }}
                  </p>
                  <div class="pet-card__tags">
                    @for (t of p.tags; track t) {
                      <span class="pet-tag">{{ t }}</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>

          @if (totalPages() > 1) {
            <nav class="pagination" aria-label="Stranice">
              <button
                class="page-btn"
                [class.is-disabled]="page() === 1"
                [disabled]="page() === 1"
                (click)="prevPage()"
              >
                <i data-lucide="arrow-left" class="icon--sm"></i> Prethodna
              </button>
              <div class="page-numbers">
                @for (n of pageNumbers(); track $index) {
                  @if (n === '…') {
                    <span class="page-ellipsis">…</span>
                  } @else {
                    <button
                      class="page-num"
                      [class.is-active]="n === page()"
                      (click)="goToPage(+n)"
                    >{{ n }}</button>
                  }
                }
              </div>
              <button
                class="page-btn"
                [class.is-disabled]="page() === totalPages()"
                [disabled]="page() === totalPages()"
                (click)="nextPage()"
              >
                Sledeća <i data-lucide="arrow-right" class="icon--sm"></i>
              </button>
            </nav>
          }
        }
      </div>
    </section>

    <!-- ===================== HELP STRIP ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        <div class="help-strip">
          <div>
            <h2>Niste sigurni odakle da počnete?</h2>
            <p>Pročitajte naš vodič za udomitelje — od prve posete azilu do prvog dana kod kuće.</p>
          </div>
          <div class="help-strip__actions">
            <a href="#" class="btn btn--ghost">Vodič za udomitelje</a>
            <a routerLink="/" fragment="kako" class="btn">Kako Šapko radi</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
    section.block { padding: 4.5rem 0; }
    section.block--tight-top { padding-top: 0; }

    /* ===== Page header ===== */
    .page-header {
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 60%),
        radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 50%),
        var(--bg-base);
      padding: 2.5rem 1.5rem 2rem;
      border-bottom: 1px solid var(--border);
      transition: background 0.6s ease;
    }
    .page-header__inner {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2.5rem;
      align-items: end;
    }
    .page-header h1 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      margin: 0.6rem 0 0.6rem;
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
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.6rem;
    }
    .ph-stat {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      text-align: center;
    }
    .ph-stat__num {
      display: block;
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .ph-stat__label {
      display: block;
      margin-top: 0.3rem;
      font-size: 0.74rem;
      color: var(--text-muted);
    }
    .ph-stat--urgent .ph-stat__num { color: var(--urgent); }

    /* ===== Toolbar ===== */
    .toolbar-bar {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem 0.75rem;
      position: sticky;
      top: 64px;
      z-index: 20;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .toolbar__filters {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
    }
    .toolbar__divider {
      width: 1px; height: 24px; background: var(--border-strong); margin: 0 0.25rem;
    }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font: inherit; font-size: 0.85rem; font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .filter-chip [data-lucide] { width: 1rem; height: 1rem; }
    .filter-chip:hover:not([disabled]) {
      background: var(--bg-card);
      border-color: var(--border-strong);
    }
    .filter-chip[disabled] { opacity: 0.6; cursor: not-allowed; }
    .filter-chip.is-active {
      background: var(--primary);
      color: var(--on-primary);
      border-color: var(--primary);
    }
    .filter-chip--select { background: var(--bg-card); }
    .filter-chip--urgent {
      color: var(--urgent);
      border-color: var(--urgent-soft-border);
      background: var(--urgent-soft-bg);
    }
    .filter-chip--urgent:hover:not([disabled]) {
      background: #fee2e2;
      border-color: var(--urgent);
    }
    .filter-chip--urgent.is-active {
      background: var(--urgent);
      color: #fff;
      border-color: var(--urgent);
    }
    .toolbar__sort {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .toolbar__meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 0.65rem; padding-top: 0.65rem;
      border-top: 1px dashed var(--border);
      font-size: 0.85rem; color: var(--text-muted);
    }
    .toolbar__clear {
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
    }

    /* ===== Pets grid ===== */
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
      color: inherit;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      display: flex; flex-direction: column;
    }
    .pet-card:hover {
      transform: translateY(-3px);
      border-color: var(--primary-soft-border);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    .pet-card__media {
      height: 180px;
      background: var(--primary-soft-bg);
      color: var(--primary);
      display: flex; align-items: center; justify-content: center;
      position: relative;
      background-image:
        repeating-linear-gradient(135deg,
          transparent 0,
          transparent 12px,
          rgba(0,0,0,0.03) 12px,
          rgba(0,0,0,0.03) 13px);
    }
    .pet-card__img {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .pet-card__species {
      position: absolute; top: 0.65rem; left: 0.65rem;
      background: rgba(255,255,255,0.92);
      color: var(--primary-hover);
      border-radius: var(--radius-pill);
      padding: 0.25rem 0.6rem;
      font-size: 0.72rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.3rem;
      backdrop-filter: blur(4px);
      z-index: 1;
    }
    .pet-card__urgency {
      position: absolute; top: 0.65rem; right: 0.65rem;
      background: var(--urgent);
      color: #fff;
      border-radius: var(--radius-pill);
      padding: 0.22rem 0.6rem;
      font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.04em;
      z-index: 1;
    }
    .pet-card__placeholder-text {
      color: var(--primary-hover);
      font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      opacity: 0.55;
    }
    .pet-card__body { padding: 0.85rem 1rem 1rem; flex: 1; display: flex; flex-direction: column; }
    .pet-card__body h3 { font-size: 1rem; margin: 0 0 0.2rem; letter-spacing: -0.015em; }
    .pet-card__meta {
      margin: 0; color: var(--text-muted); font-size: 0.82rem;
      display: flex; align-items: center; gap: 0.4rem;
    }
    .pet-card__meta .dot {
      width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: 0.5;
    }
    .pet-card__tags {
      margin-top: 0.7rem;
      display: flex; flex-wrap: wrap; gap: 0.3rem;
    }
    .pet-tag {
      font-size: 0.7rem; font-weight: 500;
      color: var(--text-muted);
      padding: 0.2rem 0.55rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
    }

    /* ===== Pagination ===== */
    .pagination {
      margin-top: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .page-btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.55rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font: inherit; font-size: 0.9rem; font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .page-btn [data-lucide] { width: 1rem; height: 1rem; }
    .page-btn:hover:not(.is-disabled):not(:disabled) {
      border-color: var(--primary);
      color: var(--primary);
    }
    .page-btn.is-disabled,
    .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-numbers { display: inline-flex; align-items: center; gap: 0.3rem; }
    .page-num {
      min-width: 36px; height: 36px;
      border-radius: var(--radius-sm);
      background: transparent;
      border: 1px solid transparent;
      font: inherit; font-size: 0.9rem; font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: background 0.15s;
    }
    .page-num:hover { background: var(--bg-card); }
    .page-num.is-active {
      background: var(--primary);
      color: var(--on-primary);
    }
    .page-ellipsis { color: var(--text-muted); padding: 0 0.3rem; }

    /* ===== Help strip ===== */
    .help-strip {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }
    .help-strip h2 { font-size: 1.3rem; margin: 0 0 0.3rem; }
    .help-strip p { margin: 0; color: var(--text-muted); font-size: 0.95rem; }
    .help-strip__actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem 1.35rem;
      background: var(--primary);
      color: var(--on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font: inherit; font-size: 0.95rem; font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, transform 0.15s;
    }
    .btn:hover { background: var(--primary-hover); color: var(--on-primary); }
    .btn--ghost {
      background: transparent;
      color: var(--primary);
      box-shadow: inset 0 0 0 1.5px var(--primary-soft-border);
    }
    .btn--ghost:hover {
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
    }

    .empty {
      text-align: center;
      color: var(--text-muted);
      padding: 3rem 1rem;
      font-size: 1rem;
    }

    /* ===== Responsive ===== */
    @media (max-width: 980px) {
      .pets-grid--lg { grid-template-columns: repeat(2, 1fr); }
      .page-header__inner { grid-template-columns: 1fr; gap: 1.5rem; }
      .toolbar-bar { position: static; }
    }
    @media (max-width: 560px) {
      .pets-grid--lg { grid-template-columns: 1fr; }
      .page-header__stats { grid-template-columns: 1fr; }
    }
  `],
})
export class AdoptionListComponent implements AfterViewInit {
  private svc = inject(AdoptionService);
  theme = inject(ThemeService);

  loading = signal(true);
  private fetched = signal<PetCard[]>(FALLBACK_PETS);

  speciesFilter = signal<PetType | undefined>(undefined);
  urgentOnly = signal(false);
  page = signal(1);

  // Default the chip filter to whichever species the theme chose, but allow manual override.
  constructor() {
    effect(() => {
      this.speciesFilter.set(this.theme.petType());
    });
    effect(() => {
      this.theme.petType();
      this.load();
    });
    // Re-render Lucide icons whenever filtered list changes (chip toggles, page changes).
    effect(() => {
      this.paged();
      setTimeout(() => createIcons({ icons }), 0);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }

  filtered = computed(() => {
    let list = this.fetched();
    const sp = this.speciesFilter();
    if (sp) list = list.filter(p => p.species === sp);
    if (this.urgentOnly()) list = list.filter(p => p.urgent);
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)));

  paged = computed(() => {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  });

  pageNumbers = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    if (total <= 6) return Array.from({ length: total }, (_, i) => i + 1);
    const out: (number | '…')[] = [1];
    if (current > 3) out.push('…');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) out.push(i);
    if (current < total - 2) out.push('…');
    out.push(total);
    return out;
  });

  // Stats from the loaded set (would come from a /stats endpoint in a future iteration).
  dogCount = computed(() => this.fetched().filter(p => p.species === 'dog').length);
  catCount = computed(() => this.fetched().filter(p => p.species === 'cat').length);
  urgentCount = computed(() => this.fetched().filter(p => p.urgent).length);
  totalLabel = computed(() => `${this.fetched().length} oglasa`);

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

  toggleUrgent(): void {
    this.urgentOnly.update(v => !v);
    this.page.set(1);
  }

  resetFilters(): void {
    this.speciesFilter.set(this.theme.petType());
    this.urgentOnly.set(false);
    this.page.set(1);
  }

  goToPage(n: number): void {
    this.page.set(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevPage(): void {
    if (this.page() > 1) this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.goToPage(this.page() + 1);
  }

  private load(): void {
    this.loading.set(true);
    this.svc.list({ species: this.theme.petType() as Species }).subscribe({
      next: (rows) => {
        const cards = rows.map(r => this.toCard(r));
        this.fetched.set(cards.length ? cards : FALLBACK_PETS);
        this.loading.set(false);
        this.page.set(1);
      },
      error: () => {
        this.fetched.set(FALLBACK_PETS);
        this.loading.set(false);
      },
    });
  }

  private toCard(l: AdoptionListing): PetCard {
    const pet = l.pet;
    const photoUrl = pet?.photos?.[0]?.url
      ? (pet.photos[0].url.startsWith('http') ? pet.photos[0].url : `${environment.apiUrl}${pet.photos[0].url}`)
      : undefined;
    const tags = [pet?.breed, pet?.size].filter((t): t is string => !!t).slice(0, 2);
    if (pet?.vaccinated) tags.push('Vakcinisan');
    return {
      id: l.id,
      name: pet?.name ?? '—',
      species: (pet?.species ?? 'dog') as 'dog' | 'cat',
      speciesLabel: pet?.species === 'cat' ? 'Mačka' : 'Pas',
      city: l.city,
      age: pet?.age_years != null ? `${pet.age_years} god` : '',
      sex: pet?.sex === 'female' ? 'Ženka' : pet?.sex === 'male' ? 'Mužjak' : '',
      tags: tags.slice(0, 2),
      imageUrl: photoUrl,
    };
  }
}
