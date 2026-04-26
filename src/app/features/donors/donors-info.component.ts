import { AfterViewInit, Component, computed, effect, inject, signal } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterLink } from '@angular/router';
import { ThemeService, PetType } from '../../core/services/theme.service';

interface DonorCard {
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: string;
  weight: string;
  bloodGroup: string;
  city: string;
  donations: string;
  lastDonation: string;
}

const FALLBACK_DONORS: DonorCard[] = [
  { name: 'Reks',  species: 'dog', breed: 'Labrador',         age: '5 god', weight: '32 kg', bloodGroup: 'DEA 1.1+', city: 'Beograd',    donations: '7×',  lastDonation: 'Pre 4 mes' },
  { name: 'Bono',  species: 'dog', breed: 'Mešanac',          age: '4 god', weight: '28 kg', bloodGroup: 'DEA 1.1−', city: 'Beograd',    donations: '4×',  lastDonation: 'Pre 2 mes' },
  { name: 'Maks',  species: 'dog', breed: 'Nemački ovčar',    age: '6 god', weight: '38 kg', bloodGroup: 'DEA 1.1+', city: 'Novi Sad',   donations: '12×', lastDonation: 'Pre 6 mes' },
  { name: 'Tara',  species: 'dog', breed: 'Zlatni retriver',  age: '3 god', weight: '30 kg', bloodGroup: 'DEA 1.1−', city: 'Niš',        donations: '3×',  lastDonation: 'Pre 5 mes' },
  { name: 'Bela',  species: 'dog', breed: 'Mešanac',          age: '5 god', weight: '26 kg', bloodGroup: 'DEA 1.1+', city: 'Kragujevac', donations: '6×',  lastDonation: 'Pre 3 mes' },
  { name: 'Zara',  species: 'dog', breed: 'Boksir',           age: '4 god', weight: '31 kg', bloodGroup: 'DEA 1.1−', city: 'Subotica',   donations: '5×',  lastDonation: 'Pre 7 mes' },
  { name: 'Argo',  species: 'dog', breed: 'Belgijski ovčar',  age: '6 god', weight: '35 kg', bloodGroup: 'DEA 1.1+', city: 'Beograd',    donations: '9×',  lastDonation: 'Pre 4 mes' },
  { name: 'Luna',  species: 'dog', breed: 'Mešanac',          age: '4 god', weight: '27 kg', bloodGroup: 'DEA 1.1−', city: 'Pančevo',    donations: '2×',  lastDonation: 'Pre 8 mes' },
  { name: 'Nera',  species: 'dog', breed: 'Rotvajler',        age: '5 god', weight: '34 kg', bloodGroup: 'DEA 1.1+', city: 'Niš',        donations: '8×',  lastDonation: 'Pre 5 mes' },
];

const CITY_FILTERS = [
  { name: 'Svi gradovi', value: undefined as string | undefined, count: 0 },
  { name: 'Beograd',     value: 'Beograd',     count: 87 },
  { name: 'Novi Sad',    value: 'Novi Sad',    count: 54 },
  { name: 'Niš',         value: 'Niš',         count: 38 },
  { name: 'Kragujevac',  value: 'Kragujevac',  count: 29 },
];

const PAGE_SIZE = 8;

