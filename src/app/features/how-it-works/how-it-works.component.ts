import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createIcons, icons } from 'lucide';

interface ExpandedStep {
  num: string;
  icon: string;
  title: string;
  body: string;
  bullets: string[];
}

interface TrustItem {
  icon: string;
  title: string;
  body: string;
}

@Component({
  selector: 'app-how-it-works',
  imports: [RouterLink],
  template: `
    <!-- ===================== PAGE HEADER ===================== -->
    <section class="page-header">
      <div class="container">
        <div class="page-header__inner">
          <div>
            <span class="eyebrow eyebrow--inline">
              <i data-lucide="compass" class="icon--sm"></i>
              Kako radi
            </span>
            <h1>Kako Šapko radi</h1>
            <p class="lead">
              Šapko povezuje udomitelje, vlasnike i veterinare kroz jednostavan, transparentan proces.
              Bez agencija, bez posrednika — direktan kontakt između ljudi koji žele da pomognu i onih kojima je pomoć potrebna.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== EXPANDED STEPS ===================== -->
    <section class="block">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Tri koraka</span>
            <h2>Od pretrage do dobrog dela.</h2>
          </div>
          <p>Svaka akcija na Šapku — bilo da tražite ljubimca, dom ili donaciju krvi — prolazi kroz ova tri koraka.</p>
        </div>

        <div class="steps-list">
          @for (s of steps; track s.num) {
            <article class="step-row">
              <div class="step-row__lead">
                <span class="step-row__num">{{ s.num }}</span>
                <div class="step-row__icon"><i [attr.data-lucide]="s.icon"></i></div>
              </div>
              <div class="step-row__body">
                <h3>{{ s.title }}</h3>
                <p>{{ s.body }}</p>
                <ul>
                  @for (b of s.bullets; track b) {
                    <li>
                      <i data-lucide="check" class="icon--sm"></i>
                      <span>{{ b }}</span>
                    </li>
                  }
                </ul>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- ===================== TRUST BLOCK ===================== -->
    <section class="block block--tight-top trust-section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="tag">Zašto Šapko?</span>
            <h2>Sigurno i otvoreno.</h2>
          </div>
          <p>Svaka funkcija je dizajnirana da štiti i ljude i životinje — bez kompromisa po pitanju privatnosti i poverenja.</p>
        </div>

        <div class="trust-grid">
          @for (t of trust; track t.title) {
            <article class="trust-card">
              <div class="trust-card__icon"><i [attr.data-lucide]="t.icon"></i></div>
              <h3>{{ t.title }}</h3>
              <p>{{ t.body }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- ===================== JOIN CTA ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        <div class="join">
          <h2>Spremni da krenete?</h2>
          <p>Registracija je besplatna. Postavite oglas, javite se na hitan poziv ili samo budite u toku — vaš dom za životinje koje ga još uvek nemaju.</p>
          <div class="join-actions">
            <a routerLink="/registracija" class="btn btn--lg">
              <i data-lucide="user-plus"></i>
              Registruj se besplatno
            </a>
            <a routerLink="/udomi" class="btn btn--ghost btn--lg">Pregledaj oglase</a>
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
      padding: 3rem 1.5rem 2.5rem;
      border-bottom: 1px solid var(--border);
      transition: background 0.6s ease;
    }
    .page-header__inner { max-width: 760px; margin: 0 auto; text-align: center; }
    .page-header h1 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      margin: 0.6rem 0 0.6rem;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .page-header .lead {
      margin: 0;
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.55;
      max-width: 680px;
      margin-left: auto;
      margin-right: auto;
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

    /* ===== Steps list (vertical, expanded) ===== */
    .steps-list {
      display: flex; flex-direction: column;
      gap: 1.25rem;
    }
    .step-row {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 2rem;
      align-items: start;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem 2.25rem;
      box-shadow: var(--shadow-sm);
    }
    .step-row__lead {
      display: flex; flex-direction: column; align-items: flex-start; gap: 1rem;
      position: relative;
    }
    .step-row__num {
      font-size: 4rem; font-weight: 800;
      line-height: 1;
      color: var(--primary-soft-bg);
      letter-spacing: -0.05em;
    }
    .step-row__icon {
      width: 56px; height: 56px;
      border-radius: var(--radius-md);
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .step-row__icon [data-lucide] { width: 1.7rem; height: 1.7rem; }
    .step-row__body h3 {
      font-size: 1.35rem; margin: 0 0 0.6rem;
      letter-spacing: -0.015em;
    }
    .step-row__body p {
      margin: 0 0 1rem;
      color: var(--text-muted);
      font-size: 1rem;
      line-height: 1.6;
    }
    .step-row__body ul {
      list-style: none;
      margin: 0; padding: 0;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.55rem 1.25rem;
    }
    .step-row__body li {
      display: flex; align-items: flex-start; gap: 0.5rem;
      font-size: 0.92rem;
      color: var(--text);
    }
    .step-row__body li [data-lucide] {
      width: 1rem; height: 1rem;
      color: var(--primary);
      flex-shrink: 0;
      margin-top: 0.2rem;
    }

    /* ===== Trust grid ===== */
    .trust-section {}
    .trust-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }
    .trust-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .trust-card__icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 1rem;
    }
    .trust-card__icon [data-lucide] { width: 1.5rem; height: 1.5rem; }
    .trust-card h3 {
      font-size: 1.1rem; margin: 0 0 0.4rem;
      letter-spacing: -0.015em;
    }
    .trust-card p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.93rem;
      line-height: 1.55;
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
    .btn--ghost {
      background: transparent;
      color: var(--primary);
      box-shadow: inset 0 0 0 1.5px var(--primary-soft-border);
    }
    .btn--ghost:hover {
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
    }

    /* ===== Responsive ===== */
    @media (max-width: 860px) {
      .step-row { grid-template-columns: 1fr; gap: 1rem; padding: 1.75rem; }
      .step-row__lead { flex-direction: row; align-items: center; }
      .step-row__num { font-size: 3rem; }
      .step-row__body ul { grid-template-columns: 1fr; }
      .trust-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class HowItWorksComponent implements AfterViewInit {
  readonly steps: ExpandedStep[] = [
    {
      num: '01',
      icon: 'search',
      title: 'Pretražite',
      body: 'Pregledajte oglase za udomljavanje, hitne pozive i registar donora po vrsti, gradu i potrebi. Svaki oglas sadrži sve informacije koje su vam potrebne pre nego što napravite prvi korak — bez registracije, bez naknade.',
      bullets: [
        'Filtriranje po vrsti, uzrastu i gradu',
        'Detaljan profil svakog ljubimca',
        'Hitni slučajevi izdvojeni vizuelno',
        'Otvoreni registar donora krvi',
      ],
    },
    {
      num: '02',
      icon: 'message-circle',
      title: 'Povežite se',
      body: 'Pošaljite poruku objavljivaču direktno preko platforme. Vaš lični kontakt ostaje zaštićen sve dok vi sami ne odlučite da ga podelite. Većina objavljivača odgovara u roku od 24 sata.',
      bullets: [
        'Šifrovani razgovori unutar platforme',
        'Vaš telefon i email ostaju privatni',
        'Notifikacije za nove poruke',
        'Mogućnost arhiviranja razgovora',
      ],
    },
    {
      num: '03',
      icon: 'heart',
      title: 'Pomozite',
      body: 'Udomite ljubimca, donirajte krv vašeg psa, podelite oglas dalje ili samo budite u toku. Svaki gest pravi razliku — Šapko ne uzima proviziju i ne naplaćuje korisnicima ništa.',
      bullets: [
        'Bez provizije, bez skrivenih troškova',
        'Praćenje statusa udomljavanja',
        'Verifikacija od strane veterinara',
        'Zajednica koja deli iskustva',
      ],
    },
  ];

  readonly trust: TrustItem[] = [
    {
      icon: 'badge-check',
      title: 'Verifikacija oglasa',
      body: 'Svi oglasi za udomljavanje i hitnu pomoć prolaze ručnu proveru pre objavljivanja. Naš tim verifikuje fotografije, kontakt podatke i vlasništvo nad ljubimcem.',
    },
    {
      icon: 'shield',
      title: 'Zaštita privatnosti',
      body: 'Vaši kontakt podaci nikad nisu javno vidljivi. U registru donora prikazujemo samo osnovne informacije — ime, krvnu grupu i grad. Sve poruke idu kroz Šapko.',
    },
    {
      icon: 'eye',
      title: 'Transparentnost',
      body: 'Šapko je otvorena platforma — bez algoritma koji bira šta vam prikazujemo, bez plaćenih oglasa, bez provizije. Pun pregled u svakom trenutku.',
    },
  ];

  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }
}
