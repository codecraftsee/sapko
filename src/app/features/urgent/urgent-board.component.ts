import { AfterViewInit, Component, computed, effect, inject, signal } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterLink } from '@angular/router';
import { UrgentService } from '../../core/services/urgent.service';
import { UrgentRequest, UrgentType } from '../../core/models/api.models';
import { ThemeService, PetType } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

interface UrgentMeta {
  icon: string;
  label: string;
  ctaLabel: string;
}

const TYPE_META: Record<UrgentType, UrgentMeta> = {
  blood:               { icon: 'droplets',         label: 'Krv',        ctaLabel: 'Otvori oglas' },
  injured_stray:       { icon: 'stethoscope',      label: 'Povređeni',  ctaLabel: 'Detalji' },
  medical_fundraising: { icon: 'syringe',          label: 'Lečenje',    ctaLabel: 'Doniraj' },
  lost_pet:            { icon: 'search',           label: 'Izgubljeni', ctaLabel: 'Detalji' },
  food_donation:       { icon: 'utensils',         label: 'Hrana',      ctaLabel: 'Pomozi' },
  other:               { icon: 'alert-triangle',   label: 'Ostalo',     ctaLabel: 'Detalji' },
};

const TYPE_ORDER: UrgentType[] = [
  'blood', 'injured_stray', 'medical_fundraising', 'lost_pet', 'food_donation',
];

interface UrgentCard {
  id?: string;
  type: UrgentType;
  badge: string;
  badgeIcon: string;
  ctaLabel: string;
  time: string;
  title: string;
  description: string;
  city: string;
  species?: PetType;
  featured?: boolean;
}

const FALLBACK: UrgentCard[] = [
  { type: 'blood', badge: 'Krv · DEA 1.1−', badgeIcon: 'droplets', ctaLabel: 'Otvori oglas', time: 'Pre 2h', title: 'Hitno traži se donor krvi za operaciju u Beogradu', description: 'Đina ima planiranu operaciju do četvrtka i potreban joj je donor sa DEA 1.1− krvnom grupom.', city: 'Beograd · Vetex klinika', species: 'dog', featured: true },
  { type: 'injured_stray', badge: 'Povređen', badgeIcon: 'stethoscope', ctaLabel: 'Detalji', time: 'Pre 4h', title: 'Pas pronađen pored autoputa kod Pančeva', description: 'Mužjak srednje veličine, smeđi, bez čipa. Trenutno kod veterinara, traži se vlasnik ili dom.', city: 'Pančevo', species: 'dog' },
  { type: 'medical_fundraising', badge: 'Lečenje', badgeIcon: 'syringe', ctaLabel: 'Doniraj', time: 'Pre 6h', title: 'Sakupljamo za operaciju kuka — mačka Riba', description: 'Potrebno je 65.000 din za operaciju displazije kuka. Sakupljeno do sad: 42.000 din.', city: 'Novi Sad', species: 'cat' },
  { type: 'lost_pet', badge: 'Izgubljen', badgeIcon: 'search', ctaLabel: 'Detalji', time: 'Juče', title: 'Mačak Tisa nestao na Vračaru — bele šape', description: 'Sivi mačak sa belim šapama i belim trbuhom. Veoma plašljiv. Nagrada za informaciju.', city: 'Beograd · Vračar', species: 'cat' },
  { type: 'food_donation', badge: 'Hrana', badgeIcon: 'utensils', ctaLabel: 'Pomozi', time: 'Juče', title: 'Azilu u Vranju potrebna hrana za štence', description: 'Trenutno 32 šteneta na brizi. Trebamo suvu hranu za štence i konzerve.', city: 'Vranje', species: 'dog' },
  { type: 'blood', badge: 'Krv · DEA 1.1+', badgeIcon: 'droplets', ctaLabel: 'Otvori oglas', time: 'Juče', title: 'Donor potreban za maleno štene u Kragujevcu', description: 'Štene od 4 meseca prebačeno na hitnu intervenciju, hitno potrebna transfuzija.', city: 'Kragujevac', species: 'dog' },
  { type: 'injured_stray', badge: 'Povređen', badgeIcon: 'stethoscope', ctaLabel: 'Detalji', time: 'Pre 2 dana', title: 'Mačka pregažena u Subotici — hitna operacija', description: 'Stabilizovana, ali su potrebna dodatna sredstva za rehabilitaciju.', city: 'Subotica', species: 'cat' },
  { type: 'lost_pet', badge: 'Izgubljen', badgeIcon: 'search', ctaLabel: 'Detalji', time: 'Pre 2 dana', title: 'Pas Argo nestao kod Ade Ciganlije', description: 'Beli labrador, 5 godina, ima crveni okovratnik. Poslednji put viđen u petak.', city: 'Beograd · Ada', species: 'dog' },
  { type: 'medical_fundraising', badge: 'Lečenje', badgeIcon: 'syringe', ctaLabel: 'Doniraj', time: 'Pre 3 dana', title: 'Štene Mrva — sakupljanje za parvo terapiju', description: 'Pozitivno na parvovirus, potrebna intenzivna terapija.', city: 'Beograd', species: 'dog' },
];

