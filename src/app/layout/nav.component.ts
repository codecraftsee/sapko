import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { SapkoLogoComponent } from './sapko-logo.component';

/**
 * Top navigation — match Sapko Landing.html mock.
 *
 * Layout: [logo]   [Udomljavanje · Hitno · Donori krvi · Kako radi]   [Pas/Mačka toggle · Prijava · Registracija]
 */
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, SapkoLogoComponent],
  template: `
    <header class="nav">
      <div class="nav-inner">
        <a routerLink="/" class="brand" aria-label="Šapko">
          <app-sapko-logo size="2rem" />
        </a>

        @if (!isAuthPage()) {
          <nav class="nav-links" aria-label="Glavna navigacija">
            <a routerLink="/udomi"    routerLinkActive="active">Udomljavanje</a>
            <a routerLink="/urgentno" routerLinkActive="active">Hitno</a>
            <a routerLink="/donori"   routerLinkActive="active">Donori krvi</a>
            <a routerLink="/kako-radi" routerLinkActive="active">Kako radi</a>
          </nav>
        }

        <div class="nav-right">
          @if (!isAuthPage()) {
            <div class="theme-toggle" role="group" aria-label="Promeni temu">
              <button
                type="button"
                class="theme-btn"
                [class.is-active]="theme.petType() === 'dog'"
                [attr.aria-pressed]="theme.petType() === 'dog'"
                (click)="setPet('dog')"
              >
                <i data-lucide="dog"></i><span>Pas</span>
              </button>
              <button
                type="button"
                class="theme-btn"
                [class.is-active]="theme.petType() === 'cat'"
                [attr.aria-pressed]="theme.petType() === 'cat'"
                (click)="setPet('cat')"
              >
                <i data-lucide="cat"></i><span>Mačka</span>
              </button>
            </div>
          }

          @if (auth.isLoggedIn()) {
            <a routerLink="/moj-nalog" class="link">Moj nalog</a>
            <button class="btn btn--sm btn--ghost" (click)="auth.logout()" type="button">Odjavi se</button>
          } @else if (isAuthPage()) {
            <a routerLink="/registracija" class="btn btn--sm">Registracija</a>
          } @else {
            <a routerLink="/prijava" class="link">Prijava</a>
            <a routerLink="/registracija" class="btn btn--sm">Registracija</a>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    /* ============== NAV (match mock) ============== */
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: rgba(255, 255, 255, 0.85);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: saturate(1.1) blur(8px);
      -webkit-backdrop-filter: saturate(1.1) blur(8px);
    }
    .nav-inner {
      max-width: 1180px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
    }

    /* Nav links — plain text + active underline */
    .nav-links {
      display: flex;
      gap: 1.6rem;
    }
    .nav-links a {
      position: relative;
      color: var(--text);
      font-weight: 500;
      font-size: 0.95rem;
      padding: 0.4rem 0;
      text-decoration: none;
      transition: color 0.2s;
      white-space: nowrap;
    }
    .nav-links a:hover { color: var(--primary); }
    .nav-links a.active { color: var(--primary); }
    .nav-links a.active::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -3px;
      height: 2px;
      background: var(--primary);
      border-radius: 2px;
    }

    /* Right cluster */
    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    /* Theme toggle pill — dog / cat */
    .theme-toggle {
      display: inline-flex;
      padding: 3px;
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
    }
    .theme-btn {
      border: none;
      background: transparent;
      padding: 0.4rem 0.85rem;
      color: var(--text-muted);
      font: inherit;
      font-size: 0.82rem;
      font-weight: 500;
      border-radius: var(--radius-pill);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .theme-btn i[data-lucide] { width: 1.05rem; height: 1.05rem; }
    .theme-btn:hover { color: var(--text); }
    .theme-btn.is-active {
      background: var(--primary);
      color: var(--on-primary);
    }

    /* Plain text link (Prijava, Moj nalog) */
    .link {
      color: var(--text);
      font-weight: 500;
      padding: 0.4rem 0.5rem;
      text-decoration: none;
      transition: color 0.2s;
    }
    .link:hover { color: var(--primary); }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.35rem;
      background: var(--primary);
      color: var(--on-primary);
      border: none;
      border-radius: var(--radius-sm);
      font: inherit;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn:hover { background: var(--primary-hover); color: var(--on-primary); }
    .btn:active { transform: translateY(1px); }
    .btn--sm { padding: 0.45rem 0.95rem; font-size: 0.85rem; }
    .btn--ghost {
      background: transparent;
      color: var(--primary);
      box-shadow: inset 0 0 0 1.5px var(--primary-soft-border);
    }
    .btn--ghost:hover {
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
    }

    /* Responsive */
    @media (max-width: 980px) {
      .nav-links { gap: 1rem; }
      .nav-inner { gap: 0.5rem; }
    }
    @media (max-width: 760px) {
      .nav-links { display: none; }
      .theme-btn span { display: none; }
      .theme-btn { padding: 0.4rem 0.6rem; }
    }
  `],
})
export class NavComponent {
  auth   = inject(AuthService);
  theme  = inject(ThemeService);
  router = inject(Router);

  isAuthPage(): boolean {
    return this.router.url.startsWith('/prijava') || this.router.url.startsWith('/registracija');
  }

  setPet(type: 'dog' | 'cat'): void {
    this.theme.set(type);
  }
}
