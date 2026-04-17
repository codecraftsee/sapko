import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">
        <i data-lucide="paw-print" class="brand-icon"></i>
        <span>Šapko</span>
      </a>

      @if (!isAuthPage()) {
        <div class="pet-switcher">
          <button class="pet-btn" [class.active]="theme.petType() === 'dog'" (click)="setPet('dog')" title="Psi">
            <i data-lucide="dog" class="pet-icon"></i>
          </button>
          <button class="pet-btn" [class.active]="theme.petType() === 'cat'" (click)="setPet('cat')" title="Mačke">
            <i data-lucide="cat" class="pet-icon"></i>
          </button>
        </div>

        <div class="links">
          <a routerLink="/udomi"    routerLinkActive="active">Udomljavanje</a>
          <a routerLink="/urgentno" routerLinkActive="active">Hitno</a>
          <a routerLink="/donori"   routerLinkActive="active">Donori krvi</a>
        </div>
      }

      <div class="auth">
        @if (auth.isLoggedIn()) {
          <a routerLink="/moj-nalog" class="auth-link">Moj nalog</a>
          <button class="logout" (click)="auth.logout()">Odjavi se</button>
        } @else if (isAuthPage()) {
          <a routerLink="/registracija" class="btn-primary">Registracija</a>
        } @else {
          <a routerLink="/prijava" class="auth-link">Prijava</a>
          <a routerLink="/registracija" class="btn-primary">Registracija</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .nav {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.65rem 1.5rem;
      background: color-mix(in srgb, var(--color-surface) 80%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 1px 0 var(--color-border), 0 4px 24px color-mix(in srgb, var(--color-text) 5%, transparent);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-family: var(--font-display);
      font-size: 1.3rem;
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
      letter-spacing: -0.3px;
      flex-shrink: 0;
      transition: opacity 0.2s;
    }
    .brand:hover { opacity: 0.8; }
    .brand-icon { width: 1.2rem; height: 1.2rem; color: var(--color-primary); }

    /* Pet switcher */
    .pet-switcher {
      display: flex;
      gap: 0.25rem;
      background: var(--color-surface-alt);
      padding: 0.2rem;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .pet-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, color 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .pet-btn:hover {
      color: var(--color-primary);
      transform: translateY(-1px);
    }
    .pet-btn:active { transform: scale(0.88); }
    .pet-btn.active {
      background: var(--color-primary);
      color: white;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 40%, transparent);
    }
    .pet-icon { width: 1rem; height: 1rem; }

    /* Nav links */
    .links {
      display: flex;
      gap: 0.25rem;
      flex: 1;
    }
    .links a {
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text-muted);
      text-decoration: none;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      transition: background 0.2s, color 0.2s;
      white-space: nowrap;
    }
    .links a:hover {
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
    }
    .links a.active {
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-primary);
      font-weight: 600;
    }

    /* Auth */
    .auth {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      flex-shrink: 0;
    }
    .auth-link {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text-muted);
      text-decoration: none;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      transition: background 0.2s, color 0.2s;
    }
    .auth-link:hover {
      background: color-mix(in srgb, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      color: white;
      text-decoration: none;
      padding: 0.45rem 1.1rem;
      border-radius: 999px;
      font-size: 0.9rem;
      font-weight: 600;
      font-family: var(--font-body);
      position: relative;
      overflow: hidden;
      transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
      box-shadow: 0 2px 10px color-mix(in srgb, var(--color-primary) 40%, transparent);
    }
    .btn-primary:hover {
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 18px color-mix(in srgb, var(--color-primary) 50%, transparent);
    }
    .btn-primary:active { transform: scale(0.95); box-shadow: none; }

    .logout {
      background: transparent;
      color: var(--color-text-muted);
      border: 1px solid var(--color-border);
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 500;
      transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
    }
    .logout:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      transform: translateY(-1px);
    }
    .logout:active { transform: scale(0.96); }
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
