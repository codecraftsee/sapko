import { Component, inject, OnInit, afterNextRender } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavComponent } from './layout/nav.component';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  template: `
    <app-nav />
    <main>
      <router-outlet />
    </main>
    <footer class="site-footer">
      <p>© {{ year }} Šapko · Za Miću i svaku drugu šapu <i data-lucide="paw-print" class="footer-paw"></i></p>
    </footer>
  `,
  styles: [`
    main { min-height: calc(100vh - 120px); background: var(--color-surface); }
    .site-footer {
      background: var(--color-text);
      color: rgba(255, 255, 255, 0.45);
      text-align: center;
      padding: 1.25rem 2rem;
      font-size: 0.875rem;
    }
    .site-footer p { margin: 0; color: inherit; }
    .footer-paw { width: 0.9rem; height: 0.9rem; opacity: 0.6; }
  `],
})
export class App implements OnInit {
  private auth   = inject(AuthService);
  private theme  = inject(ThemeService);
  private router = inject(Router);
  readonly year  = new Date().getFullYear();

  constructor() {
    afterNextRender(() => createIcons({ icons }));
  }

  ngOnInit() {
    if (this.auth.accessToken) {
      this.auth.loadCurrentUser().subscribe({ error: () => this.auth.logout() });
    }

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => setTimeout(() => createIcons({ icons }), 0));
  }
}
