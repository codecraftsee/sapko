import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Svakoj šapi treba neko</h1>
      <p class="lead">
        Šapko je platforma koja povezuje ljude koji žele da pomognu psima i mačkama —
        bilo da traže dom, hitnu pomoć ili donora krvi.
      </p>
      <div class="cta">
        <a routerLink="/udomi" class="btn">Udomi ljubimca</a>
        <a routerLink="/urgentno" class="btn btn-outline">Hitna pomoć</a>
      </div>
    </section>

    <section class="pillars">
      <article>
        <h2><i data-lucide="house" class="pillar-icon"></i> Udomljavanje</h2>
        <p>Psi i mačke iz azila i od privatnih lica traže svoj zauvek dom.</p>
        <a routerLink="/udomi">Pregledaj oglase →</a>
      </article>
      <article class="urgent">
        <h2><i data-lucide="droplets" class="pillar-icon"></i> Donori krvi</h2>
        <p>Najvažnija funkcija: kada životinji treba transfuzija, vreme spašava život.</p>
        <a routerLink="/donori">Postani donor →</a>
      </article>
      <article>
        <h2><i data-lucide="siren" class="pillar-icon"></i> Hitno</h2>
        <p>Hrana za azile, izgubljeni ljubimci, povređene ulične životinje, lečenje.</p>
        <a routerLink="/urgentno">Otvori tablu →</a>
      </article>
    </section>
  `,
  styles: [`
    :host { display: block; }

    /* Hero */
    .hero {
      background: linear-gradient(160deg, var(--color-surface) 0%, var(--color-surface-alt) 100%);
      text-align: center;
      padding: 5rem 2rem 6rem;
    }
    .hero h1 {
      font-family: var(--font-display);
      font-size: clamp(2.2rem, 5vw, 3.5rem);
      color: var(--color-text);
      margin: 0 0 1.25rem;
    }
    .lead {
      font-size: 1.2rem;
      line-height: 1.7;
      color: var(--color-text-muted);
      max-width: 640px;
      margin: 0 auto 2.5rem;
    }
    .cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      padding: 0.85rem 2rem;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      color: white;
      border-radius: var(--radius-card);
      text-decoration: none;
      font-weight: 700;
      font-family: var(--font-body);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 35%, transparent);
      transition: transform 0.15s, box-shadow 0.2s;
    }
    .btn:hover {
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 45%, transparent);
    }
    .btn:active { transform: scale(0.97); box-shadow: none; }
    .btn-outline {
      background: transparent;
      color: var(--color-primary);
      border: 2px solid var(--color-primary);
      box-shadow: none;
    }
    .btn-outline:hover {
      background: var(--color-primary);
      color: white;
      box-shadow: 0 6px 18px color-mix(in srgb, var(--color-primary) 35%, transparent);
    }

    /* Pillars */
    .pillars {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      max-width: 1100px;
      margin: 0 auto;
      padding: 3rem 2rem;
    }
    article {
      background: var(--color-surface-alt);
      padding: 2rem;
      border-radius: var(--radius-card);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-card);
      transition: box-shadow 0.3s, transform 0.3s;
    }
    article:hover {
      box-shadow: var(--shadow-hover);
      transform: translateY(-3px);
    }
    article.urgent {
      border-color: var(--color-amber);
      background: var(--color-surface-accent);
    }
    article h2 {
      margin: 0 0 0.75rem;
      font-size: 1.3rem;
      font-family: var(--font-display);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .pillar-icon { width: 1.4rem; height: 1.4rem; color: var(--color-primary); }
    article p {
      color: var(--color-text-muted);
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }
    article a {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.2s;
    }
    article a:hover { color: var(--color-primary-light); }

    @media (max-width: 640px) {
      .hero { padding: 3.5rem 1.25rem 4rem; }
      .pillars { padding: 2rem 1.25rem; }
    }
  `],
})
export class HomeComponent {}
