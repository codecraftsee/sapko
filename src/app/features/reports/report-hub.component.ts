import { AfterViewInit, Component } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-report-hub',
  imports: [RouterLink],
  template: `
    <section class="page-header">
      <div class="container">
        <span class="eyebrow">
          <i data-lucide="plus-circle" class="icon--sm"></i>
          Prijavi
        </span>
        <h1>Postavi oglas za udomljavanje</h1>
        <p class="lead">
          Imate životinju koja traži dom — vašu, iz azila, ili pronađenu pa zbrinutu.
        </p>
      </div>
    </section>

    <section class="block">
      <div class="container">
        <div class="hub-grid">
          <a routerLink="/prijavi/udomi" class="hub-card hub-card--adopt">
            <div class="hub-card__icon"><i data-lucide="heart"></i></div>
            <h3>Udomljavanje</h3>
            <p>Imate životinju koja traži dom — vašu, iz azila, ili pronađenu pa zbrinutu.</p>
            <span class="hub-card__cta">Postavi oglas <i data-lucide="arrow-right" class="icon--sm"></i></span>
          </a>
        </div>

        <div class="hub-aside">
          <i data-lucide="info"></i>
          <div>
            <p>
              Za hitne situacije (krv, lečenje, hrana), idite na
              <a routerLink="/urgentno">tablu hitnih</a> i koristite formu tamo.
            </p>
            <p>
              Tražite/pronašli ste ljubimca? Idite na
              <a routerLink="/izgubljeno-nadjeno">Izgubljeno &amp; Nađeno</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
    section.block { padding: 3rem 0 5rem; }
    .page-header {
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 60%),
        var(--bg-base);
      padding: 2.5rem 1.5rem 2rem;
      border-bottom: 1px solid var(--border);
    }
    .page-header h1 {
      font-size: clamp(2rem, 4vw, 2.6rem);
      margin: 0.6rem 0;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .page-header .lead {
      margin: 0; color: var(--text-muted);
      font-size: 1.02rem; max-width: 600px;
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

    .hub-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      max-width: 520px;
      margin: 0 auto;
    }
    .hub-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      color: inherit; text-decoration: none;
      display: flex; flex-direction: column; gap: 0.6rem;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .hub-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
      color: inherit;
    }
    .hub-card--adopt:hover { border-color: var(--primary); }
    .hub-card--lost:hover { border-color: #2563eb; }
    .hub-card--found:hover { border-color: #16a34a; }
    .hub-card__icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      background: var(--primary-soft-bg);
      color: var(--primary);
      margin-bottom: 0.4rem;
    }
    .hub-card--lost .hub-card__icon {
      background: color-mix(in srgb, #2563eb 12%, transparent);
      color: #2563eb;
    }
    .hub-card--found .hub-card__icon {
      background: color-mix(in srgb, #16a34a 14%, transparent);
      color: #16a34a;
    }
    .hub-card__icon [data-lucide] { width: 1.5rem; height: 1.5rem; }
    .hub-card h3 { margin: 0; font-size: 1.2rem; letter-spacing: -0.015em; }
    .hub-card p { margin: 0; font-size: 0.92rem; color: var(--text-muted); line-height: 1.5; }
    .hub-card__cta {
      margin-top: auto; padding-top: 0.6rem;
      font-weight: 600; font-size: 0.92rem;
      color: var(--primary);
      display: inline-flex; align-items: center; gap: 0.35rem;
    }
    .hub-card--lost .hub-card__cta { color: #2563eb; }
    .hub-card--found .hub-card__cta { color: #16a34a; }
    .hub-card__cta [data-lucide] { width: 0.95rem; height: 0.95rem; }

    .hub-aside {
      margin: 2.5rem auto 0;
      max-width: 520px;
      display: flex; align-items: flex-start; gap: 0.7rem;
      padding: 1rem 1.25rem;
      background: var(--bg-card);
      border: 1px dashed var(--border-strong);
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .hub-aside [data-lucide] { width: 1.1rem; height: 1.1rem; color: var(--primary); flex-shrink: 0; margin-top: 0.15rem; }
    .hub-aside p { margin: 0; }
    .hub-aside p + p { margin-top: 0.4rem; }
    .hub-aside a { color: var(--primary); font-weight: 600; }

    @media (max-width: 900px) {
      .hub-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ReportHubComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }
}