const PAGE_SIZE = 9;

@Component({
  selector: 'app-urgent-board',
  imports: [RouterLink],
  template: `
    <!-- ===================== PAGE HEADER ===================== -->
    <section class="page-header page-header--urgent">
      <div class="container">
        <div class="page-header__inner">
          <div>
            <span class="eyebrow eyebrow--urgent">
              <i data-lucide="alert-triangle" class="icon--sm"></i>
              Tabla hitnih
            </span>
            <h1>Ovo ne može da čeka.</h1>
            <p class="lead">
              Svaki sat je važan. Ovde su trenutno otvoreni hitni pozivi — donori krvi, izgubljeni ljubimci,
              povređene životinje koje traže vet ili dom, sakupljanje za lečenje.
            </p>
          </div>
          <div class="page-header__stats">
            <div class="ph-stat ph-stat--urgent">
              <span class="ph-stat__num">{{ totalCount() }}</span>
              <span class="ph-stat__label">aktivnih hitnih</span>
            </div>
            <div class="ph-stat">
              <span class="ph-stat__num">3h</span>
              <span class="ph-stat__label">prosečan odziv</span>
            </div>
            <div class="ph-stat">
              <span class="ph-stat__num">87%</span>
              <span class="ph-stat__label">rešeno za 48h</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TYPE TABS ===================== -->
    <section class="type-tabs-bar">
      <div class="container">
        <div class="species-chips" role="group" aria-label="Filter po vrsti">
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
        </div>

        <div class="type-tabs" role="tablist">
          <button
            class="type-tab"
            [class.is-active]="!typeFilter()"
            (click)="setType(undefined)"
          >
            Sve <span class="type-tab__count">{{ allTypeCount() }}</span>
          </button>
          @for (t of typeOrder; track t) {
            <button
              class="type-tab"
              [class.is-active]="typeFilter() === t"
              (click)="setType(t)"
            >
              <i [attr.data-lucide]="meta[t].icon"></i>
              {{ meta[t].label }}
              <span class="type-tab__count">{{ countOfType(t) }}</span>
            </button>
          }
        </div>

        <div class="toolbar__meta">
          <span><strong>{{ filtered().length }}</strong> aktivnih hitnih{{ pagedRangeLabel() }}</span>
          <span class="toolbar__sort">
            Sortiraj:
            <button class="filter-chip filter-chip--select" disabled>
              Najnoviji prvi <i data-lucide="chevron-down"></i>
            </button>
          </span>
        </div>
      </div>
    </section>

    <!-- ===================== URGENT GRID ===================== -->
    <section class="block urgent-section">
      <div class="container">
        @if (loading()) {
          <p class="empty">Učitavanje…</p>
        } @else if (paged().length === 0) {
          <p class="empty">Nema otvorenih zahteva za izabrane filtere.</p>
        } @else {
          <div class="urgent-grid urgent-grid--full">
            @for (u of paged(); track u.title + u.city) {
              <a
                [routerLink]="u.id ? ['/urgentno', u.id] : ['/urgentno']"
                class="urgent-card"
                [class.urgent-card--featured]="u.featured"
                [attr.data-type]="u.type"
              >
                <div class="urgent-card__head">
                  <span class="urgent-badge">
                    <i [attr.data-lucide]="u.badgeIcon" class="icon--sm"></i>
                    {{ u.badge }}
                  </span>
                  <span class="urgent-time">
                    <i data-lucide="clock" class="icon--sm"></i>
                    {{ u.time }}
                  </span>
                </div>
                <h3>{{ u.title }}</h3>
                <p>{{ u.description }}</p>
                <div class="urgent-card__footer">
                  <span class="urgent-card__loc">
                    <i data-lucide="map-pin" class="icon--sm"></i>
                    {{ u.city }}
                  </span>
                  <span class="urgent-card__cta">
                    {{ u.ctaLabel }} <i data-lucide="arrow-right" class="icon--sm"></i>
                  </span>
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

    <!-- ===================== POST URGENT CTA ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        <div class="help-strip help-strip--urgent">
          <div>
            <h2>Imate hitnu situaciju?</h2>
            <p>Postavite oglas za hitnu pomoć — naš tim verifikuje i objavi ga u roku od 30 minuta.</p>
          </div>
          <div class="help-strip__actions">
            <a routerLink="/moj-nalog" class="btn btn--ondark">
              <i data-lucide="bell-plus"></i>
              Prijavi hitno
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
    section.block--tight-top { padding-top: 0; }
    .urgent-section { background: var(--bg-subtle); }

    /* ===== Page header ===== */
    .page-header {
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--urgent) 14%, transparent) 0%, transparent 60%),
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
    .eyebrow--urgent {
      background: var(--urgent-soft-bg);
      color: var(--urgent);
      border-color: var(--urgent-soft-border);
    }
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

    /* ===== Type tabs ===== */
    .type-tabs-bar {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      padding: 1rem 1.5rem 0.75rem;
      position: sticky;
      top: 64px;
      z-index: 20;
    }
    .species-chips {
      display: flex; gap: 0.4rem; flex-wrap: wrap;
      margin-bottom: 0.7rem;
      padding-bottom: 0.7rem;
      border-bottom: 1px dashed var(--border);
    }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.4rem 0.8rem;
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font: inherit; font-size: 0.85rem; font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s;
    }
    .filter-chip [data-lucide] { width: 1rem; height: 1rem; }
    .filter-chip:hover:not([disabled]) { border-color: var(--border-strong); }
    .filter-chip[disabled] { opacity: 0.6; cursor: not-allowed; }
    .filter-chip.is-active {
      background: var(--primary);
      color: var(--on-primary);
      border-color: var(--primary);
    }
    .filter-chip--select { background: var(--bg-card); }

    .type-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .type-tab {
      display: inline-flex; align-items: center; gap: 0.45rem;
      padding: 0.55rem 1rem;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font: inherit; font-size: 0.88rem; font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s;
    }
    .type-tab [data-lucide] { width: 1rem; height: 1rem; }
    .type-tab:hover { background: var(--bg-base); border-color: var(--border-strong); }
    .type-tab.is-active {
      background: var(--urgent);
      border-color: var(--urgent);
      color: #fff;
    }
    .type-tab__count {
      font-size: 0.78rem;
      font-weight: 600;
      padding: 1px 7px;
      border-radius: var(--radius-pill);
      background: rgba(0,0,0,0.06);
    }
    .type-tab.is-active .type-tab__count { background: rgba(255,255,255,0.18); }
    .toolbar__meta {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 0.65rem; padding-top: 0.65rem;
      border-top: 1px dashed var(--border);
      font-size: 0.85rem; color: var(--text-muted);
    }
    .toolbar__sort { display: inline-flex; align-items: center; gap: 0.5rem; }

    /* ===== Urgent grid (3 cols, featured spans 2) ===== */
    .urgent-grid {
      display: grid;
      gap: 1rem;
    }
    .urgent-grid--full {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: auto;
    }
    .urgent-grid--full .urgent-card--featured {
      grid-column: span 2;
      grid-row: span 1;
    }
    .urgent-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-left: 3px solid var(--urgent);
      border-radius: var(--radius-md);
      padding: 1.25rem 1.4rem;
      color: inherit; text-decoration: none;
      display: flex; flex-direction: column; gap: 0.5rem;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .urgent-card:hover {
      transform: translateY(-2px);
      border-color: var(--urgent);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    .urgent-card--featured {
      background: var(--urgent-soft-bg);
      border: 1px solid var(--urgent-soft-border);
      border-left: 3px solid var(--urgent);
      padding: 1.75rem;
    }
    .urgent-card__head {
      display: flex; align-items: center; gap: 0.6rem;
      flex-wrap: wrap;
    }
    .urgent-badge {
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.28rem 0.65rem;
      background: #fff;
      color: var(--urgent);
      border: 1px solid var(--urgent-soft-border);
      border-radius: var(--radius-pill);
      font-size: 0.72rem; font-weight: 600;
    }
    .urgent-badge [data-lucide] { width: 0.9rem; height: 0.9rem; }
    .urgent-time {
      font-size: 0.74rem; color: var(--text-muted);
      display: inline-flex; align-items: center; gap: 0.25rem;
    }
    .urgent-time [data-lucide] { width: 0.9rem; height: 0.9rem; }
    .urgent-card h3 {
      font-size: 1rem; letter-spacing: -0.015em;
      margin: 0;
    }
    .urgent-card--featured h3 { font-size: 1.4rem; }
    .urgent-card p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.5;
    }
    .urgent-card__footer {
      margin-top: auto;
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 0.4rem;
      font-size: 0.82rem;
      color: var(--text-muted);
    }
    .urgent-card__cta {
      color: var(--urgent); font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.3rem;
    }
    .urgent-card__cta [data-lucide],
    .urgent-card__loc [data-lucide] { width: 0.95rem; height: 0.95rem; }
    .urgent-card__loc {
      display: inline-flex; align-items: center; gap: 0.3rem;
    }

    /* ===== Pagination ===== */
    .pagination {
      margin-top: 2.5rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem; flex-wrap: wrap;
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
      transition: all 0.15s;
    }
    .page-btn [data-lucide] { width: 1rem; height: 1rem; }
    .page-btn:hover:not(.is-disabled):not(:disabled) {
      border-color: var(--urgent);
      color: var(--urgent);
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
    }
    .page-num:hover { background: var(--bg-card); }
    .page-num.is-active {
      background: var(--urgent);
      color: #fff;
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
    .help-strip--urgent {
      background: var(--bg-deep);
      color: #FBF6EE;
      border-color: transparent;
    }
    .help-strip--urgent h2 { color: #fff; }
    .help-strip--urgent p { color: #C9BCAE; }

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
    .btn [data-lucide] { width: 1.05rem; height: 1.05rem; }
    .btn:hover { background: var(--primary-hover); color: var(--on-primary); }
    .btn--ondark {
      background: var(--urgent);
      color: #fff;
    }
    .btn--ondark:hover { background: var(--urgent-hover); color: #fff; }

    .empty {
      text-align: center;
      color: var(--text-muted);
      padding: 3rem 1rem;
      font-size: 1rem;
    }

    /* ===== Responsive ===== */
    @media (max-width: 980px) {
      .urgent-grid--full { grid-template-columns: 1fr; }
      .urgent-grid--full .urgent-card--featured { grid-column: auto; }
      .page-header__inner { grid-template-columns: 1fr; gap: 1.5rem; }
      .type-tabs-bar { position: static; }
    }
    @media (max-width: 560px) {
      .page-header__stats { grid-template-columns: 1fr; }
    }
  `],
})
export class UrgentBoardComponent implements AfterViewInit {
  private svc = inject(UrgentService);
  theme = inject(ThemeService);

