import { AfterViewInit, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { ThemeService, PetType } from '../../core/services/theme.service';
import { AdoptionService } from '../../core/services/adoption.service';
import { UrgentService } from '../../core/services/urgent.service';
import { AdoptionListing, UrgentRequest, UrgentType } from '../../core/models/api.models';

interface PetCard {
  name: string;
  species: 'dog' | 'cat';
  speciesLabel: string;
  city: string;
  age: string;
  sex: string;
  tags: string[];
  urgent?: boolean;
  imageHint: string;
}

interface UrgentItem {
  type: 'krv' | 'povredjen' | 'lecenje' | 'izgubljen' | 'hrana';
  badge: string;
  badgeIcon: string;
  time: string;
  title: string;
  excerpt?: string;
  city: string;
  ctaLabel: string;
  featured?: boolean;
}

const URGENT_TYPE_META: Record<UrgentType, { badge: string; badgeIcon: string; ctaLabel: string }> = {
  blood:               { badge: 'Krv',        badgeIcon: 'droplets',         ctaLabel: 'Otvori oglas' },
  injured_stray:       { badge: 'Povređen',   badgeIcon: 'stethoscope',      ctaLabel: 'Detalji' },
  medical_fundraising: { badge: 'Lečenje',    badgeIcon: 'syringe',          ctaLabel: 'Doniraj' },
  lost_pet:            { badge: 'Izgubljen',  badgeIcon: 'search',           ctaLabel: 'Detalji' },
  food_donation:       { badge: 'Hrana',      badgeIcon: 'utensils',         ctaLabel: 'Pomozi' },
  other:               { badge: 'Hitno',      badgeIcon: 'alert-triangle',   ctaLabel: 'Detalji' },
};

const FALLBACK_PETS: PetCard[] = [
  { name: 'Luka', species: 'dog', speciesLabel: 'Pas',   city: 'Beograd',    age: '3 god', sex: 'Mužjak', tags: ['Druželjubiv', 'Vakcinisan'],   imageHint: 'luka.jpg' },
  { name: 'Mia',  species: 'dog', speciesLabel: 'Pas',   city: 'Novi Sad',   age: '5 god', sex: 'Ženka',  tags: ['Sterilisana', 'Sa decom'],     imageHint: 'mia.jpg' },
  { name: 'Mrva', species: 'cat', speciesLabel: 'Mačka', city: 'Niš',        age: '2 god', sex: 'Ženka',  tags: ['U privremenom domu'], urgent: true, imageHint: 'mrva.jpg' },
  { name: 'Reks', species: 'dog', speciesLabel: 'Pas',   city: 'Kragujevac', age: '4 god', sex: 'Mužjak', tags: ['Treniran', 'Velika rasa'],     imageHint: 'reks.jpg' },
];

const FALLBACK_URGENT: UrgentItem[] = [
  {
    type: 'krv',
    badge: 'Krv · DEA 1.1−',
    badgeIcon: 'droplets',
    time: 'Pre 2 sata',
    title: 'Hitno traži se donor krvi za operaciju u Beogradu',
    excerpt: 'Naša Đina ima planiranu operaciju do četvrtka i potreban joj je donor sa DEA 1.1− krvnom grupom. Ako vaš pas može pomoći, javite se direktno na klinici "Vetex".',
    city: 'Beograd · Vetex klinika',
    ctaLabel: 'Otvori oglas',
    featured: true,
  },
  { type: 'povredjen', badge: 'Povređen', badgeIcon: 'stethoscope', time: 'Pre 4h', title: 'Pas pronađen pored autoputa kod Pančeva', city: 'Pančevo',  ctaLabel: 'Detalji' },
  { type: 'lecenje',   badge: 'Lečenje',  badgeIcon: 'syringe',     time: 'Pre 6h', title: 'Sakupljamo za operaciju kuka — mačka Riba', city: 'Novi Sad', ctaLabel: 'Doniraj' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <span class="eyebrow">
        <i data-lucide="hand-heart"></i>
        Dobrodošli u Šapko
      </span>
      <h1>Svakoj šapi treba neko. Izaberite svoj tim.</h1>
      <p class="lead">
        Šapko povezuje ljude koji žele da pomognu psima i mačkama u Srbiji —
        udomljavanje, donor krvi i hitna pomoć na jednom mestu.
      </p>

      <div class="species-picker" role="group" aria-label="Izaberite vrstu">
        <button
          type="button"
          class="species-tile"
          [class.is-active]="theme.petType() === 'dog'"
          [attr.aria-pressed]="theme.petType() === 'dog'"
          (click)="setSpecies('dog')"
        >
          <span class="species-tile__icon"><i data-lucide="dog"></i></span>
          <span class="species-tile__label">Psi</span>
          <span class="species-tile__meta">1.247 oglasa</span>
        </button>
        <button
          type="button"
          class="species-tile"
          [class.is-active]="theme.petType() === 'cat'"
          [attr.aria-pressed]="theme.petType() === 'cat'"
          (click)="setSpecies('cat')"
        >
          <span class="species-tile__icon"><i data-lucide="cat"></i></span>
          <span class="species-tile__label">Mačke</span>
          <span class="species-tile__meta">600 oglasa</span>
        </button>
        <button
          type="button"
          class="species-tile is-disabled"
          aria-disabled="true"
          disabled
        >
          <span class="species-tile__icon"><i data-lucide="bird"></i></span>
          <span class="species-tile__label">Ptice</span>
          <span class="species-tile__meta">Uskoro</span>
        </button>
      </div>
    </section>

    <!-- ===================== IMPACT ===================== -->
    <section class="impact" aria-label="Naši rezultati">
      <div class="impact-grid">
        @for (item of impact; track item.label) {
          <div class="impact-item">
            <span class="impact-num"><span>{{ item.num }}</span></span>
            <div class="impact-label">{{ item.label }}</div>
          </div>
        }
      </div>
    </section>

    <!-- ===================== HOW IT WORKS ===================== -->
    <section class="block">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Kako radi</span>
            <h2>Tri koraka do dobrog dela.</h2>
          </div>
          <p>Bez obzira da li tražite ljubimca, nudite dom ili želite da postanete donor — sve je transparentno i pod kontrolom.</p>
        </div>

        <div class="how-grid">
          @for (s of steps; track s.num) {
            <article class="step">
              <span class="step__num">{{ s.num }}</span>
              <div class="step__icon"><i [attr.data-lucide]="s.icon"></i></div>
              <h3>{{ s.title }}</h3>
              <p>{{ s.body }}</p>
            </article>
          }
        </div>

        <div class="how-more">
          <a routerLink="/kako-radi" class="btn btn--ghost">
            Saznaj više o procesu <i data-lucide="arrow-right" class="icon--sm"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- ===================== ADOPTEES ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Udomljavanje</span>
            <h2>Čekaju svoj zauvek dom.</h2>
          </div>
          <a routerLink="/udomi" class="section-cta">
            Svi oglasi <i data-lucide="arrow-right" class="icon--sm"></i>
          </a>
        </div>

        <div class="pets-grid">
          @for (p of pets(); track p.name) {
            <a routerLink="/udomi" class="pet-card">
              <div class="pet-card__media">
                <span class="pet-card__species">
                  <i [attr.data-lucide]="p.species" class="icon--sm"></i>
                  {{ p.speciesLabel }}
                </span>
                @if (p.urgent) {
                  <span class="pet-card__urgency">Hitno</span>
                }
                <span class="pet-card__placeholder-text">[ {{ p.imageHint }} ]</span>
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
      </div>
    </section>

    <!-- ===================== URGENT BOARD ===================== -->
    <section class="block urgent-section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag tag--urgent">Tabla hitnih</span>
            <h2>Ovo ne može da čeka.</h2>
          </div>
          <a routerLink="/urgentno" class="section-cta section-cta--urgent">
            Sve hitno <i data-lucide="arrow-right" class="icon--sm"></i>
          </a>
        </div>

        <div class="urgent-grid">
          @for (u of urgent(); track u.title) {
            <a
              routerLink="/urgentno"
              class="urgent-card"
              [class.urgent-card--featured]="u.featured"
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
              @if (u.excerpt) { <p>{{ u.excerpt }}</p> }
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

        <a routerLink="/urgentno" class="urgent-more">
          <span>Još hitnih poziva čeka odgovor</span>
          <span class="urgent-more__cta">
            Vidi sve <i data-lucide="arrow-right" class="icon--sm"></i>
          </span>
        </a>
      </div>
    </section>

    <!-- ===================== DONOR CTA ===================== -->
    <section class="block">
      <div class="container">
        <div class="donor">
          <div>
            <span class="donor-eyebrow">
              <i data-lucide="droplets" class="icon--sm"></i>
              Donori krvi
            </span>
            <h2>Vaš pas može da spasi život.</h2>
            <p>
              Jedna donacija krvi može spasiti do tri života. Šapko vodi prvi otvoreni
              registar donora u Srbiji — povezujemo vas direktno sa veterinarima i
              klinikama kojima je donor potreban.
            </p>
            <div class="donor-actions">
              <a routerLink="/donori" class="btn btn--ondark btn--lg">
                <i data-lucide="heart"></i> Postani donor
              </a>
              <a routerLink="/donori" class="btn btn--outline-light btn--lg">Saznaj više</a>
            </div>
          </div>
          <div class="donor-stats">
            <div class="donor-stat">
              <i data-lucide="droplets"></i>
              <div>
                <div class="donor-stat__num">312 aktivnih donora</div>
                <div class="donor-stat__label">u 14 gradova širom Srbije</div>
              </div>
            </div>
            <div class="donor-stat">
              <i data-lucide="badge-check"></i>
              <div>
                <div class="donor-stat__num">Provereni profili</div>
                <div class="donor-stat__label">Svaki donor verifikovan kod veterinara</div>
              </div>
            </div>
            <div class="donor-stat">
              <i data-lucide="zap"></i>
              <div>
                <div class="donor-stat__num">Prosečan odziv: 3h</div>
                <div class="donor-stat__label">Od poziva do potvrđenog donora</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TESTIMONIALS ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Priče zajednice</span>
            <h2>Mali zahvati, velike promene.</h2>
          </div>
        </div>

        <div class="testimonial-grid">
          @for (q of quotes; track q.author) {
            <article class="quote">
              <span class="quote__mark">“</span>
              <p class="quote__text">{{ q.text }}</p>
              <div class="quote__author">
                <span class="quote__avatar" [class.quote__avatar--urgent]="q.role.includes('Veterinar')">
                  {{ q.initials }}
                </span>
                <div>
                  <div class="quote__name">{{ q.author }}</div>
                  <div class="quote__role">{{ q.role }}</div>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- ===================== PARTNERS ===================== -->
    <section class="partners" aria-label="Partneri">
      <div class="partners-inner">
        <span class="partners-label">Sa nama sarađuju</span>
        <div class="partners-list">
          @for (p of partners; track p.name) {
            <span class="partner">
              <i [attr.data-lucide]="p.icon"></i>
              {{ p.name }}
            </span>
          }
        </div>
      </div>
    </section>

    <!-- ===================== JOIN ===================== -->
    <section class="block">
      <div class="container">
        <div class="join">
          <h2>Pridružite se zajednici od preko 8.000 ljudi koji pomažu.</h2>
          <p>Registracija je besplatna. Postavite oglas, javite se na hitan poziv ili samo budite u toku — vaš dom za životinje koje ga još uvek nemaju.</p>
          <div class="join-actions">
            <a routerLink="/registracija" class="btn btn--lg">
              <i data-lucide="user-plus"></i> Registruj se besplatno
            </a>
            <a routerLink="/kako-radi" class="btn btn--ghost btn--lg">Kako Šapko radi</a>
          </div>
        </div>
      </div>
    </section>

  `,
  styles: [`
    :host { display: block; }

    /* ============== HERO ============== */
    .hero {
      position: relative;
      padding: 3.5rem 1.5rem 3rem;
      text-align: center;
      overflow: hidden;
      background:
        radial-gradient(circle at 18% 0%, var(--primary-soft-bg) 0%, transparent 55%),
        radial-gradient(circle at 100% 100%, var(--primary-soft-bg) 0%, transparent 50%),
        var(--bg-base);
      transition: background 0.6s ease;
    }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.8rem;
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
      border: 1px solid var(--primary-soft-border);
      border-radius: 999px;
      font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      margin-bottom: 1.1rem;
      font-family: var(--font-body);
    }
    .eyebrow [data-lucide] { width: 0.95rem; height: 0.95rem; }

    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2rem, 4.8vw, 3.2rem);
      margin: 0 0 0.9rem;
      letter-spacing: -0.025em;
      max-width: 760px;
      margin-left: auto; margin-right: auto;
      text-wrap: balance;
      color: var(--text);
    }
    .hero .lead {
      margin: 0 auto;
      max-width: 580px;
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.55;
    }

    /* ============== SPECIES PICKER ============== */
    .species-picker {
      margin: 2.25rem auto 0;
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      max-width: 720px;
    }
    .species-tile {
      position: relative;
      width: 200px;
      background: var(--bg-card);
      border: 1.5px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem 1.25rem 1.25rem;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 0.4rem;
      color: var(--text);
      font: inherit;
      font-family: var(--font-body);
      cursor: pointer;
      transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
      box-shadow: var(--shadow-card);
    }
    .species-tile:hover:not(.is-disabled):not(.is-active) {
      transform: translateY(-3px);
      border-color: var(--primary-soft-border);
      box-shadow: var(--shadow-hover);
    }
    .species-tile__icon {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: var(--primary-soft-bg);
      color: var(--primary);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 0.4rem;
      transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }
    .species-tile__icon [data-lucide] { width: 32px; height: 32px; }
    .species-tile__label {
      font-size: 1.1rem; font-weight: 700;
      letter-spacing: -0.01em;
      font-family: var(--font-display);
    }
    .species-tile__meta {
      font-size: 0.78rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .species-tile.is-active {
      background: var(--primary-soft-bg);
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-soft-bg), var(--shadow-hover);
      transform: translateY(-3px);
    }
    .species-tile.is-active .species-tile__icon {
      background: var(--primary);
      color: white;
      transform: scale(1.05);
    }
    .species-tile.is-active .species-tile__label,
    .species-tile.is-active .species-tile__meta { color: var(--primary); }
    .species-tile.is-disabled {
      opacity: 0.55;
      cursor: not-allowed;
      background: var(--bg-subtle);
    }
    .species-tile.is-disabled .species-tile__icon {
      background: var(--border);
      color: var(--text-muted);
    }
    .species-tile.is-disabled .species-tile__meta {
      color: var(--text-muted);
      font-style: italic;
    }

    /* ============== IMPACT STRIP ============== */
    .impact {
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      background: var(--bg-card);
      padding: 1.75rem 1.5rem;
    }
    .impact-grid {
      max-width: 1180px; margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0;
    }
    .impact-item {
      text-align: center;
      padding: 0.5rem 1rem;
      border-right: 1px solid var(--border);
    }
    .impact-item:last-child { border-right: none; }
    .impact-num {
      font-family: var(--font-display);
      font-size: 2rem; font-weight: 800;
      color: var(--text);
      letter-spacing: -0.03em;
      line-height: 1;
      display: block;
    }
    .impact-num span { color: var(--primary); }
    .impact-label {
      margin-top: 0.4rem;
      font-size: 0.82rem;
      color: var(--text-muted);
      letter-spacing: 0.02em;
    }

    /* ============== SECTION SCAFFOLD ============== */
    .container { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
    section.block { padding: 4.5rem 0; }
    section.block--tight-top { padding-top: 0; }

    .section-head {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 2rem; gap: 1.5rem;
      flex-wrap: wrap;
    }
    .section-head h2 {
      font-family: var(--font-display);
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      letter-spacing: -0.02em;
      margin: 0;
      max-width: 640px;
      text-wrap: balance;
      color: var(--text);
    }
    .section-head .tag {
      display: inline-block;
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--primary);
      margin-bottom: 0.6rem;
    }
    .section-head .tag--urgent { color: #DC2626; }
    .section-head p {
      margin: 0; max-width: 460px;
      color: var(--text-muted);
      font-size: 0.98rem;
    }
    .section-head a.section-cta {
      color: var(--primary); font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.3rem;
      white-space: nowrap;
      text-decoration: none;
    }
    .section-head a.section-cta--urgent { color: #DC2626; }

    .icon--sm { width: 1rem !important; height: 1rem !important; }

    /* ============== HOW IT WORKS ============== */
    .how-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    .how-more {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
    }
    .step {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.75rem 1.5rem;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-card);
    }
    .step__num {
      position: absolute; top: 1rem; right: 1.25rem;
      font-family: var(--font-display);
      font-size: 3.5rem; font-weight: 800;
      line-height: 1;
      color: var(--primary-soft-bg);
      letter-spacing: -0.05em;
    }
    .step__icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
    }
    .step__icon [data-lucide] { width: 1.5rem; height: 1.5rem; }
    .step h3 {
      font-family: var(--font-display);
      font-size: 1.15rem; margin: 0 0 0.4rem;
      color: var(--text);
    }
    .step p { margin: 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.55; }

    /* ============== ADOPTEES ============== */
    .pets-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .pet-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-card);
      color: inherit;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      display: flex; flex-direction: column;
    }
    .pet-card:hover {
      transform: translateY(-3px);
      border-color: var(--primary-soft-border);
      box-shadow: var(--shadow-hover);
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
          rgba(0,0,0,0.03) 13px
        );
    }
    .pet-card__species {
      position: absolute; top: 0.65rem; left: 0.65rem;
      background: rgba(255,255,255,0.92);
      color: var(--primary);
      border-radius: 999px;
      padding: 0.25rem 0.6rem;
      font-size: 0.72rem; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.3rem;
      backdrop-filter: blur(4px);
    }
    .pet-card__urgency {
      position: absolute; top: 0.65rem; right: 0.65rem;
      background: #DC2626;
      color: #fff;
      border-radius: 999px;
      padding: 0.22rem 0.6rem;
      font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.04em;
    }
    .pet-card__placeholder-text {
      color: var(--primary);
      font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
      font-size: 0.7rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      opacity: 0.55;
    }
    .pet-card__body { padding: 0.85rem 1rem 1rem; flex: 1; display: flex; flex-direction: column; }
    .pet-card__body h3 {
      font-family: var(--font-display);
      font-size: 1.05rem; margin: 0 0 0.2rem;
      color: var(--text);
    }
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
      border-radius: 999px;
    }

    /* ============== URGENT BOARD ============== */
    .urgent-section { background: var(--bg-subtle); }
    .urgent-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 1rem;
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
      grid-row: span 2;
      grid-column: 1;
      background: var(--urgent-soft-bg);
      border: 1px solid var(--urgent-soft-border);
      border-left: 3px solid var(--urgent);
      padding: 1.75rem;
    }
    .urgent-more {
      grid-column: 1 / -1;
      margin-top: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.95rem 1.4rem;
      background: var(--bg-card);
      border: 1px dashed var(--border);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: border-color 0.2s, background 0.2s, color 0.2s;
    }
    .urgent-more:hover {
      border-color: var(--urgent);
      background: var(--urgent-soft-bg);
      color: var(--text);
    }
    .urgent-more__cta {
      color: var(--urgent);
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .urgent-card__head {
      display: flex; align-items: center; gap: 0.6rem;
      flex-wrap: wrap;
    }
    .urgent-badge {
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.28rem 0.65rem;
      background: #fff;
      color: #DC2626;
      border: 1px solid #FECACA;
      border-radius: 999px;
      font-size: 0.72rem; font-weight: 600;
    }
    .urgent-time {
      font-size: 0.74rem; color: var(--text-muted);
      display: inline-flex; align-items: center; gap: 0.25rem;
    }
    .urgent-card h3 {
      font-family: var(--font-display);
      font-size: 1rem; letter-spacing: -0.015em;
      margin: 0;
      color: var(--text);
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
      color: #DC2626; font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.3rem;
    }
    .urgent-card__loc {
      display: inline-flex; align-items: center; gap: 0.3rem;
    }

    /* ============== DONOR CTA ============== */
    .donor {
      background: #2A211A;
      color: #FBF6EE;
      border-radius: 24px;
      padding: 3rem;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2.5rem;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    .donor::before {
      content: "";
      position: absolute;
      right: -120px; top: -120px;
      width: 360px; height: 360px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(220,38,38,0.18), transparent 70%);
    }
    .donor h2 {
      font-family: var(--font-display);
      color: #fff;
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      margin: 0 0 0.85rem;
    }
    .donor p { color: #DDD2C2; max-width: 480px; margin: 0 0 1.5rem; }
    .donor .donor-eyebrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      background: rgba(220,38,38,0.15);
      color: #FCA5A5;
      border: 1px solid rgba(220,38,38,0.3);
      border-radius: 999px;
      font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      margin-bottom: 1.1rem;
    }
    .donor-stats {
      display: flex; flex-direction: column; gap: 0.8rem;
      position: relative; z-index: 1;
    }
    .donor-stat {
      background: rgba(251,246,238,0.06);
      border: 1px solid rgba(251,246,238,0.12);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex; align-items: center; gap: 0.9rem;
    }
    .donor-stat > [data-lucide] {
      width: 24px; height: 24px;
      color: #FCA5A5;
      flex-shrink: 0;
      padding: 8px;
      box-sizing: content-box;
      background: rgba(220,38,38,0.18);
      border-radius: 8px;
    }
    .donor-stat__num { font-weight: 700; font-size: 1.05rem; color: #fff; }
    .donor-stat__label { font-size: 0.82rem; color: #BCA999; }
    .donor-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }

    /* ============== BUTTONS (page-local; deck-bg) ============== */
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.35rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 8px;
      font-family: var(--font-body);
      font-size: 0.95rem; font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, transform 0.15s, box-shadow 0.2s;
    }
    .btn:hover { background: var(--primary-hover); color: white; transform: translateY(-1px); }
    .btn:active { transform: translateY(1px); }
    .btn--lg { padding: 0.95rem 1.7rem; font-size: 1rem; }
    .btn [data-lucide] { width: 1.1rem; height: 1.1rem; }
    .btn--ghost {
      background: transparent;
      color: var(--primary);
      box-shadow: inset 0 0 0 1.5px var(--primary-soft-border);
    }
    .btn--ghost:hover {
      background: var(--primary-soft-bg);
      color: var(--primary);
    }
    .btn--ondark { background: #DC2626; color: #fff; }
    .btn--ondark:hover { background: #B91C1C; color: #fff; }
    .btn--outline-light {
      background: transparent; color: #FBF6EE;
      box-shadow: inset 0 0 0 1.5px rgba(251,246,238,0.25);
    }
    .btn--outline-light:hover { background: rgba(251,246,238,0.08); color: #fff; }

    /* ============== TESTIMONIAL ============== */
    .testimonial-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    .quote {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      position: relative;
      box-shadow: var(--shadow-card);
    }
    .quote__mark {
      font-family: var(--font-display);
      font-size: 4.5rem;
      line-height: 0.8;
      color: var(--primary-soft-border);
      position: absolute;
      top: 1.2rem; left: 1.5rem;
      font-weight: 800;
    }
    .quote__text {
      margin: 1.5rem 0;
      font-size: 1.05rem;
      line-height: 1.55;
      color: var(--text);
      text-wrap: pretty;
    }
    .quote__author {
      display: flex; align-items: center; gap: 0.75rem;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
    }
    .quote__avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--primary-soft-bg);
      color: var(--primary);
      display: inline-flex; align-items: center; justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
      font-size: 0.85rem;
    }
    .quote__avatar--urgent { background: #FEF2F2; color: #DC2626; }
    .quote__name { font-weight: 600; font-size: 0.92rem; color: var(--text); }
    .quote__role { font-size: 0.8rem; color: var(--text-muted); }

    /* ============== PARTNERS ============== */
    .partners {
      border-top: 1px solid var(--border);
      background: var(--bg-card);
      padding: 2.5rem 1.5rem;
    }
    .partners-inner {
      max-width: 1180px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .partners-label {
      font-size: 0.74rem; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--text-muted);
    }
    .partners-list {
      display: flex; align-items: center; gap: 2.25rem;
      flex-wrap: wrap;
    }
    .partner {
      display: inline-flex; align-items: center; gap: 0.5rem;
      color: var(--text-muted);
      font-weight: 600; font-size: 0.95rem;
      letter-spacing: -0.01em;
    }
    .partner [data-lucide] { width: 1.25rem; height: 1.25rem; }

    /* ============== JOIN CTA ============== */
    .join {
      text-align: center;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 3.5rem 2rem;
      background:
        radial-gradient(circle at 50% 0%, var(--primary-soft-bg) 0%, transparent 60%),
        var(--bg-card);
    }
    .join h2 {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      margin: 0 auto 0.85rem;
      max-width: 680px;
      text-wrap: balance;
      color: var(--text);
    }
    .join p {
      margin: 0 auto 1.75rem;
      max-width: 540px;
      color: var(--text-muted);
      font-size: 1rem;
    }
    .join-actions { display: inline-flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; }

    /* ============== RESPONSIVE ============== */
    @media (max-width: 980px) {
      .impact-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem 0; }
      .impact-item:nth-child(2) { border-right: none; }
      .impact-item:nth-child(1), .impact-item:nth-child(2) {
        border-bottom: 1px solid var(--border); padding-bottom: 1.25rem;
      }
      .impact-item:nth-child(3), .impact-item:nth-child(4) { padding-top: 1.25rem; }
      .how-grid { grid-template-columns: 1fr; }
      .pets-grid { grid-template-columns: repeat(2, 1fr); }
      .urgent-grid { grid-template-columns: 1fr; }
      .urgent-card--featured { grid-row: auto; }
      .donor { grid-template-columns: 1fr; padding: 2rem; }
      .testimonial-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .pets-grid { grid-template-columns: 1fr; }
      section.block { padding: 3rem 0; }
      .hero { padding: 2.25rem 1rem 2rem; }
      .species-picker { gap: 0.65rem; }
      .species-tile { width: calc(50% - 0.35rem); padding: 1.1rem 0.85rem 1rem; }
      .species-tile__icon { width: 52px; height: 52px; }
      .donor { padding: 1.75rem; }
    }
  `],
})
export class HomeComponent implements AfterViewInit {
  readonly theme = inject(ThemeService);
  private adoption = inject(AdoptionService);
  private urgentSvc = inject(UrgentService);

  pets = signal<PetCard[]>(FALLBACK_PETS);
  urgent = signal<UrgentItem[]>(FALLBACK_URGENT);

  constructor() {
    // Reload featured pets + urgent items whenever the theme (species) changes.
    effect(() => {
      const species = this.theme.petType();
      this.loadPets(species);
      this.loadUrgent(species);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }

  setSpecies(t: PetType): void {
    this.theme.set(t);
    setTimeout(() => createIcons({ icons }), 0);
  }

  private loadPets(species: PetType): void {
    this.adoption.list({ species }).subscribe({
      next: (rows) => {
        const cards = rows.slice(0, 4).map(r => this.toPetCard(r));
        // Keep mock fallback visible until the API is populated.
        this.pets.set(cards.length ? cards : FALLBACK_PETS);
        setTimeout(() => createIcons({ icons }), 0);
      },
      error: () => this.pets.set(FALLBACK_PETS),
    });
  }

  private loadUrgent(species: PetType): void {
    this.urgentSvc.list({}).subscribe({
      next: (rows) => {
        const matches = rows.filter(r => !r.species || r.species === species);
        const items = matches.slice(0, 3).map((r, i) => this.toUrgentItem(r, i === 0));
        this.urgent.set(items.length ? items : FALLBACK_URGENT);
        setTimeout(() => createIcons({ icons }), 0);
      },
      error: () => this.urgent.set(FALLBACK_URGENT),
    });
  }

  private toPetCard(l: AdoptionListing): PetCard {
    const pet = l.pet;
    return {
      name: pet?.name ?? '—',
      species: (pet?.species ?? 'dog') as 'dog' | 'cat',
      speciesLabel: pet?.species === 'cat' ? 'Mačka' : 'Pas',
      city: l.city,
      age: pet?.age_years != null ? `${pet.age_years} god` : '',
      sex: pet?.sex === 'female' ? 'Ženka' : pet?.sex === 'male' ? 'Mužjak' : '',
      tags: [pet?.breed, pet?.size].filter((t): t is string => !!t).slice(0, 2),
      imageHint: pet?.photos?.[0]?.url ?? `${pet?.name?.toLowerCase() ?? 'pet'}.jpg`,
    };
  }

  private toUrgentItem(r: UrgentRequest, featured: boolean): UrgentItem {
    const meta = URGENT_TYPE_META[r.type];
    return {
      type: 'krv',
      badge: meta.badge,
      badgeIcon: meta.badgeIcon,
      time: this.relativeTime(r.created_at),
      title: r.title,
      excerpt: featured ? r.description : undefined,
      city: r.city,
      ctaLabel: meta.ctaLabel,
      featured,
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

  readonly impact = [
    { num: '1.847', label: 'Udomljenih ljubimaca' },
    { num: '312',   label: 'Aktivnih donora krvi' },
    { num: '94',    label: 'Hitnih intervencija ovog meseca' },
    { num: '26',    label: 'Partnerskih veterinarskih ustanova' },
  ];

  readonly steps = [
    { num: '01', icon: 'search',          title: 'Pretražite',  body: 'Pregledajte oglase za udomljavanje, hitne pozive i registar donora po vrsti, gradu i potrebi.' },
    { num: '02', icon: 'message-circle',  title: 'Povežite se', body: 'Pošaljite poruku objavljivaču direktno preko platforme. Odgovor obično stiže u roku od 24h.' },
    { num: '03', icon: 'heart',           title: 'Pomozite',    body: 'Udomite, donirajte krv ili podelite oglas dalje — svaki gest pravi razliku.' },
  ];

  readonly quotes = [
    {
      text: 'Reks je bio kod nas svega tri dana kad smo shvatili da nikad više nećemo živeti bez njega. Šapko nas je povezao sa azilom u Kragujevcu i celokupan proces udomljavanja je trajao manje od nedelju dana.',
      initials: 'MJ',
      author: 'Marija J.',
      role: 'Udomila psa Reksa · Beograd',
    },
  ];

  readonly partners = [
    { name: 'Vetex',              icon: 'cross' },
    { name: 'Centar Mira',        icon: 'stethoscope' },
    { name: 'Šapica NS',          icon: 'paw-print' },
    { name: 'Drugari sa Dunava',  icon: 'heart' },
    { name: 'Felix Niš',          icon: 'hand-heart' },
  ];
}
