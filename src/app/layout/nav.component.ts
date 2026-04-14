import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <a routerLink="/" class="brand">🐾 Šapko</a>
      <div class="links">
        <a routerLink="/udomi" routerLinkActive="active">Udomljavanje</a>
        <a routerLink="/urgentno" routerLinkActive="active">Hitno</a>
        <a routerLink="/donori" routerLinkActive="active">Donori krvi</a>
      </div>
      <div class="auth">
        @if (auth.isLoggedIn()) {
          <a routerLink="/moj-nalog">Moj nalog</a>
          <button (click)="auth.logout()">Odjavi se</button>
        } @else {
          <a routerLink="/prijava">Prijava</a>
          <a routerLink="/registracija" class="btn-primary">Registracija</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 2rem; background: #fff; border-bottom: 1px solid #eee;
      position: sticky; top: 0; z-index: 10;
    }
    .brand { font-size: 1.5rem; font-weight: 700; color: #d94d4d; text-decoration: none; }
    .links { display: flex; gap: 1.5rem; }
    .links a { color: #333; text-decoration: none; padding: 0.5rem; }
    .links a.active { color: #d94d4d; border-bottom: 2px solid #d94d4d; }
    .auth { display: flex; gap: 0.75rem; align-items: center; }
    .auth a { color: #333; text-decoration: none; }
    .btn-primary, button {
      background: #d94d4d; color: white; border: none; padding: 0.5rem 1rem;
      border-radius: 6px; cursor: pointer;
    }
    .btn-primary { text-decoration: none; }
    button { background: transparent; color: #666; }
  `],
})
export class NavComponent {
  auth = inject(AuthService);
}
