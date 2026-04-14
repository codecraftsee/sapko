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
    .auth-card { max-width: 400px; margin: 3rem auto; padding: 2rem; background: #fff; border-radius: 12px; border: 1px solid #eee; }
    h1 { margin: 0 0 1.5rem; }
    label { display: block; margin-bottom: 1rem; font-weight: 500; }
    input { display: block; width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 6px; margin-top: 0.35rem; }
    button { width: 100%; padding: 0.75rem; background: #d94d4d; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    button:disabled { opacity: 0.6; }
    .error { color: #b91c1c; font-size: 0.9rem; }
    .alt { margin-top: 1rem; text-align: center; font-size: 0.9rem; color: #666; }
    .alt a { color: #d94d4d; }
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
