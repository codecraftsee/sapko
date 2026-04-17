import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-donors-info',
  imports: [RouterLink],
  template: `
    <section class="intro">
      <h1><i data-lucide="droplets" class="hero-icon"></i> Donori krvi</h1>
      <p class="lead">
        Kada ljubimac doživi traumu, operaciju ili tešku bolest, često mu je potrebna
        transfuzija krvi da preživi. Donori su zdravi psi i mačke čiji vlasnici su se
        dobrovoljno registrovali da pomognu u hitnim slučajevima.
      </p>

      <div class="cta">
        <a routerLink="/moj-nalog" class="btn">Registruj svog ljubimca kao donora</a>
      </div>
    </section>

    <section class="criteria">
      <h2>Ko može biti donor?</h2>
      <div class="grid">
        <article>
          <h3><i data-lucide="dog" class="donor-icon"></i> Psi</h3>
          <ul>
            <li>Starost 1–8 godina</li>
            <li>Težina preko 25 kg</li>
            <li>Redovno vakcinisani</li>
            <li>Bez hroničnih bolesti</li>
            <li>Mirnog temperamenta</li>
          </ul>
        </article>
        <article>
          <h3><i data-lucide="cat" class="donor-icon"></i> Mačke</h3>
          <ul>
            <li>Starost 1–8 godina</li>
            <li>Težina preko 4 kg</li>
            <li>Isključivo stanari (indoor)</li>
            <li>Redovno vakcinisane</li>
            <li>Bez FeLV/FIV</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="how">
      <h2>Kako funkcioniše?</h2>
      <ol>
        <li>Registrujete svog ljubimca kao potencijalnog donora sa osnovnim podacima i krvnom grupom (ako je poznata).</li>
        <li>Kada neko u vašem gradu postavi hitan zahtev za krv koja odgovara, automatski vam šaljemo email.</li>
        <li>Vi odlučujete da li možete da pomognete — nikakvih obaveza.</li>
      </ol>
    </section>
  `,
  styles: [`
    :host { display: block; max-width: 900px; margin: 0 auto; padding: 2rem; }
    .intro { text-align: center; padding: 2rem 0; }
    h1 { font-size: 2.5rem; margin: 0 0 1rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    h3 { display: flex; align-items: center; gap: 0.4rem; }
    .hero-icon { width: 2rem; height: 2rem; }
    .donor-icon { width: 1.2rem; height: 1.2rem; }
    .lead { font-size: 1.1rem; color: var(--color-text-muted); line-height: 1.6; }
    .cta { margin-top: 2rem; }
    .btn { padding: 0.85rem 1.75rem; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)); color: white; border-radius: var(--radius-card); text-decoration: none; font-weight: 600; box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 35%, transparent); transition: transform 0.15s, box-shadow 0.2s; }
    .btn:hover { color: white; transform: translateY(-2px); box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 45%, transparent); }
    .btn:active { transform: scale(0.97); box-shadow: none; }
    .criteria, .how { margin-top: 3rem; }
    h2 { border-left: 4px solid var(--color-primary); padding-left: 0.75rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; }
    article { background: var(--color-surface-alt); padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-card); }
    ul, ol { line-height: 1.8; color: var(--color-text-muted); }
  `],
})
export class DonorsInfoComponent {}
