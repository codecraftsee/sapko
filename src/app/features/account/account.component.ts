import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  template: `
    <section class="account">
      <h1>Moj nalog</h1>
      @if (auth.user(); as u) {
        <p><strong>{{ u.full_name || u.email }}</strong></p>
        <p class="meta">{{ u.email }} · {{ u.city || 'nepoznat grad' }}</p>
      }

      <div class="sections">
        <article>
          <h2><i data-lucide="paw-print" class="section-icon"></i> Moji ljubimci</h2>
          <p>Uskoro: upravljanje vašim ljubimcima i oglasima.</p>
        </article>
        <article>
          <h2><i data-lucide="droplets" class="section-icon"></i> Donorska registracija</h2>
          <p>Uskoro: prijavite svog ljubimca kao donora krvi.</p>
        </article>
        <article>
          <h2><i data-lucide="mail" class="section-icon"></i> Poruke</h2>
          <p>Uskoro: razgovori sa zainteresovanim udomiteljima.</p>
        </article>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; max-width: 900px; margin: 0 auto; padding: 2rem; }
    .meta { color: var(--color-text-muted); }
    .sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-top: 1.5rem; }
    article { background: var(--color-surface-alt); padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-card); box-shadow: var(--shadow-card); }
    article h2 { display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-display); }
    .section-icon { width: 1.2rem; height: 1.2rem; color: var(--color-primary); }
  `],
})
export class AccountComponent {
  auth = inject(AuthService);
}
