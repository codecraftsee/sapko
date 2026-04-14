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
        <a routerLink="/urgentno" class="btn btn-urgent">Hitna pomoć</a>
      </div>
    </section>

    <section class="pillars">
      <article>
        <h2>🏠 Udomljavanje</h2>
        <p>Psi i mačke iz azila i od privatnih lica traže svoj zauvek dom.</p>
        <a routerLink="/udomi">Pregledaj oglase →</a>
      </article>
      <article class="urgent">
        <h2>🩸 Donori krvi</h2>
        <p>Najvažnija funkcija: kada životinji treba transfuzija, vreme spašava život.</p>
        <a routerLink="/donori">Postani donor →</a>
      </article>
      <article>
        <h2>🆘 Hitno</h2>
        <p>Hrana za azile, izgubljeni ljubimci, povređene ulične životinje, lečenje.</p>
        <a routerLink="/urgentno">Otvori tablu →</a>
      </article>
    </section>
  `,
  styles: [`
    :host { display: block; max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .hero { text-align: center; padding: 3rem 1rem 4rem; }
    .hero h1 { font-size: 3rem; color: #2a2a2a; margin: 0 0 1rem; }
    .lead { font-size: 1.2rem; color: #666; max-width: 680px; margin: 0 auto 2rem; }
    .cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn {
      padding: 0.85rem 1.75rem; background: #d94d4d; color: white;
      border-radius: 8px; text-decoration: none; font-weight: 600;
    }
    .btn-urgent { background: #b91c1c; }
    .pillars { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
    article {
      background: #fff; padding: 1.75rem; border-radius: 12px;
      border: 1px solid #eee; box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    }
    article.urgent { border-color: #fecaca; background: #fef2f2; }
    article h2 { margin: 0 0 0.75rem; font-size: 1.3rem; }
    article p { color: #555; line-height: 1.5; }
    article a { color: #d94d4d; text-decoration: none; font-weight: 600; }
  `],
})
export class HomeComponent {}