  private fetched = signal<UrgentCard[]>(FALLBACK);
  loading = signal(true);

  speciesFilter = signal<PetType | undefined>(undefined);
  typeFilter = signal<UrgentType | undefined>(undefined);
  page = signal(1);

  readonly meta = TYPE_META;
  readonly typeOrder = TYPE_ORDER;

  constructor() {
    // Default species chip to active theme; user can manually override.
    effect(() => {
      this.speciesFilter.set(this.theme.petType());
    });
    effect(() => {
      // Re-load when theme changes — service supports species filter.
      this.theme.petType();
      this.load();
    });
    // Re-render Lucide whenever filters/page change.
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
    if (sp) list = list.filter(u => !u.species || u.species === sp);
    const t = this.typeFilter();
    if (t) list = list.filter(u => u.type === t);
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

  totalCount = computed(() => this.fetched().length);
  allTypeCount = computed(() => {
    const sp = this.speciesFilter();
    if (!sp) return this.fetched().length;
    return this.fetched().filter(u => !u.species || u.species === sp).length;
  });

  countOfType(t: UrgentType): number {
    const sp = this.speciesFilter();
    return this.fetched().filter(u => u.type === t && (!sp || !u.species || u.species === sp)).length;
  }

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

  setType(t: UrgentType | undefined): void {
    this.typeFilter.set(t);
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

  photoUrl(url: string): string {
    return url.startsWith('http') ? url : `${environment.apiUrl}${url}`;
  }

  private load(): void {
    this.loading.set(true);
    this.svc.list({ species: this.theme.petType() }).subscribe({
      next: (rows) => {
        const cards = rows.map(r => this.toCard(r));
        this.fetched.set(cards.length ? cards : FALLBACK);
        this.loading.set(false);
        this.page.set(1);
      },
      error: () => {
        this.fetched.set(FALLBACK);
        this.loading.set(false);
      },
    });
  }

  private toCard(r: UrgentRequest, index = 0): UrgentCard {
    const m = TYPE_META[r.type];
    return {
      id: r.id,
      type: r.type,
      badge: m.label,
      badgeIcon: m.icon,
      ctaLabel: m.ctaLabel,
      time: this.relativeTime(r.created_at),
      title: r.title,
      description: r.description,
      city: r.city,
      species: r.species,
      featured: index === 0,
    };
  }

  private relativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.round(diffMs / 3_600_000);
    if (hours < 1) return 'Upravo';
    if (hours < 24) return `Pre ${hours}h`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'Juče';
    return `Pre ${days} dana`;
  }
}
