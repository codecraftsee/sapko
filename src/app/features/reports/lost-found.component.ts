import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UrgentService } from '../../core/services/urgent.service';
import { ThemeService, PetType } from '../../core/services/theme.service';
import { MatchSuggestion, Species, UrgentRequest, UrgentStatus, UrgentType } from '../../core/models/api.models';
import { environment } from '../../../environments/environment';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type Tab = 'lost' | 'found' | 'reunited';

interface ReportCard {
  id?: string;
  name: string;
  species: 'dog' | 'cat';
  city: string;
  metaSuffix?: string;
  description: string;
  time: string;
  tags: string[];
  tab: Tab;
  urgent?: boolean;
  imageHint?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-lost-found',
  imports: [RouterLink, LowerCasePipe],
  template: `
    <!-- ===================== PAGE HEADER ===================== -->
    <section class="page-header" data-screen-label="Header">
      <div class="container">
        <div class="page-header__inner">
          <div>
            <span class="eyebrow">
              <span class="eyebrow__dot"></span>
              Izgubljeno
              <span style="opacity:0.55">&amp;</span>
              <span class="eyebrow__dot eyebrow__dot--alt"></span>
              Nađeno
            </span>
            <h1>Pomozite ljubimcima da se <em>vrate kući</em>.</h1>
            <p class="lead">
              Otvoreni oglasi vlasnika koji traže svoje, i prolaznika koji su naišli na tuđe.
              Šapko upoređuje lokaciju, vreme i opis — i šalje notifikaciju kad se nešto poklopi.
            </p>
            <!-- TODO: priključiti pravi "spojeni" feed iz API-ja -->
            <div class="reunion-ticker" aria-live="polite">
              <span class="reunion-ticker__pulse"></span>
              Pre <b>14 min</b> · <b>Mrva</b> spojena sa vlasnicom
              <span class="reunion-ticker__sep"></span>
              <b>Vračar, Beograd</b>
            </div>
          </div>
          <div class="ph-stats">
            <div class="ph-stat ph-stat--lost">
              <span class="ph-stat__label"><i class="ph ph-magnifying-glass"></i> Izgubljeni</span>
              <!-- TODO: zameni hard-koded brojeve agregat-endpoint-om -->
              <span class="ph-stat__num">{{ lostCount() }}</span>
              <span class="ph-stat__delta">+7 u poslednja 24h</span>
            </div>
            <div class="ph-stat ph-stat--found">
              <span class="ph-stat__label"><i class="ph ph-map-pin"></i> Pronađeni</span>
              <span class="ph-stat__num">{{ foundCount() }}</span>
              <span class="ph-stat__delta">+11 u poslednja 24h</span>
            </div>
            <div class="ph-stat">
              <span class="ph-stat__label"><i class="ph ph-heart-straight"></i> Spojeni</span>
              <span class="ph-stat__num">{{ reunitedCount() }}</span>
              <span class="ph-stat__delta">u poslednjih 30 dana</span>
            </div>
            <div class="ph-stat">
              <span class="ph-stat__label"><i class="ph ph-clock-clockwise"></i> Prosečno vreme</span>
              <span class="ph-stat__num">2.1d</span>
              <span class="ph-stat__delta">do prvog poklapanja</span>
            </div>
          </div>
        </div>

        <div class="quick-actions">
          <a routerLink="/prijavi/izgubljen" class="qa-card qa-card--lost">
            <div class="qa-card__icon"><i class="ph-fill ph-magnifying-glass"></i></div>
            <div class="qa-card__body">
              <div class="qa-card__kicker">Izgubili ste ljubimca?</div>
              <div class="qa-card__title">Postavite oglas za nestalog</div>
              <p class="qa-card__desc">Prosečno 1 minut. Notifikacije idu odmah ka prolaznicima u radijusu od 2 km.</p>
            </div>
            <div class="qa-card__arrow"><i class="ph ph-arrow-right"></i></div>
          </a>
          <a routerLink="/prijavi/pronadjen" class="qa-card qa-card--found">
            <div class="qa-card__icon"><i class="ph-fill ph-paw-print"></i></div>
            <div class="qa-card__body">
              <div class="qa-card__kicker">Pronašli ste lutalicu?</div>
              <div class="qa-card__title">Prijavite pronađenog</div>
              <p class="qa-card__desc">Pre slanja proverimo postojeće oglase u blizini — da izbegnemo duplikate.</p>
            </div>
            <div class="qa-card__arrow"><i class="ph ph-arrow-right"></i></div>
          </a>
        </div>
      </div>
    </section>

    <!-- ===================== SEGMENTED TAB ===================== -->
    <section class="segmented-bar">
      <div class="container">
        <div class="segmented-bar__inner">
          <div class="segmented" role="tablist" aria-label="Izgubljeni ili pronađeni">
            <button class="seg-btn" data-tab="lost"
                    [class.is-active]="activeTab() === 'lost'"
                    [attr.aria-selected]="activeTab() === 'lost'"
                    (click)="setTab('lost')">
              <i class="ph-fill ph-magnifying-glass"></i>
              <span>Izgubljeni</span>
              <span class="seg-btn__count">{{ lostCount() }}</span>
            </button>
            <button class="seg-btn" data-tab="found"
                    [class.is-active]="activeTab() === 'found'"
                    [attr.aria-selected]="activeTab() === 'found'"
                    (click)="setTab('found')">
              <i class="ph-fill ph-map-pin"></i>
              <span>Pronađeni</span>
              <span class="seg-btn__count">{{ foundCount() }}</span>
            </button>
            <button class="seg-btn" data-tab="reunited"
                    [class.is-active]="activeTab() === 'reunited'"
                    [attr.aria-selected]="activeTab() === 'reunited'"
                    (click)="setTab('reunited')">
              <i class="ph-fill ph-heart-straight"></i>
              <span>Spojeni</span>
              <span class="seg-btn__count">{{ reunitedCount() }}</span>
            </button>
          </div>
          <div class="seg-meta">
            <a routerLink="/nalog/notifikacije"><i class="ph ph-bell"></i> Pretplati se na region</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TOOLBAR (filteri su za sada static placeholder) ===================== -->
    <section class="toolbar-bar">
      <div class="container">
        <div class="toolbar">
          <div class="toolbar__filters">
            <button class="filter-chip"
                    [class.is-active]="species() === 'dog'"
                    (click)="setSpecies('dog')">
              <i class="ph-fill ph-dog"></i> Psi
            </button>
            <button class="filter-chip"
                    [class.is-active]="species() === 'cat'"
                    (click)="setSpecies('cat')">
              <i class="ph-fill ph-cat"></i> Mačke
            </button>
            <span class="toolbar__divider"></span>
            <button class="filter-chip filter-chip--select">
              <i class="ph ph-calendar-blank"></i> Poslednjih 7 dana <i class="ph ph-caret-down" style="font-size: 0.7rem;"></i>
            </button>
            <button class="filter-chip filter-chip--select">
              <i class="ph ph-tag"></i> Sa okovratnikom <i class="ph ph-caret-down" style="font-size: 0.7rem;"></i>
            </button>
          </div>
          <div class="toolbar__sort">
            <span>Sortiraj:</span>
            <button class="filter-chip filter-chip--select">
              Najsvežiji <i class="ph ph-caret-down" style="font-size: 0.7rem;"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== MAP STRIP ===================== -->
    <section class="map-strip">
      <div class="container">
        <div class="map-strip__head">
          <div>
            <div class="map-strip__title"><i class="ph-fill ph-map-trifold"></i> Mapa u realnom vremenu</div>
            <p class="map-strip__sub">Beograd · pinovi pokazuju lokacije iz poslednjih 48h. Kliknite na pin za detalje.</p>
          </div>
          <div style="display:flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <div class="map-legend">
              <span class="map-legend__item map-legend__item--lost"><span class="map-legend__pin"></span> Izgubljen</span>
              <span class="map-legend__item map-legend__item--found"><span class="map-legend__pin"></span> Pronađen</span>
              <span class="map-legend__item map-legend__item--reunited"><span class="map-legend__pin"></span> Spojen</span>
            </div>
            <a routerLink="." class="map-cta"><i class="ph ph-arrows-out"></i> Otvori celu mapu</a>
          </div>
        </div>
      </div>
      <!-- TODO: zameniti sa MapPickerComponent u read-only modu ili leaflet markerom sa svim oglasima u trenutnoj regiji -->
      <div class="map-canvas" role="img" aria-label="Mapa Beograda sa pinovima izgubljenih i pronađenih ljubimaca">
        <span class="pin pin--lost" style="left: 22%; top: 30%;"></span>
        <span class="pin pin--lost pin--lg" style="left: 38%; top: 42%;">
          <span class="pin__halo" style="color: var(--lost);"></span>
        </span>
        <span class="pin pin--lost" style="left: 56%; top: 22%;"></span>
        <span class="pin pin--lost" style="left: 70%; top: 56%;"></span>
        <span class="pin pin--found" style="left: 28%; top: 60%;"></span>
        <span class="pin pin--found" style="left: 50%; top: 70%;"></span>
        <span class="pin pin--found" style="left: 64%; top: 38%;"></span>
        <span class="pin pin--found" style="left: 80%; top: 28%;"></span>
        <span class="pin pin--reunited" style="left: 44%; top: 78%;"></span>
        <span class="pin pin--reunited" style="left: 76%; top: 70%;"></span>
        <div class="map-callout" style="left: 41%; top: 14%;">
          <div class="map-callout__row">
            <span class="map-callout__name">Tisa, crni mačak</span>
            <span class="map-callout__type map-callout__type--lost">Izgubljen</span>
          </div>
          <div class="map-callout__meta">Vračar · pre 6 sati · ima okovratnik</div>
        </div>
      </div>
    </section>

    <!-- ===================== PETS GRID ===================== -->
    <section class="block block--tight-top">
      <div class="container">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom: 1.25rem; gap: 1rem; flex-wrap: wrap;">
          <div style="font-size: 0.88rem; color: var(--text-muted);">
            <strong style="color: var(--text);">{{ pets().length }}</strong>
            {{ activeTabLabel() }} · prikazano {{ pets().length === 0 ? '0' : '1–' + pets().length }}
          </div>
          <div style="display:flex; align-items:center; gap: 0.4rem; font-size: 0.82rem; color: var(--text-faint);">
            <i class="ph ph-info" style="font-size: 0.95rem;"></i>
            Sva osetljiva polja (telefon, tačna adresa) prikazuju se tek kad se javite oglašivaču.
          </div>
        </div>

        @if (petsLoading()) {
          <p style="text-align:center; color: var(--text-muted); padding: 3rem 1rem;">Učitavanje…</p>
        } @else if (pets().length === 0) {
          <p style="text-align:center; color: var(--text-muted); padding: 3rem 1rem;">
            Nema oglasa za ovaj tip. Budite prvi koji prijavi.
          </p>
        } @else {
          @if (totalMatchCount() > 0 && activeTab() !== 'reunited') {
            <div class="match-banner" style="margin: 0 0 1.25rem;">
              <i class="ph-fill ph-sparkle"></i>
              <span>
                <strong>{{ totalMatchCount() }} {{ totalMatchCount() === 1 ? 'moguće poklapanje' : 'moguća poklapanja' }}</strong>
                između izgubljenih i pronađenih — algoritam upoređuje lokaciju, vrstu i vreme.
              </span>
            </div>
          }
          <div class="pets-grid">
            @for (p of pets(); track p.id ?? p.name + p.city; let i = $index) {
              <a [routerLink]="p.id ? ['/izgubljeno-nadjeno', p.id] : ['.']"
                 class="pet-card"
                 [class.pet-card--lost]="p.tab === 'lost'"
                 [class.pet-card--found]="p.tab === 'found'"
                 [class.pet-card--reunited]="p.tab === 'reunited'"
                 [class.pet-card--urgent]="p.urgent">
                <div class="pet-card__media">
                  <span class="pet-card__badge">
                    @switch (p.tab) {
                      @case ('lost')     { <i class="ph-fill ph-magnifying-glass"></i> Izgubljen }
                      @case ('found')    { <i class="ph-fill ph-paw-print"></i> Pronađen }
                      @case ('reunited') { <i class="ph-fill ph-heart-straight"></i> Spojen }
                    }
                  </span>
                  <span class="pet-card__time">{{ p.time }}</span>
                  @if (p.imageUrl) {
                    <img [src]="p.imageUrl" [alt]="p.name" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />
                  } @else {
                    <span class="pet-card__placeholder-text">[ {{ p.imageHint || (p.name | lowercase) + '.jpg' }} ]</span>
                  }
                </div>
                <div class="pet-card__body">
                  <h3>
                    {{ p.name }}
                    <span class="pet-card__species-glyph">
                      @if (p.species === 'cat') {
                        <i class="ph-fill ph-cat"></i>
                      } @else {
                        <i class="ph-fill ph-dog"></i>
                      }
                    </span>
                  </h3>
                  <p class="pet-card__meta">
                    <i class="ph ph-map-pin"></i>
                    <span class="pet-card__meta-loc">{{ p.city }}</span>
                    @if (p.metaSuffix) { · {{ p.metaSuffix }} }
                  </p>
                  <p class="pet-card__desc">{{ p.description }}</p>
                  <div class="pet-card__tags">
                    @if (p.id && matchCount(p.id) > 0) {
                      <span class="pet-tag pet-tag--match">
                        <i class="ph-fill ph-sparkle"></i>
                        {{ matchCount(p.id) }} {{ matchCount(p.id) === 1 ? 'moguće poklapanje' : 'moguća poklapanja' }}
                      </span>
                    }
                    @for (t of p.tags; track t) {
                      <span class="pet-tag">{{ t }}</span>
                    }
                  </div>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </section>

    <!-- ===================== HOW IT WORKS ===================== -->
    <section class="block" style="background: var(--bg-base); border-top: 1px solid var(--border); padding-top: 3.5rem;">
      <div class="container">
        <div style="text-align:center; margin-bottom: 2rem;">
          <span class="eyebrow" style="margin-bottom: 0.7rem;"><i class="ph ph-path"></i> Kako spajamo</span>
          <h2 style="font-size: clamp(1.5rem, 2.6vw, 1.9rem); letter-spacing: -0.02em;">Tri koraka od oglasa do susreta.</h2>
          <p style="margin: 0.5rem auto 0; max-width: 560px; color: var(--text-muted); font-size: 0.95rem;">
            Šapko ne čeka da neko slučajno naleti na oglas — algoritam radi u pozadini.
          </p>
        </div>
        <div class="how-grid">
          <div class="step">
            <span class="step__num">01</span>
            <div class="step__icon"><i class="ph-fill ph-bell-ringing"></i></div>
            <h3>Postavite oglas za 1 minut</h3>
            <p>Foto, lokacija na mapi, kratak opis. Bez registracije za samo gledanje — registracija samo za prijavu.</p>
          </div>
          <div class="step">
            <span class="step__num">02</span>
            <div class="step__icon"><i class="ph-fill ph-sparkle"></i></div>
            <h3>Algoritam upoređuje</h3>
            <p>Sistem proverava postojeće oglase u radijusu od 2 km i upoređuje vrstu, boju i obeležja.</p>
          </div>
          <div class="step">
            <span class="step__num">03</span>
            <div class="step__icon"><i class="ph-fill ph-paw-print"></i></div>
            <h3>Notifikacija ako se poklopi</h3>
            <p>Oba vlasnika oglasa dobijaju obaveštenje. Kontakt postaje vidljiv tek kad obe strane pristanu.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== REUNIONS ===================== -->
    <!-- TODO: priključiti stvarne "spojene" priče iz API-ja kad endpoint postoji -->
    <section class="reunions" data-screen-label="Reunions">
      <div class="reunions__head">
        <span class="eyebrow">
          <span class="eyebrow__dot" style="background: var(--found); box-shadow: 0 0 0 3px color-mix(in srgb, var(--found) 22%, transparent);"></span>
          Spojeni ove nedelje
        </span>
        <h2>Vraćaju se kući.</h2>
        <p>Ovih 7 dana — 47 spajanja. Ovde su tri priče koje smo dobili od vlasnika.</p>
      </div>
      <div class="reunions-grid">
        <div class="reunion-card">
          <div class="reunion-card__head">
            <div class="reunion-card__avatar"><i class="ph-fill ph-dog"></i></div>
            <div>
              <div class="reunion-card__name">Žuća sa Marom</div>
              <div class="reunion-card__meta">Beograd · 4 dana razdvojeni</div>
            </div>
          </div>
          <p class="reunion-card__quote">
            „Mislila sam da je gotovo. Komšija ga je našao u parku 1 km dalje, video je oglas i odmah se javio. Hvala vam.”
          </p>
          <div class="reunion-card__footer">
            <span class="reunion-card__route">
              <span class="tag-lost">Izgubljen</span>
              <i class="ph ph-arrow-right"></i>
              <span class="tag-found">Pronađen</span>
            </span>
            <span>14. maj 2026.</span>
          </div>
        </div>

        <div class="reunion-card">
          <div class="reunion-card__head">
            <div class="reunion-card__avatar"><i class="ph-fill ph-cat"></i></div>
            <div>
              <div class="reunion-card__name">Tisa sa Markom</div>
              <div class="reunion-card__meta">Vračar · isti dan</div>
            </div>
          </div>
          <p class="reunion-card__quote">
            „Šapko mi je poslao notifikaciju u 23h. Devojka iz susedne ulice je našla Tisu na drvetu, čekala da joj se javim.”
          </p>
          <div class="reunion-card__footer">
            <span class="reunion-card__route">
              <span class="tag-lost">Izgubljen</span>
              <i class="ph ph-arrow-right"></i>
              <span class="tag-found">Pronađen</span>
            </span>
            <span>12. maj 2026.</span>
          </div>
        </div>

        <div class="reunion-card">
          <div class="reunion-card__head">
            <div class="reunion-card__avatar"><i class="ph-fill ph-dog"></i></div>
            <div>
              <div class="reunion-card__name">Buca sa Anom</div>
              <div class="reunion-card__meta">Niš · 11 dana razdvojeni</div>
            </div>
          </div>
          <p class="reunion-card__quote">
            „Veterinar je sken-irao čip i sistem ga je povezao sa mojim oglasom. Verovala sam da ga više neću videti.”
          </p>
          <div class="reunion-card__footer">
            <span class="reunion-card__route">
              <span class="tag-lost">Izgubljen</span>
              <i class="ph ph-arrow-right"></i>
              <span class="tag-found">Pronađen</span>
            </span>
            <span>9. maj 2026.</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TIPS ===================== -->
    <section class="block tips" data-screen-label="Tips">
      <div class="container">
        <div>
          <span class="eyebrow"><i class="ph ph-lightbulb"></i> Saveti</span>
          <h2 class="tips__title" style="margin-top: 0.6rem;">Prvih nekoliko sati su najvažniji.</h2>
          <p class="tips__sub">Šta uraditi kad nestane vaš ljubimac — i šta uraditi kad naiđete na tuđeg.</p>
        </div>
        <div class="tips-grid">
          <div class="tip-list tip-list--lost">
            <h3><i class="ph-fill ph-magnifying-glass"></i> Ako vam je nestao ljubimac</h3>
            <ol>
              <li><strong>Postavite oglas u prvih sat vremena.</strong> <span>90% spajanja se dešava u prva 3 dana.</span></li>
              <li><strong>Proverite najbliže veterinarske stanice.</strong> <span>Dobre šanse da je neko već doneo životinju.</span></li>
              <li><strong>Hodajte po okolini noću.</strong> <span>Mačke se često vrate u radijus od 500m, ali se kriju.</span></li>
              <li><strong>Ne brišite oglas brzo.</strong> <span>Ostavite ga aktivnim 2 nedelje — Šapko nastavlja da upoređuje.</span></li>
            </ol>
          </div>
          <div class="tip-list tip-list--found">
            <h3><i class="ph-fill ph-paw-print"></i> Ako ste pronašli tuđeg</h3>
            <ol>
              <li><strong>Proverite da li ima čip.</strong> <span>Svaki veterinar ga sken-ira besplatno.</span></li>
              <li><strong>Slikajte na licu mesta.</strong> <span>Fotografija na poznatoj lokaciji pomaže vlasniku da prepozna.</span></li>
              <li><strong>Ne hranite odmah ako je povređen.</strong> <span>Odvedite kod veterinara prvo — može imati operaciju.</span></li>
              <li><strong>Prijavite na Šapko pre objave po grupama.</strong> <span>Mi proveravamo postojeće oglase automatski.</span></li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== DUAL CTA ===================== -->
    <section class="block" style="padding-bottom: 4rem;">
      <div class="container">
        <div class="dual-cta">
          <div class="dual-cta__col dual-cta__col--lost">
            <div class="dual-cta__icon"><i class="ph-fill ph-magnifying-glass"></i></div>
            <h3>Vaš ljubimac je nestao?</h3>
            <p>Što pre objavite, veće su šanse. Notifikacija ide ka prolaznicima u radijusu od 2 km u trenutku postavljanja.</p>
            <a routerLink="/prijavi/izgubljen" class="btn btn--lost">
              <i class="ph ph-bell-ringing"></i> Prijavi izgubljenog
            </a>
          </div>
          <div class="dual-cta__col dual-cta__col--found">
            <div class="dual-cta__icon"><i class="ph-fill ph-paw-print"></i></div>
            <h3>Pronašli ste lutalicu?</h3>
            <p>Pre slanja oglasa, pokazaćemo vam slične nedavne oglase u blizini — često se već neko traži.</p>
            <a routerLink="/prijavi/pronadjen" class="btn btn--found">
              <i class="ph ph-map-pin"></i> Prijavi pronađenog
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .container { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
    section.block { padding: 3rem 0 4.5rem; }
    section.block--tight-top { padding-top: 2rem; }

    .page-header {
      position: relative;
      padding: 3rem 1.5rem 2rem;
      border-bottom: 1px solid var(--border);
      overflow: hidden;
      background:
        radial-gradient(circle at 8% -5%, color-mix(in srgb, var(--lost) 12%, transparent) 0%, transparent 45%),
        radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--found) 12%, transparent) 0%, transparent 45%),
        var(--bg-base);
    }
    .page-header__inner {
      display: grid; grid-template-columns: 1.4fr 1fr; gap: 2.5rem; align-items: end;
    }
    .page-header h1 {
      font-size: clamp(2rem, 4vw, 2.8rem);
      margin: 0.6rem 0;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .page-header h1 em {
      font-style: normal;
      background: linear-gradient(90deg, var(--lost) 0%, var(--lost) 48%, var(--found) 52%, var(--found) 100%);
      -webkit-background-clip: text; background-clip: text;
      color: transparent;
    }
    .page-header .lead { margin: 0; color: var(--text-muted); font-size: 1.02rem; max-width: 540px; }

    .eyebrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.8rem;
      background: rgba(255,255,255,0.7);
      color: var(--text);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-pill);
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
    }
    .eyebrow__dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--lost);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--lost) 22%, transparent);
    }
    .eyebrow__dot--alt {
      background: var(--found);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--found) 22%, transparent);
    }

    .reunion-ticker {
      margin-top: 1.25rem;
      display: inline-flex; align-items: center; gap: 0.7rem;
      padding: 0.45rem 0.85rem 0.45rem 0.55rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font-size: 0.82rem; color: var(--text-muted);
      max-width: 100%;
    }
    .reunion-ticker__pulse {
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--found); position: relative; flex-shrink: 0;
    }
    .reunion-ticker__pulse::after {
      content: ""; position: absolute; inset: -4px; border-radius: 50%;
      border: 2px solid var(--found);
      animation: lfpulse 1.8s ease-out infinite; opacity: 0;
    }
    @keyframes lfpulse { 0%{transform:scale(0.6);opacity:.9} 100%{transform:scale(1.6);opacity:0} }
    .reunion-ticker b { color: var(--text); font-weight: 600; }
    .reunion-ticker__sep { width: 3px; height: 3px; border-radius: 50%; background: var(--text-faint); opacity: 0.6; }

    .ph-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .ph-stat {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex; flex-direction: column; gap: 0.35rem;
      position: relative; overflow: hidden;
    }
    .ph-stat::before {
      content: ""; position: absolute; left: 0; top: 0; bottom: 0;
      width: 3px; background: var(--border-strong);
    }
    .ph-stat--lost::before { background: var(--lost); }
    .ph-stat--found::before { background: var(--found); }
    .ph-stat__label {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.74rem; font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.06em;
    }
    .ph-stat__num { font-size: 1.6rem; font-weight: 800; color: var(--text); letter-spacing: -0.025em; line-height: 1; }
    .ph-stat--lost .ph-stat__num { color: var(--lost); }
    .ph-stat--found .ph-stat__num { color: var(--found); }
    .ph-stat__delta { font-size: 0.72rem; color: var(--text-faint); }

    .quick-actions { margin: 2rem auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .qa-card {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.4rem 1.6rem;
      display: flex; align-items: center; gap: 1rem;
      color: inherit; text-decoration: none;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
      overflow: hidden;
    }
    .qa-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); color: inherit; }
    .qa-card--lost:hover { border-color: var(--lost); }
    .qa-card--found:hover { border-color: var(--found); }
    .qa-card__icon {
      width: 52px; height: 52px;
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .qa-card--lost .qa-card__icon { background: var(--lost-soft-bg); color: var(--lost); }
    .qa-card--found .qa-card__icon { background: var(--found-soft-bg); color: var(--found); }
    .qa-card__icon [class*="ph"] { font-size: 1.6rem; }
    .qa-card__body { flex: 1; min-width: 0; }
    .qa-card__kicker { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 0.1rem; }
    .qa-card--lost .qa-card__kicker { color: var(--lost); }
    .qa-card--found .qa-card__kicker { color: var(--found); }
    .qa-card__title { font-size: 1.1rem; font-weight: 700; letter-spacing: -0.015em; }
    .qa-card__desc { margin: 0.15rem 0 0; font-size: 0.86rem; color: var(--text-muted); }
    .qa-card__arrow {
      flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%;
      border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
    }
    .qa-card:hover .qa-card__arrow { transform: translateX(2px); }
    .qa-card--lost:hover .qa-card__arrow { background: var(--lost); color: #fff; border-color: var(--lost); }
    .qa-card--found:hover .qa-card__arrow { background: var(--found); color: #fff; border-color: var(--found); }

    .segmented-bar {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 64px; z-index: 20;
      padding: 0.8rem 1.5rem 0;
    }
    .segmented-bar__inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .segmented {
      display: inline-flex; background: var(--bg-subtle);
      border-radius: var(--radius-pill); padding: 4px; gap: 4px; position: relative;
    }
    .seg-btn {
      border: 0; background: transparent;
      padding: 0.55rem 1.1rem;
      font: inherit; font-size: 0.88rem; font-weight: 600;
      color: var(--text-muted); cursor: pointer;
      border-radius: var(--radius-pill);
      display: inline-flex; align-items: center; gap: 0.5rem;
      transition: color 0.15s, background 0.2s, box-shadow 0.2s;
      position: relative; white-space: nowrap;
    }
    .seg-btn [class*="ph"] { font-size: 1rem; }
    .seg-btn__count {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 26px; height: 20px; padding: 0 0.4rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-muted);
      border-radius: var(--radius-pill);
      font-size: 0.7rem; font-weight: 700;
    }
    .seg-btn:hover { color: var(--text); }
    .seg-btn.is-active { background: var(--bg-card); box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04); }
    .seg-btn.is-active[data-tab="lost"] { color: var(--lost); }
    .seg-btn.is-active[data-tab="found"] { color: var(--found); }
    .seg-btn.is-active[data-tab="lost"] .seg-btn__count { background: var(--lost-soft-bg); border-color: var(--lost-soft-border); color: var(--lost-hover); }
    .seg-btn.is-active[data-tab="found"] .seg-btn__count { background: var(--found-soft-bg); border-color: var(--found-soft-border); color: var(--found-hover); }

    .seg-meta { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.85rem; }
    .seg-meta a { color: var(--text); font-weight: 600; display: inline-flex; align-items: center; gap: 0.3rem; }
    .seg-meta a:hover { color: var(--primary); }

    .toolbar-bar { background: var(--bg-card); border-bottom: 1px solid var(--border); padding: 0.85rem 1.5rem 0.75rem; }
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; flex-wrap: wrap; }
    .toolbar__filters { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .toolbar__divider { width: 1px; height: 22px; background: var(--border-strong); margin: 0 0.25rem; }
    .filter-chip {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 0.85rem;
      background: var(--bg-base);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font: inherit; font-size: 0.85rem; font-weight: 500;
      color: var(--text); cursor: pointer;
      transition: all 0.15s;
    }
    .filter-chip [class*="ph"] { font-size: 0.95rem; }
    .filter-chip:hover { background: var(--bg-card); border-color: var(--border-strong); }
    .filter-chip.is-active { background: var(--primary); color: var(--on-primary); border-color: var(--primary); }
    .filter-chip--select { background: var(--bg-card); }
    .toolbar__sort { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.85rem; }

    .map-strip {
      background:
        radial-gradient(circle at 25% 30%, color-mix(in srgb, var(--lost) 8%, transparent) 0%, transparent 35%),
        radial-gradient(circle at 75% 60%, color-mix(in srgb, var(--found) 8%, transparent) 0%, transparent 35%),
        var(--bg-subtle);
      padding: 1.5rem 0 0;
      border-bottom: 1px solid var(--border);
    }
    .map-strip__head { display: flex; align-items: end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .map-strip__title { font-size: 1.05rem; font-weight: 700; letter-spacing: -0.01em; display: inline-flex; align-items: center; gap: 0.45rem; }
    .map-strip__title [class*="ph"] { color: var(--primary); font-size: 1.2rem; }
    .map-strip__sub { margin: 0.15rem 0 0; color: var(--text-muted); font-size: 0.88rem; }
    .map-legend { display: inline-flex; gap: 1rem; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap; }
    .map-legend__item { display: inline-flex; align-items: center; gap: 0.35rem; }
    .map-legend__pin { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 20%, transparent); }
    .map-legend__item--lost { color: var(--lost); } .map-legend__item--lost .map-legend__pin { background: var(--lost); }
    .map-legend__item--found { color: var(--found); } .map-legend__item--found .map-legend__pin { background: var(--found); }
    .map-legend__item--reunited { color: var(--primary); } .map-legend__item--reunited .map-legend__pin { background: var(--primary); }

    .map-canvas {
      position: relative; height: 260px;
      background:
        repeating-linear-gradient(33deg, transparent 0, transparent 70px, rgba(31,27,22,0.06) 70px, rgba(31,27,22,0.06) 71px),
        repeating-linear-gradient(-58deg, transparent 0, transparent 90px, rgba(31,27,22,0.05) 90px, rgba(31,27,22,0.05) 91px),
        linear-gradient(180deg, #F5EFE3 0%, #EFE7D5 100%);
      border-top: 1px solid var(--border); overflow: hidden;
    }
    .map-canvas::before, .map-canvas::after { content: ""; position: absolute; border-radius: 50%; pointer-events: none; }
    .map-canvas::before { inset: 38% -10% auto 30%; height: 38px; background: linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.28) 40%, rgba(96,165,250,0.28) 70%, transparent 100%); border-radius: 0; transform: rotate(-6deg); }
    .map-canvas::after { width: 120px; height: 80px; background: rgba(22,163,74,0.10); left: 12%; top: 60%; transform: rotate(-12deg); }
    .pin {
      position: absolute; width: 22px; height: 22px;
      border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
      box-shadow: 0 4px 8px rgba(31,27,22,0.18);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .pin::after { content: ""; width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.95); }
    .pin--lost { background: var(--lost); }
    .pin--found { background: var(--found); }
    .pin--reunited { background: var(--primary); border-radius: 50%; transform: rotate(0); width: 18px; height: 18px; }
    .pin--reunited::after { content: "✓"; color: #fff; font-size: 0.7rem; font-weight: 800; background: transparent; width: auto; height: auto; }
    .pin--lg { width: 28px; height: 28px; } .pin--lg::after { width: 11px; height: 11px; }
    .pin__halo { position: absolute; inset: -10px; border-radius: 50%; border: 2px solid currentColor; animation: lfpinPulse 2.4s ease-out infinite; opacity: 0; }
    @keyframes lfpinPulse { 0% { transform: scale(0.5); opacity: 0.8; } 100% { transform: scale(2.2); opacity: 0; } }

    .map-callout {
      position: absolute;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      padding: 0.65rem 0.85rem 0.7rem;
      font-size: 0.82rem; min-width: 220px; z-index: 2;
    }
    .map-callout__row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.15rem; }
    .map-callout__name { font-weight: 700; color: var(--text); }
    .map-callout__type { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.12rem 0.45rem; border-radius: var(--radius-pill); }
    .map-callout__type--lost { background: var(--lost-soft-bg); color: var(--lost); border: 1px solid var(--lost-soft-border); }
    .map-callout__type--found { background: var(--found-soft-bg); color: var(--found); border: 1px solid var(--found-soft-border); }
    .map-callout__meta { color: var(--text-muted); font-size: 0.78rem; }

    .map-cta {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.7rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.88rem; font-weight: 600;
      color: var(--text); cursor: pointer; text-decoration: none;
      transition: border-color 0.15s, color 0.15s;
    }
    .map-cta:hover { border-color: var(--primary); color: var(--primary); }

    .pets-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .pet-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden; box-shadow: var(--shadow-sm);
      color: inherit; text-decoration: none;
      display: flex; flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      position: relative;
    }
    .pet-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); color: inherit; }
    .pet-card--lost:hover { border-color: var(--lost-soft-border); }
    .pet-card--found:hover { border-color: var(--found-soft-border); }
    .pet-card--reunited:hover { border-color: var(--primary-soft-border); }
    .pet-card__media {
      height: 170px;
      background: var(--bg-subtle);
      position: relative; overflow: hidden;
      background-image: repeating-linear-gradient(135deg, transparent 0, transparent 12px, rgba(31,27,22,0.03) 12px, rgba(31,27,22,0.03) 13px);
    }
    .pet-card--lost .pet-card__media { background-color: var(--lost-soft-bg); }
    .pet-card--found .pet-card__media { background-color: var(--found-soft-bg); }
    .pet-card__placeholder-text {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-faint);
      font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
      font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.7;
    }
    .pet-card__badge {
      position: absolute; top: 0.65rem; left: 0.65rem;
      display: inline-flex; align-items: center; gap: 0.3rem;
      padding: 0.26rem 0.6rem;
      background: rgba(255,255,255,0.95);
      border-radius: var(--radius-pill);
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
      backdrop-filter: blur(4px);
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      z-index: 1;
    }
    .pet-card__badge [class*="ph"] { font-size: 0.85rem; }
    .pet-card--lost .pet-card__badge { color: var(--lost); border: 1px solid var(--lost-soft-border); }
    .pet-card--found .pet-card__badge { color: var(--found); border: 1px solid var(--found-soft-border); }
    .pet-card--reunited .pet-card__badge { color: var(--primary-hover); border: 1px solid var(--primary-soft-border); background: var(--primary-soft-bg); }
    .pet-card__time {
      position: absolute; top: 0.65rem; right: 0.65rem;
      background: rgba(31,27,22,0.78); color: #FBF6EE;
      border-radius: var(--radius-pill);
      padding: 0.2rem 0.55rem;
      font-size: 0.7rem; font-weight: 600;
      backdrop-filter: blur(4px);
      z-index: 1;
    }
    .pet-card--urgent .pet-card__time { background: var(--urgent); }
    .pet-card__body { padding: 0.85rem 1rem 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
    .pet-card__body h3 {
      font-size: 1rem; margin: 0; letter-spacing: -0.015em;
      display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem;
    }
    .pet-card__species-glyph { font-size: 0.95rem; color: var(--text-faint); flex-shrink: 0; }
    .pet-card__meta {
      margin: 0; color: var(--text-muted); font-size: 0.82rem;
      display: inline-flex; align-items: center; gap: 0.35rem;
    }
    .pet-card__meta [class*="ph"] { font-size: 0.9rem; }
    .pet-card__meta-loc { color: var(--text); font-weight: 500; }
    .pet-card__desc {
      margin: 0; font-size: 0.84rem; color: var(--text-muted);
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      line-height: 1.45;
    }
    .pet-card__tags { margin-top: auto; display: flex; flex-wrap: wrap; gap: 0.3rem; padding-top: 0.5rem; }
    .pet-tag {
      font-size: 0.7rem; font-weight: 500;
      color: var(--text-muted);
      padding: 0.18rem 0.55rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      background: var(--bg-base);
    }
    .pet-tag--match { color: var(--primary-hover); background: var(--primary-soft-bg); border-color: var(--primary-soft-border); font-weight: 600; }

    .match-banner {
      grid-column: 1 / -1;
      margin: 1.5rem 0 0.5rem;
      background: var(--bg-card);
      border: 1px dashed var(--primary-soft-border);
      border-radius: var(--radius-md);
      padding: 0.95rem 1.25rem;
      display: flex; align-items: center; gap: 0.85rem;
      color: var(--text-muted); font-size: 0.92rem;
    }
    .match-banner [class*="ph"] { color: var(--primary); font-size: 1.25rem; flex-shrink: 0; }
    .match-banner strong { color: var(--text); }
    .match-banner a { color: var(--primary); font-weight: 600; margin-left: auto; }

    .how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .step {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 1.6rem 1.4rem;
      position: relative; overflow: hidden;
    }
    .step__num { position: absolute; top: 0.85rem; right: 1.25rem; font-size: 3rem; font-weight: 800; line-height: 1; color: var(--bg-subtle); letter-spacing: -0.05em; }
    .step__icon { width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--primary-soft-bg); color: var(--primary-hover); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 0.85rem; }
    .step__icon [class*="ph"] { font-size: 1.35rem; }
    .step h3 { font-size: 1.05rem; margin-bottom: 0.4rem; letter-spacing: -0.015em; }
    .step p { margin: 0; color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; }

    .reunions {
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 3rem 1.5rem;
    }
    .reunions__head { text-align: center; margin-bottom: 2rem; }
    .reunions__head h2 { font-size: clamp(1.5rem, 2.6vw, 1.9rem); letter-spacing: -0.02em; }
    .reunions__head p { margin: 0.4rem auto 0; max-width: 540px; color: var(--text-muted); font-size: 0.95rem; }
    .reunions__head .eyebrow { margin: 0 auto 0.7rem; }
    .reunions-grid { max-width: 1180px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .reunion-card {
      background: var(--bg-base); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.6rem;
    }
    .reunion-card__head { display: flex; align-items: center; gap: 0.8rem; }
    .reunion-card__avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--bg-subtle);
      border: 2px solid var(--bg-card);
      color: var(--text-faint);
      display: flex; align-items: center; justify-content: center;
      position: relative; flex-shrink: 0;
      box-shadow: 0 0 0 2px var(--primary-soft-border);
    }
    .reunion-card__avatar [class*="ph"] { font-size: 1.4rem; color: var(--primary); }
    .reunion-card__avatar::after {
      content: "✓";
      position: absolute; bottom: -2px; right: -2px;
      width: 22px; height: 22px;
      background: var(--found); color: #fff;
      border-radius: 50%; border: 2px solid var(--bg-base);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 800;
    }
    .reunion-card__name { font-weight: 700; font-size: 1.02rem; letter-spacing: -0.01em; }
    .reunion-card__meta { font-size: 0.78rem; color: var(--text-muted); }
    .reunion-card__quote { margin: 0; color: var(--text); font-size: 0.92rem; line-height: 1.55; text-wrap: pretty; }
    .reunion-card__footer {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 0.78rem; color: var(--text-faint);
      border-top: 1px solid var(--border);
      padding-top: 0.7rem; margin-top: 0.2rem;
    }
    .reunion-card__route { display: inline-flex; align-items: center; gap: 0.3rem; }
    .reunion-card__route [class*="ph"] { font-size: 0.85rem; color: var(--text-muted); }
    .tag-lost { color: var(--lost); font-weight: 600; }
    .tag-found { color: var(--found); font-weight: 600; }

    .tips { background: var(--bg-subtle); }
    .tips__title { font-size: clamp(1.5rem, 2.6vw, 1.9rem); letter-spacing: -0.02em; margin-bottom: 0.4rem; }
    .tips__sub { color: var(--text-muted); font-size: 0.95rem; max-width: 540px; margin: 0; }
    .tips-grid { margin-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .tip-list { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem 1.6rem; }
    .tip-list h3 { font-size: 1.05rem; letter-spacing: -0.015em; display: inline-flex; align-items: center; gap: 0.45rem; margin-bottom: 1rem; }
    .tip-list--lost h3 { color: var(--lost); }
    .tip-list--found h3 { color: var(--found); }
    .tip-list ol { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.7rem; counter-reset: tip; }
    .tip-list li {
      padding-left: 2rem; position: relative;
      color: var(--text); font-size: 0.92rem; line-height: 1.55;
      counter-increment: tip;
    }
    .tip-list li::before {
      content: counter(tip);
      position: absolute; left: 0; top: 0.05rem;
      width: 22px; height: 22px; border-radius: 50%;
      font-size: 0.72rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .tip-list--lost li::before { background: var(--lost-soft-bg); color: var(--lost); border: 1px solid var(--lost-soft-border); }
    .tip-list--found li::before { background: var(--found-soft-bg); color: var(--found); border: 1px solid var(--found-soft-border); }
    .tip-list li span { color: var(--text-muted); }

    .dual-cta {
      background: var(--bg-deep); color: #FBF6EE;
      border-radius: var(--radius-xl);
      padding: 2.5rem 2.75rem;
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
      position: relative; overflow: hidden;
    }
    .dual-cta::before {
      content: ""; position: absolute;
      left: 30%; right: 30%; top: 50%;
      height: 1px; background: rgba(255,255,255,0.08);
    }
    @media (min-width: 760px) {
      .dual-cta::before {
        left: 50%; right: auto; top: 12%; bottom: 12%;
        width: 1px; height: auto;
        transform: translateX(-0.5px);
      }
    }
    .dual-cta__col h3 { color: #fff; font-size: 1.4rem; margin: 0.6rem 0 0.4rem; letter-spacing: -0.015em; }
    .dual-cta__col p { color: #D8CCBC; margin: 0 0 1.1rem; font-size: 0.95rem; line-height: 1.55; max-width: 360px; }
    .dual-cta__icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
    .dual-cta__col--lost .dual-cta__icon { background: rgba(37,99,235,0.18); color: #93C5FD; }
    .dual-cta__col--found .dual-cta__icon { background: rgba(22,163,74,0.18); color: #86EFAC; }
    .dual-cta__icon [class*="ph"] { font-size: 1.4rem; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem 1.35rem;
      background: var(--primary); color: var(--on-primary);
      border: none; border-radius: var(--radius-sm);
      font: inherit; font-size: 0.95rem; font-weight: 600;
      cursor: pointer; text-decoration: none;
      transition: background 0.15s ease, transform 0.15s ease;
    }
    .btn:hover { background: var(--primary-hover); color: var(--on-primary); }
    .btn--lost { background: var(--lost); }
    .btn--lost:hover { background: var(--lost-hover); color: #fff; }
    .btn--found { background: var(--found); }
    .btn--found:hover { background: var(--found-hover); color: #fff; }

    @media (max-width: 980px) {
      .page-header__inner { grid-template-columns: 1fr; gap: 1.5rem; }
      .quick-actions { grid-template-columns: 1fr; }
      .pets-grid { grid-template-columns: repeat(2, 1fr); }
      .how-grid, .reunions-grid { grid-template-columns: 1fr; }
      .tips-grid { grid-template-columns: 1fr; }
      .dual-cta { grid-template-columns: 1fr; }
      .segmented-bar { position: static; }
      .map-canvas { height: 220px; }
    }
    @media (max-width: 560px) {
      .pets-grid { grid-template-columns: 1fr; }
      section.block { padding: 2.5rem 0; }
      .ph-stats { grid-template-columns: 1fr 1fr; }
      .dual-cta { padding: 1.75rem; }
    }
  `],
})
export class LostFoundComponent implements OnInit {
  private svc = inject(UrgentService);
  private theme = inject(ThemeService);

