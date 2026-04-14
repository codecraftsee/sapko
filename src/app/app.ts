import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './layout/nav.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavComponent],
  template: `
    <app-nav />
    <main>
      <router-outlet />
    </main>
    <footer>
      <p>Šapko · Za Miću i svaku drugu šapu · © {{ year }}</p>
    </footer>
  `,
  styles: [`
    main { min-height: calc(100vh - 140px); background: #fafafa; }
    footer { text-align: center; padding: 1.5rem; color: #888; font-size: 0.9rem; border-top: 1px solid #eee; }
  `],
})
export class App implements OnInit {
  private auth = inject(AuthService);
  readonly year = new Date().getFullYear();

  ngOnInit() {
    if (this.auth.accessToken) {
      this.auth.loadCurrentUser().subscribe({ error: () => this.auth.logout() });
    }
  }
}
