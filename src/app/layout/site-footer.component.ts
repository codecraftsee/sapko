import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createIcons, icons } from 'lucide';
import { SapkoLogoComponent } from './sapko-logo.component';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, SapkoLogoComponent],
  template: `
    <footer class="foot">
      <div class="foot-grid">
        <div class="foot-brand">
          <a routerLink="/" class="brand" aria-label="Šapko">
            <app-sapko-logo size="2rem" />
          </a>
          <p>Otvorena platforma za udomljavanje, hitnu pomoć i registar donora krvi za pse i mačke u Srbiji.</p>
          <div class="foot-socials">
            <a class="foot-soc" href="#" aria-label="Instagram"><i data-lucide="instagram"></i></a>
            <a class="foot-soc" href="#" aria-label="Facebook"><i data-lucide="facebook"></i></a>
            <a class="foot-soc" href="#" aria-label="Email"><i data-lucide="mail"></i></a>
          </div>
        </div>
        <div class="foot-col">
          <h4>Platforma</h4>
          <ul>
            <li><a routerLink="/udomi">Udomljavanje</a></li>
            <li><a routerLink="/urgentno">Hitno</a></li>
            <li><a routerLink="/donori">Donori krvi</a></li>
            <li><a routerLink="/kako-radi">Kako radi</a></li>
            <li><a routerLink="/moj-nalog">Postavi oglas</a></li>
          </ul>
        </div>
        <div class="foot-col">
          <h4>O Šapku</h4>
          <ul>
            <li><a href="#">Naša priča</a></li>
            <li><a href="#">Partneri</a></li>
            <li><a href="#">Kontakt</a></li>
            <li><a href="#">Podrži nas</a></li>
          </ul>
        </div>
        <div class="foot-col">
          <h4>Resursi</h4>
          <ul>
            <li><a href="#">Vodič za udomitelje</a></li>
            <li><a href="#">Šta znači biti donor?</a></li>
            <li><a href="#">Često postavljana pitanja</a></li>
            <li><a href="#">Pravila zajednice</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© {{ year }} Šapko. Napravljeno sa ljubavlju u Beogradu.</span>
        <div class="foot-bottom-links">
          <a href="#">Privatnost</a>
          <a href="#">Uslovi korišćenja</a>
          <a href="#">Kolačići</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .foot {
      background: #2A211A;
      color: #C9BCAE;
      padding: 3.5rem 1.5rem 1.5rem;
      margin-top: 4rem;
    }
    .foot-grid {
      max-width: 1180px; margin: 0 auto;
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1fr;
      gap: 2.5rem;
      padding-bottom: 2.5rem;
      border-bottom: 1px solid rgba(251,246,238,0.1);
    }
    .foot-brand .brand {
      display: inline-flex; align-items: center; gap: 0.45rem;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.4rem;
      color: #fff;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .foot-brand p {
      margin: 1rem 0 1.25rem;
      color: #9C8E80;
      font-size: 0.9rem;
      line-height: 1.55;
      max-width: 320px;
    }
    .foot-socials { display: flex; gap: 0.5rem; }
    .foot-soc {
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 1px solid rgba(251,246,238,0.15);
      color: #C9BCAE;
      display: inline-flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      text-decoration: none;
    }
    .foot-soc [data-lucide] { width: 1.1rem; height: 1.1rem; }
    .foot-soc:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
    .foot-col h4 {
      color: #fff;
      font-family: var(--font-body);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin: 0 0 1rem;
    }
    .foot-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .foot-col a {
      color: #C9BCAE;
      font-size: 0.9rem;
      text-decoration: none;
    }
    .foot-col a:hover { color: #fff; }
    .foot-bottom {
      max-width: 1180px; margin: 0 auto;
      padding-top: 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 1rem;
      color: #6B5E52;
      font-size: 0.82rem;
    }
    .foot-bottom-links { display: flex; gap: 1.25rem; }
    .foot-bottom-links a { color: #6B5E52; text-decoration: none; }
    .foot-bottom-links a:hover { color: #C9BCAE; }

    @media (max-width: 980px) {
      .foot-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
    }
    @media (max-width: 560px) {
      .foot-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class SiteFooterComponent implements AfterViewInit {
  readonly year = new Date().getFullYear();

  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }
}
