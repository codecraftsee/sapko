import { Component, inject, OnInit, afterNextRender } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavComponent } from './layout/nav.component';
import { SiteFooterComponent } from './layout/site-footer.component';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent, SiteFooterComponent],
  template: `
    <app-nav />
    <main>
      <router-outlet />
    </main>
    <app-site-footer />
  `,
  styles: [`
    main { min-height: calc(100vh - 120px); background: var(--bg-base); }
  `],
})
export class App implements OnInit {
  private auth   = inject(AuthService);
  private theme  = inject(ThemeService);
  private router = inject(Router);

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