@Component({
  selector: 'app-donors-info',
  imports: [RouterLink],
  template: `
    <!-- ===================== HERO BANNER (DARK) ===================== -->
    <section class="donor-hero">
      <div class="container">
        <div class="donor-hero__inner">
          <div>
            <span class="donor-eyebrow">
              <i data-lucide="droplets" class="icon--sm"></i>
              Donori krvi
            </span>
            <h1>{{ theme.petType() === 'cat' ? 'Vaša mačka može da spasi život.' : 'Vaš pas može da spasi život.' }}</h1>
            <p>
              Jedna donacija krvi može spasiti do tri života. Šapko vodi prvi otvoreni
              registar donora u Srbiji — direktna veza između veterinara i ljudi spremnih da pomognu.
            </p>
            <div class="donor-hero__actions">
              <a routerLink="/moj-nalog" class="btn btn--ondark btn--lg">
                <i data-lucide="heart"></i>
                Postani donor
              </a>
              <a href="#registar" class="btn btn--outline-light btn--lg">Pogledaj registar</a>
            </div>
          </div>
          <div class="donor-hero__stats">
            <div class="dh-stat"><span class="dh-stat__num">312</span><span class="dh-stat__label">aktivnih donora</span></div>
            <div class="dh-stat"><span class="dh-stat__num">14</span><span class="dh-stat__label">gradova</span></div>
            <div class="dh-stat"><span class="dh-stat__num">487</span><span class="dh-stat__label">spasenih života</span></div>
            <div class="dh-stat"><span class="dh-stat__num">3h</span><span class="dh-stat__label">prosečan odziv</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CRITERIA + STEPS ===================== -->
    <section class="block" id="postani">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Kriterijumi</span>
            <h2>{{ theme.petType() === 'cat' ? 'Da li vaša mačka može biti donor?' : 'Da li vaš pas može biti donor?' }}</h2>
          </div>
          <p>
            {{ theme.petType() === 'cat'
              ? 'Donor mora biti zdrava, isključivo kućna mačka, redovno vakcinisana i bez FeLV/FIV.'
              : 'Donor mora biti zdrav, redovno vakcinisan i bez hroničnih bolesti. Većina pasa srednje i velike rase ispunjava uslove.' }}
          </p>
        </div>

        <div class="criteria-grid">
          <div class="criterion">
            <div class="criterion__icon"><i data-lucide="weight"></i></div>
            <h3>{{ theme.petType() === 'cat' ? 'Težina preko 4 kg' : 'Masa preko 25 kg' }}</h3>
            <p>{{ theme.petType() === 'cat'
              ? 'Mačka mora imati dovoljno težine da donacija bude bezbedna.'
              : 'Velike rase mogu da daju veći volumen krvi bez rizika po sopstveno zdravlje.' }}</p>
          </div>
          <div class="criterion">
            <div class="criterion__icon"><i data-lucide="cake"></i></div>
            <h3>Uzrast 1–8 godina</h3>
            <p>{{ theme.petType() === 'cat'
              ? 'Mlade i zrele mačke imaju najbolji oporavak posle donacije.'
              : 'Mladi i zreli psi imaju najbolji oporavak posle donacije.' }}</p>
          </div>
          <div class="criterion">
            <div class="criterion__icon"><i data-lucide="shield-check"></i></div>
            <h3>Zdrav i vakcinisan</h3>
            <p>{{ theme.petType() === 'cat'
              ? 'Bez hroničnih bolesti, bez FeLV/FIV, sve vakcine ažurne.'
              : 'Bez hroničnih bolesti, bez aktivnih infekcija, sve vakcine ažurne.' }}</p>
          </div>
          <div class="criterion">
            <div class="criterion__icon"><i data-lucide="smile"></i></div>
            <h3>Smiren temperament</h3>
            <p>Donacija traje 15–20 minuta. {{ theme.petType() === 'cat' ? 'Mačka' : 'Pas' }} mora moći mirno da leži tokom procedure.</p>
          </div>
        </div>

        <div class="how-grid">
          <article class="step">
            <span class="step__num">01</span>
            <div class="step__icon"><i data-lucide="user-plus"></i></div>
            <h3>{{ theme.petType() === 'cat' ? 'Registrujte mačku' : 'Registrujte psa' }}</h3>
            <p>Popunite kratak profil — krvna grupa, težina, vakcinacije, preferirana klinika.</p>
          </article>
          <article class="step">
            <span class="step__num">02</span>
            <div class="step__icon"><i data-lucide="bell"></i></div>
            <h3>Primite poziv</h3>
            <p>Kada je donor potreban u vašem gradu, javljamo vam SMS-om i emailom.</p>
          </article>
          <article class="step">
            <span class="step__num">03</span>
            <div class="step__icon"><i data-lucide="heart-handshake"></i></div>
            <h3>Donirajte krv</h3>
            <p>Procedura je bezbolna i traje 15–20 min. Vaš {{ theme.petType() === 'cat' ? 'ljubimac' : 'pas' }} dobija besplatan pregled.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ===================== REGISTRY ===================== -->
    <section class="block block--tight-top registry-section" id="registar">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Otvoreni registar</span>
            <h2>{{ donors().length }} donora u 14 gradova.</h2>
          </div>
          <p>Pretražite registar po gradu i krvnoj grupi. Kontakt informacije su zaštićene — pošaljite upit i vlasnik se javlja vama.</p>
        </div>

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
          <button class="filter-chip is-disabled" disabled>
            <i data-lucide="cat"></i> Mačke <span class="filter-chip__count">uskoro</span>
          </button>
        </div>

        <div class="registry-toolbar">
          @for (c of cities; track c.name) {
            <button
              class="filter-chip"
              [class.is-active]="cityFilter() === c.value"
              (click)="setCity(c.value)"
            >
              {{ c.name }}
              @if (c.count > 0) {
                <span class="filter-chip__count">{{ c.count }}</span>
              }
            </button>
          }
          <span class="toolbar__divider"></span>
          <button class="filter-chip filter-chip--select" disabled>
            Krvna grupa: bilo koja <i data-lucide="chevron-down"></i>
          </button>
          <button class="filter-chip filter-chip--select" disabled>
            Veličina: bilo koja <i data-lucide="chevron-down"></i>
          </button>
        </div>

        @if (paged().length === 0) {
          <p class="empty">Nema donora za izabrane filtere.</p>
        } @else {
          <div class="donor-grid">
            @for (d of paged(); track d.name + d.city) {
              <article class="donor-card">
                <div class="donor-card__head">
                  <div class="donor-card__avatar"><i [attr.data-lucide]="d.species"></i></div>
                  <div class="donor-card__id">
                    <h3>{{ d.name }}</h3>
                    <p>{{ d.breed }} · {{ d.age }} · {{ d.weight }}</p>
                  </div>
                  <span class="donor-card__blood">{{ d.bloodGroup }}</span>
                </div>
                <dl class="donor-card__facts">
                  <div><dt>Grad</dt><dd>{{ d.city }}</dd></div>
                  <div><dt>Donacija</dt><dd>{{ d.donations }}</dd></div>
                  <div><dt>Poslednja</dt><dd>{{ d.lastDonation }}</dd></div>
                </dl>
                <div class="donor-card__foot">
                  <span class="donor-card__verified">
                    <i data-lucide="badge-check" class="icon--sm"></i> Verifikovan
                  </span>
                  <a routerLink="/moj-nalog" class="donor-card__cta">
                    Pošalji upit <i data-lucide="arrow-right" class="icon--sm"></i>
                  </a>
                </div>
              </article>
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

    <!-- ===================== FAQ ===================== -->
    <section class="block">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Pitanja i odgovori</span>
            <h2>Najčešća pitanja vlasnika.</h2>
          </div>
        </div>
        <div class="faq-list">
          @for (q of faqs; track q.question; let first = $first) {
            <details class="faq-item" [attr.open]="first ? '' : null">
              <summary>{{ q.question }}</summary>
              <p>{{ q.answer }}</p>
            </details>
          }
        </div>
      </div>
    </section>

    <!-- ===================== JOIN CTA ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        <div class="join">
          <h2>Pridružite se registru za 5 minuta.</h2>
          <p>Profil donora je besplatan i možete odjaviti se u svakom trenutku. Naš tim verifikuje podatke u roku od 24 sata.</p>
          <div class="join-actions">
            <a routerLink="/moj-nalog" class="btn btn--lg">
              <i data-lucide="heart"></i>
              {{ theme.petType() === 'cat' ? 'Registruj mačku kao donora' : 'Registruj psa kao donora' }}
            </a>
            <a routerLink="/urgentno" class="btn btn--ghost btn--lg">Trenutni hitni pozivi</a>
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

    /* ===== Dark hero banner ===== */
    .donor-hero {
      background: linear-gradient(180deg, #2A211A 0%, #1F1814 100%);
      color: #FBF6EE;
      padding: 3.5rem 1.5rem 3rem;
      position: relative;
      overflow: hidden;
    }
    .donor-hero::before {
      content: ""; position: absolute;
      right: -200px; top: -200px;
      width: 500px; height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(220,38,38,0.18), transparent 70%);
    }
    .donor-hero__inner {
      max-width: 1180px; margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 3rem;
      align-items: center;
      position: relative;
    }
    .donor-hero h1 {
      color: #fff;
      font-size: clamp(2rem, 4.5vw, 3rem);
      margin: 0.6rem 0 1rem;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .donor-hero p {
      color: #DDD2C2;
      max-width: 540px;
      margin: 0 0 1.5rem;
      font-size: 1.05rem;
      line-height: 1.55;
    }
    .donor-eyebrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      background: rgba(220,38,38,0.15);
      color: #FCA5A5;
      border: 1px solid rgba(220,38,38,0.3);
      border-radius: var(--radius-pill);
      font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
    }
    .donor-eyebrow [data-lucide] { width: 0.9rem; height: 0.9rem; }
    .donor-hero__actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .donor-hero__stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.7rem;
    }
    .dh-stat {
      background: rgba(251,246,238,0.06);
      border: 1px solid rgba(251,246,238,0.12);
      border-radius: var(--radius-md);
      padding: 1.1rem 1.25rem;
      text-align: center;
    }
    .dh-stat__num {
      display: block;
      font-size: 1.8rem; font-weight: 800;
      color: #fff; letter-spacing: -0.02em; line-height: 1;
    }
    .dh-stat__label {
      display: block; margin-top: 0.35rem;
      font-size: 0.78rem;
      color: #BCA999;
    }

    /* ===== Section head ===== */
    .section-head {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 2rem; gap: 1.5rem;
      flex-wrap: wrap;
    }
    .section-head h2 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      letter-spacing: -0.025em;
      margin: 0;
      max-width: 640px;
      text-wrap: balance;
    }
    .section-head .tag {
      display: inline-block;
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--primary-hover);
      margin-bottom: 0.6rem;
    }
    .section-head p {
      margin: 0; max-width: 460px;
      color: var(--text-muted);
      font-size: 0.98rem;
    }

    /* ===== Criteria grid ===== */
    .criteria-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .criterion {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.5rem 1.4rem;
      text-align: left;
    }
    .criterion__icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      background: var(--urgent-soft-bg);
      color: var(--urgent);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 0.85rem;
    }
    .criterion__icon [data-lucide] { width: 1.4rem; height: 1.4rem; }
    .criterion h3 { font-size: 1.05rem; margin: 0 0 0.35rem; letter-spacing: -0.015em; }
    .criterion p { margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; }

    /* ===== How grid (steps) ===== */
    .how-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    .step {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .step__num {
      position: absolute; top: 1rem; right: 1.25rem;
      font-size: 3.5rem; font-weight: 800;
      line-height: 1;
      color: var(--primary-soft-bg);
      letter-spacing: -0.05em;
    }
    .step__icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
    }
    .step__icon [data-lucide] { width: 1.5rem; height: 1.5rem; }
    .step h3 { font-size: 1.1rem; margin: 0 0 0.4rem; letter-spacing: -0.015em; }
    .step p { margin: 0; color: var(--text-muted); font-size: 0.92rem; line-height: 1.55; }

    /* ===== Registry ===== */
    .registry-section { background: var(--bg-subtle); }

    .species-chips {
      display: flex; gap: 0.4rem; flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    .registry-toolbar {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font: inherit; font-size: 0.85rem; font-weight: 500;
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s;
    }
    .filter-chip [data-lucide] { width: 1rem; height: 1rem; }
    .filter-chip:hover:not([disabled]) { border-color: var(--border-strong); }
    .filter-chip[disabled],
    .filter-chip.is-disabled { opacity: 0.55; cursor: not-allowed; }
    .filter-chip.is-active {
      background: var(--primary);
      color: var(--on-primary);
      border-color: var(--primary);
    }
    .filter-chip__count {
      font-size: 0.75rem; font-weight: 600;
      color: var(--text-muted);
      padding: 1px 6px;
      background: var(--bg-base);
      border-radius: var(--radius-pill);
    }
    .filter-chip.is-active .filter-chip__count {
      background: rgba(255,255,255,0.18);
      color: #fff;
    }
    .filter-chip--select { background: var(--bg-card); }
    .toolbar__divider {
      width: 1px; height: 24px; background: var(--border-strong); margin: 0 0.25rem;
    }

    /* ===== Donor cards ===== */
    .donor-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .donor-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column; gap: 0.85rem;
    }
    .donor-card__head { display: flex; align-items: center; gap: 0.75rem; }
    .donor-card__avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: var(--urgent-soft-bg);
      color: var(--urgent);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .donor-card__avatar [data-lucide] { width: 1.4rem; height: 1.4rem; }
    .donor-card__id { flex: 1; min-width: 0; }
    .donor-card__id h3 { font-size: 1.05rem; margin: 0; letter-spacing: -0.015em; }
    .donor-card__id p { margin: 0; font-size: 0.78rem; color: var(--text-muted); }
    .donor-card__blood {
      background: var(--urgent-soft-bg);
      color: var(--urgent);
      border: 1px solid var(--urgent-soft-border);
      border-radius: var(--radius-sm);
      padding: 0.3rem 0.55rem;
      font-size: 0.72rem; font-weight: 700;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .donor-card__facts {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      margin: 0;
      gap: 0;
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
    }
    .donor-card__facts > div {
      padding: 0.55rem 0.6rem;
      border-right: 1px solid var(--border);
      text-align: center;
    }
    .donor-card__facts > div:last-child { border-right: none; }
    .donor-card__facts dt {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-faint);
      margin-bottom: 0.2rem;
    }
    .donor-card__facts dd { margin: 0; font-size: 0.85rem; font-weight: 600; }
    .donor-card__foot {
      display: flex; align-items: center; justify-content: space-between;
      padding-top: 0.4rem;
      border-top: 1px solid var(--border);
      font-size: 0.82rem;
    }
    .donor-card__verified {
      display: inline-flex; align-items: center; gap: 0.3rem;
      color: #059669; font-weight: 500;
    }
    .donor-card__verified [data-lucide] { width: 0.95rem; height: 0.95rem; }
    .donor-card__cta {
      color: var(--urgent); font-weight: 600;
      display: inline-flex; align-items: center; gap: 0.25rem;
      text-decoration: none;
    }
    .donor-card__cta [data-lucide] { width: 0.95rem; height: 0.95rem; }

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
    }
    .page-num:hover { background: var(--bg-base); }
    .page-num.is-active {
      background: var(--primary);
      color: var(--on-primary);
    }
    .page-ellipsis { color: var(--text-muted); padding: 0 0.3rem; }

    /* ===== FAQ ===== */
    .faq-list {
      display: flex; flex-direction: column; gap: 0.5rem;
      max-width: 820px; margin: 0 auto;
    }
    .faq-item {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 1.1rem 1.4rem;
    }
    .faq-item summary {
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      list-style: none;
      display: flex; justify-content: space-between; align-items: center;
    }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-item summary::after {
      content: "+";
      font-size: 1.4rem;
      color: var(--text-muted);
      transition: transform 0.2s;
    }
    .faq-item[open] summary::after { content: "−"; }
    .faq-item p {
      margin: 0.85rem 0 0;
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    /* ===== Buttons ===== */
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
    .btn--lg { padding: 0.95rem 1.7rem; font-size: 1rem; }
    .btn--ondark {
      background: var(--urgent);
      color: #fff;
    }
    .btn--ondark:hover { background: var(--urgent-hover); color: #fff; }
    .btn--outline-light {
      background: transparent;
      color: #FBF6EE;
      box-shadow: inset 0 0 0 1.5px rgba(251,246,238,0.25);
    }
    .btn--outline-light:hover {
      background: rgba(251,246,238,0.08);
      color: #fff;
    }
    .btn--ghost {
      background: transparent;
      color: var(--primary);
      box-shadow: inset 0 0 0 1.5px var(--primary-soft-border);
    }
    .btn--ghost:hover {
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
    }

    /* ===== Join CTA ===== */
    .join {
      text-align: center;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 3.5rem 2rem;
      background:
        radial-gradient(circle at 50% 0%, var(--primary-soft-bg) 0%, transparent 60%),
        var(--bg-card);
    }
    .join h2 {
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      margin: 0 auto 0.85rem;
      max-width: 680px;
      text-wrap: balance;
    }
    .join p {
      margin: 0 auto 1.75rem;
      max-width: 540px;
      color: var(--text-muted);
      font-size: 1rem;
    }
    .join-actions {
      display: inline-flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center;
    }

    .empty {
      text-align: center;
      color: var(--text-muted);
      padding: 3rem 1rem;
      font-size: 1rem;
    }

    /* ===== Responsive ===== */
    @media (max-width: 980px) {
      .donor-hero__inner { grid-template-columns: 1fr; gap: 2rem; }
      .criteria-grid { grid-template-columns: repeat(2, 1fr); }
      .donor-grid { grid-template-columns: repeat(2, 1fr); }
      .how-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .donor-hero__stats { grid-template-columns: 1fr 1fr; }
      .criteria-grid { grid-template-columns: 1fr; }
      .donor-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DonorsInfoComponent implements AfterViewInit {
  theme = inject(ThemeService);

  donors = signal<DonorCard[]>(FALLBACK_DONORS);

  speciesFilter = signal<PetType | undefined>(undefined);
  cityFilter = signal<string | undefined>(undefined);
  page = signal(1);

  readonly cities = CITY_FILTERS;
  readonly faqs = [
    {
      question: 'Da li donacija boli mog psa?',
      answer: 'Procedura je manje invazivna od običnog vađenja krvi. Većina pasa miruje tokom 15-minutne donacije. Veterinarski tim je obučen da prepozna stres i prekine ako je potrebno.',
    },
    {
      question: 'Koliko često pas može da donira?',
      answer: 'Maksimalno 4 puta godišnje, sa razmakom od bar 8 nedelja između donacija. Šapko automatski vodi računa o kalendaru i ne šalje vam pozive ranije.',
    },
    {
      question: 'Šta dobija moj pas zauzvrat?',
      answer: 'Besplatan kompletan pregled (KKS, biohemija) pri svakoj donaciji, prioritet za hitne slučajeve, i članstvo u zajednici donora — sa popustima kod partnerskih veterinara.',
    },
    {
      question: 'Mogu li da odbijem konkretan poziv?',
      answer: 'Naravno. Kada vam stigne SMS o potrebi, slobodno odbijte iz bilo kog razloga — bolesti, putovanja, raspoloženja psa. Bez objašnjenja, bez pritiska.',
    },
    {
      question: 'Da li je moj kontakt javan?',
      answer: 'Ne. U registru je vidljivo samo ime psa, krvna grupa, grad i datum poslednje donacije. Veterinari i vlasnici šalju upit kroz Šapko, mi prosleđujemo, i vi odlučujete da li želite da podelite kontakt.',
    },
  ];

  constructor() {
    effect(() => {
      this.paged();
      setTimeout(() => createIcons({ icons }), 0);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }

  filtered = computed(() => {
    let list = this.donors();
    const sp = this.speciesFilter();
    if (sp) list = list.filter(d => d.species === sp);
    const city = this.cityFilter();
    if (city) list = list.filter(d => d.city === city);
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

  setSpecies(s: PetType | undefined): void {
    this.speciesFilter.set(s);
    this.page.set(1);
  }

  setCity(c: string | undefined): void {
    this.cityFilter.set(c);
    this.page.set(1);
  }

  goToPage(n: number): void {
    this.page.set(n);
  }

  prevPage(): void {
    if (this.page() > 1) this.goToPage(this.page() - 1);
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.goToPage(this.page() + 1);
  }
}