  activeTab = signal<Tab>(initialTabFrom(inject(ActivatedRoute)));
  species = signal<PetType>(this.theme.petType());
  petsLoading = signal(false);
  pets = signal<ReportCard[]>([]);
  matchesByReport = signal<Record<string, MatchSuggestion[]>>({});

  lostCount = signal(0);
  foundCount = signal(0);
  reunitedCount = signal(0);

  totalMatchCount = computed(() =>
    Object.values(this.matchesByReport()).reduce((sum, arr) => sum + arr.length, 0),
  );

  activeTabLabel = computed(() => {
    switch (this.activeTab()) {
      case 'lost':     return 'izgubljenih ljubimaca';
      case 'found':    return 'pronađenih ljubimaca';
      case 'reunited': return 'spojenih ljubimaca';
    }
  });

  constructor() {
    // Nav theme toggle mirrors into the species chip.
    effect(() => {
      const t = this.theme.petType();
      if (this.species() !== t) this.species.set(t);
    });
    // Refetch pets + counts whenever tab or species changes.
    effect(() => {
      this.activeTab();
      this.species();
      this.loadPets();
      this.loadCounts();
    });
  }

  ngOnInit(): void {
    // initial load handled by the effect above
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  setSpecies(s: PetType): void {
    this.species.set(s);
    this.theme.set(s);
  }

  matchCount(reportId: string): number {
    return this.matchesByReport()[reportId]?.length ?? 0;
  }

  private filtersForTab(tab: Tab): { type: UrgentType; status?: UrgentStatus; species: Species } {
    const species = this.species() as Species;
    switch (tab) {
      case 'lost':     return { type: 'lost_pet', species };
      case 'found':    return { type: 'injured_stray', species };
      case 'reunited': return { type: 'lost_pet', status: 'resolved', species };
    }
  }

  private loadPets(): void {
    const tab = this.activeTab();
    this.petsLoading.set(true);
    this.matchesByReport.set({});
    this.svc.list(this.filtersForTab(tab)).subscribe({
      next: (rows) => {
        this.pets.set(rows.map(r => this.toCard(r, tab)));
        this.petsLoading.set(false);
        if (tab !== 'reunited') this.loadMatchesFor(rows);
      },
      error: () => {
        this.pets.set([]);
        this.petsLoading.set(false);
      },
    });
  }

  private loadMatchesFor(rows: UrgentRequest[]): void {
    const withGeo = rows.filter(r => r.id && r.lat != null && r.lng != null).slice(0, 12);
    if (withGeo.length === 0) return;
    forkJoin(
      Object.fromEntries(
        withGeo.map(r => [
          r.id,
          this.svc.potentialMatches(r.id).pipe(catchError(() => of([] as MatchSuggestion[]))),
        ]),
      ),
    ).subscribe(map => {
      const cleaned: Record<string, MatchSuggestion[]> = {};
      for (const [id, list] of Object.entries(map)) {
        if (list.length > 0) cleaned[id] = list;
      }
      this.matchesByReport.set(cleaned);
    });
  }

  private loadCounts(): void {
    const species = this.species() as Species;
    this.svc.list({ type: 'lost_pet', species }).subscribe(rs => this.lostCount.set(rs.length));
    this.svc.list({ type: 'injured_stray', species }).subscribe(rs => this.foundCount.set(rs.length));
    this.svc.list({ type: 'lost_pet', status: 'resolved', species }).subscribe(rs => this.reunitedCount.set(rs.length));
  }

  private toCard(r: UrgentRequest, tab: Tab): ReportCard {
    const photo = r.photos?.[0]?.url;
    const imageUrl = photo
      ? (photo.startsWith('http') ? photo : `${environment.apiUrl}${photo}`)
      : undefined;
    return {
      id: r.id,
      name: r.title,
      species: (r.species ?? 'dog') as 'dog' | 'cat',
      city: r.city,
      description: r.description,
      time: this.relativeTime(r.created_at),
      tags: [],
      tab,
      imageUrl,
    };
  }

  private relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.round(diff / 3_600_000);
    if (h < 1) return 'upravo';
    if (h < 24) return `pre ${h}h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'juče' : `pre ${d} dana`;
  }
}

function initialTabFrom(route: ActivatedRoute): Tab {
  const v = route.snapshot.queryParamMap.get('tab');
  return v === 'lost' || v === 'found' || v === 'reunited' ? v : 'lost';
}
