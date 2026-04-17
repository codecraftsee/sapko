import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h1>Prijava</h1>
      <form (ngSubmit)="submit()">
        <label>Email
          <input type="email" [(ngModel)]="email" name="email" required />
        </label>
        <label>Lozinka
          <input type="password" [(ngModel)]="password" name="password" required />
        </label>
        @if (error()) { <p class="error">{{ error() }}</p> }
        <button type="submit" [disabled]="loading()">
          {{ loading() ? 'Učitavanje…' : 'Prijavi se' }}
        </button>
      </form>
      <p class="alt">Nemate nalog? <a routerLink="/registracija">Registrujte se</a></p>
    </div>
  `,
  styles: [`
    .auth-card { max-width: 400px; margin: 3rem auto; padding: 2rem; background: var(--color-surface-alt); border-radius: var(--radius-card); border: 1px solid var(--color-border); box-shadow: var(--shadow-card); }
    h1 { margin: 0 0 1.5rem; font-family: var(--font-display); }
    label { display: block; margin-bottom: 1rem; font-weight: 500; color: var(--color-text); }
    input { display: block; width: 100%; padding: 0.6rem; border: 1px solid var(--color-border); border-radius: 6px; margin-top: 0.35rem; background: var(--color-surface); color: var(--color-text); font-family: var(--font-body); transition: border-color 0.2s; }
    input:focus { outline: none; border-color: var(--color-primary); }
    button { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); color: white; border: none; border-radius: var(--radius-card); font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: opacity 0.2s, transform 0.15s; }
    button:hover { opacity: 0.9; transform: translateY(-1px); }
    button:active { transform: scale(0.98); }
    button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .error { color: var(--color-primary); font-size: 0.9rem; }
    .alt { margin-top: 1rem; text-align: center; font-size: 0.9rem; color: var(--color-text-muted); }
    .alt a { color: var(--color-primary); }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.auth.loadCurrentUser().subscribe();
        this.router.navigate(['/']);
      },
      error: (e) => {
        this.error.set(e?.error?.detail ?? 'Greška pri prijavi');
        this.loading.set(false);
      },
    });
  }
}
