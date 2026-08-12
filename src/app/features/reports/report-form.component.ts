import { AfterViewInit, Component, computed, inject, input, signal } from '@angular/core';
import { createIcons, icons } from 'lucide';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UrgentService } from '../../core/services/urgent.service';
import { Species, UrgentRequest, UrgentType } from '../../core/models/api.models';
import { MapPickerComponent } from '../../shared/map-picker.component';
import { environment } from '../../../environments/environment';

type ReportKind = 'lost' | 'found';

interface KindConfig {
  type: UrgentType;
  eyebrow: string;
  title: string;
  lead: string;
  titlePlaceholder: string;
  descPlaceholder: string;
  submitLabel: string;
  duplicatePrompt: string;
}

const CONFIGS: Record<ReportKind, KindConfig> = {
  lost: {
    type: 'lost_pet',
    eyebrow: 'Izgubljen ljubimac',
    title: 'Prijavi izgubljenog ljubimca',
    lead: 'Opišite ljubimca i poslednju lokaciju gde je viđen. Što više detalja, veće su šanse da ga neko prepozna.',
    titlePlaceholder: 'Npr. Izgubljen mačak Tisa, Vračar',
    descPlaceholder: 'Boja, veličina, prepoznatljive oznake, okovratnik, čip, ponašanje (plašljiv/druželjubiv)…',
    submitLabel: 'Objavi oglas',
    duplicatePrompt: 'Već ima oglasa u blizini za istu vrstu. Da li je vaš ljubimac neko od ovih?',
  },
  found: {
    type: 'injured_stray',
    eyebrow: 'Pronađen ljubimac',
    title: 'Prijavi pronađenog ljubimca',
    lead: 'Pre slanja, proverićemo da li već postoji oglas za istu životinju u blizini — kako bismo izbegli duplikate.',
    titlePlaceholder: 'Npr. Pronađen pas kod Ade Ciganlije',
    descPlaceholder: 'Boja, veličina, ima li okovratnik/čip, gde je sada (kod vas, kod vet, na ulici)…',
    submitLabel: 'Objavi oglas',
    duplicatePrompt: 'Već ima oglasa u blizini za istu vrstu. Da li je životinja koju ste pronašli neko od ovih?',
  },
};

@Component({
  selector: 'app-report-form',
  imports: [FormsModule, MapPickerComponent],
  template: `
    <section class="page-header">
      <div class="container">
        <span class="eyebrow">
          <i data-lucide="bell-plus" class="icon--sm"></i>
          {{ cfg().eyebrow }}
        </span>
        <h1>{{ cfg().title }}</h1>
        <p class="lead">{{ cfg().lead }}</p>
      </div>
    </section>

    <section class="block">
      <div class="container container--form">
        <form (ngSubmit)="onSubmit()" #f="ngForm" novalidate>
          <div class="field">
            <label>Vrsta</label>
            <div class="seg">
              <button type="button" class="seg__btn" [class.is-active]="species() === 'dog'" (click)="species.set('dog')">
                <i data-lucide="dog"></i> Pas
              </button>
              <button type="button" class="seg__btn" [class.is-active]="species() === 'cat'" (click)="species.set('cat')">
                <i data-lucide="cat"></i> Mačka
              </button>
            </div>
          </div>

          <div class="field">
            <label for="title">Naslov</label>
            <input id="title" name="title" type="text"
                   [ngModel]="titleValue()" (ngModelChange)="titleValue.set($event)"
                   required maxlength="200"
                   [placeholder]="cfg().titlePlaceholder" />
          </div>

          <div class="field">
            <label for="city">Grad</label>
            <input id="city" name="city" type="text"
                   [ngModel]="city()" (ngModelChange)="city.set($event)"
                   required maxlength="100"
                   placeholder="Beograd" />
          </div>

          <div class="field">
            <label for="description">Opis</label>
            <textarea id="description" name="description" rows="5"
                      [ngModel]="description()" (ngModelChange)="description.set($event)"
                      required
                      [placeholder]="cfg().descPlaceholder"></textarea>
          </div>

          <div class="field">
            <label>Lokacija na mapi</label>
            <app-map-picker (pick)="onPickLocation($event)" (clearPick)="onClearLocation()" />
            <p class="hint">Bez lokacije nećemo moći da proverimo postojeće oglase u blizini.</p>
          </div>

          <div class="field">
            <label for="phone">Telefon za kontakt <span class="opt">(opciono)</span></label>
            <input id="phone" name="phone" type="tel"
                   [ngModel]="phone()" (ngModelChange)="phone.set($event)"
                   maxlength="50" placeholder="06x xxx xxxx" />
          </div>

          @if (checkingDuplicates()) {
            <div class="dup dup--loading">
              <i data-lucide="loader" class="spin"></i>
              <span>Proveravamo postojeće oglase u blizini…</span>
            </div>
          }

          @if (duplicates().length > 0 && !forceNew()) {
            <div class="dup">
              <div class="dup__head">
                <i data-lucide="alert-triangle"></i>
                <strong>{{ cfg().duplicatePrompt }}</strong>
              </div>
              <div class="dup__list">
                @for (d of duplicates(); track d.id) {
                  <a [href]="'/urgentno/' + d.id" class="dup__item" target="_blank" rel="noopener">
                    @if (photoUrl(d); as src) {
                      <img [src]="src" alt="" class="dup__img" />
                    } @else {
                      <div class="dup__img dup__img--ph"><i data-lucide="image"></i></div>
                    }
                    <div class="dup__body">
                      <div class="dup__title">{{ d.title }}</div>
                      <div class="dup__meta">{{ d.city }} · {{ relativeTime(d.created_at) }}</div>
                    </div>
                  </a>
                }
              </div>
              <div class="dup__actions">
                <button type="button" class="btn btn--ghost" (click)="forceNew.set(true)">
                  Nije isti — nastavi sa novim oglasom
                </button>
              </div>
            </div>
          }

          @if (errorMsg()) {
            <div class="form-error">{{ errorMsg() }}</div>
          }

          <div class="actions">
            <button type="submit" class="btn" [disabled]="submitting() || !canSubmit()">
              @if (submitting()) {
                <i data-lucide="loader" class="spin"></i> Šaljemo…
              } @else {
                <i data-lucide="check"></i> {{ cfg().submitLabel }}
              }
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
    .container--form { max-width: 720px; }
    section.block { padding: 3rem 0 5rem; }

    .page-header {
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 60%),
        var(--bg-base);
      padding: 2.5rem 1.5rem 2rem;
      border-bottom: 1px solid var(--border);
    }
    .page-header h1 {
      font-size: clamp(1.7rem, 3.5vw, 2.2rem);
      margin: 0.6rem 0;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .page-header .lead {
      margin: 0; color: var(--text-muted);
      font-size: 1rem; max-width: 600px;
    }
    .eyebrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.8rem;
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
      border: 1px solid var(--primary-soft-border);
      border-radius: var(--radius-pill);
      font-size: 0.72rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
    }
    .eyebrow [data-lucide] { width: 0.95rem; height: 0.95rem; }

    .field { display: flex; flex-direction: column; gap: 0.45rem; margin-bottom: 1.25rem; }
    .field label {
      font-size: 0.85rem; font-weight: 600;
      color: var(--text);
    }
    .field .opt { color: var(--text-faint); font-weight: 400; }
    .field input,
    .field textarea {
      width: 100%;
      padding: 0.7rem 0.85rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font: inherit; font-size: 0.95rem;
      color: var(--text);
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .field textarea { resize: vertical; min-height: 120px; }
    .field input:focus,
    .field textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--focus-ring);
    }
    .hint { margin: 0.25rem 0 0; font-size: 0.8rem; color: var(--text-muted); }

    .seg { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
    .seg__btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.55rem 1.05rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      font: inherit; font-size: 0.9rem; font-weight: 500;
      color: var(--text); cursor: pointer;
      transition: all 0.15s;
    }
    .seg__btn [data-lucide] { width: 1rem; height: 1rem; }
    .seg__btn:hover { border-color: var(--border-strong); }
    .seg__btn.is-active {
      background: var(--primary); color: var(--on-primary); border-color: var(--primary);
    }

    .dup {
      margin: 1.5rem 0;
      padding: 1.1rem 1.25rem;
      background: color-mix(in srgb, #f59e0b 8%, var(--bg-card));
      border: 1px solid color-mix(in srgb, #f59e0b 35%, var(--border));
      border-radius: var(--radius-md);
    }
    .dup--loading {
      background: var(--bg-card);
      border-style: dashed;
      color: var(--text-muted);
      display: flex; align-items: center; gap: 0.6rem;
      font-size: 0.9rem;
    }
    .dup__head {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.95rem; margin-bottom: 0.85rem;
    }
    .dup__head [data-lucide] { width: 1.1rem; height: 1.1rem; color: #b45309; }
    .dup__list { display: flex; flex-direction: column; gap: 0.5rem; }
    .dup__item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.55rem 0.7rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: inherit; text-decoration: none;
      transition: border-color 0.15s;
    }
    .dup__item:hover { border-color: var(--primary); color: inherit; }
    .dup__img {
      width: 56px; height: 56px;
      border-radius: var(--radius-sm);
      object-fit: cover; flex-shrink: 0;
    }
    .dup__img--ph {
      background: var(--bg-subtle);
      color: var(--text-faint);
      display: flex; align-items: center; justify-content: center;
    }
    .dup__img--ph [data-lucide] { width: 1.2rem; height: 1.2rem; }
    .dup__body { display: flex; flex-direction: column; min-width: 0; }
    .dup__title {
      font-weight: 600; font-size: 0.92rem;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .dup__meta { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem; }
    .dup__actions { margin-top: 0.9rem; display: flex; gap: 0.6rem; }

    .form-error {
      margin: 1rem 0;
      padding: 0.7rem 0.9rem;
      background: var(--urgent-soft-bg);
      border: 1px solid var(--urgent-soft-border);
      border-radius: var(--radius-sm);
      color: var(--urgent);
      font-size: 0.9rem;
    }

    .actions { margin-top: 1.5rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.8rem 1.5rem;
      background: var(--primary); color: var(--on-primary);
      border: none; border-radius: var(--radius-sm);
      font: inherit; font-size: 0.95rem; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
    }
    .btn [data-lucide] { width: 1.05rem; height: 1.05rem; }
    .btn:hover:not(:disabled) { background: var(--primary-hover); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn--ghost {
      background: transparent; color: var(--primary);
      box-shadow: inset 0 0 0 1.5px var(--primary-soft-border);
    }
    .btn--ghost:hover:not(:disabled) {
      background: var(--primary-soft-bg);
      color: var(--primary-hover);
    }

    .spin { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ReportFormComponent implements AfterViewInit {
  kind = input.required<ReportKind>();

  private svc = inject(UrgentService);
  private router = inject(Router);

  cfg = computed(() => CONFIGS[this.kind()]);

  species = signal<Species>('dog');
  titleValue = signal('');
  city = signal('');
  description = signal('');
  phone = signal('');
  lat = signal<number | null>(null);
  lng = signal<number | null>(null);

  checkingDuplicates = signal(false);
  duplicates = signal<UrgentRequest[]>([]);
  forceNew = signal(false);
  submitting = signal(false);
  errorMsg = signal('');

  canSubmit = computed(() => {
    return !!this.titleValue().trim()
      && !!this.city().trim()
      && !!this.description().trim()
      && (this.duplicates().length === 0 || this.forceNew());
  });

  constructor() {
    setTimeout(() => createIcons({ icons }), 0);
  }

  ngAfterViewInit(): void {
    setTimeout(() => createIcons({ icons }), 0);
  }

  onPickLocation(e: { lat: number; lng: number }): void {
    this.lat.set(e.lat);
    this.lng.set(e.lng);
    this.reverseGeocode(e.lat, e.lng);
    this.runDuplicateCheck();
  }

  private reverseGeocode(lat: number, lng: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=sr`;
    fetch(url, { headers: { 'Accept': 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.address) return;
        const a = data.address;
        const city = a.city || a.town || a.village || a.municipality || a.county;
        // Don't clobber a value the user already typed.
        if (city && !this.city().trim()) this.city.set(city);
      })
      .catch(() => { /* offline or rate-limited — leave the field for the user */ });
  }

  onClearLocation(): void {
    this.lat.set(null);
    this.lng.set(null);
    this.duplicates.set([]);
    this.forceNew.set(false);
  }

  private runDuplicateCheck(): void {
    const lat = this.lat();
    const lng = this.lng();
    if (lat == null || lng == null) return;
    this.checkingDuplicates.set(true);
    this.forceNew.set(false);
    this.svc
      .list({
        type: this.cfg().type,
        species: this.species(),
        near_lat: lat,
        near_lng: lng,
        radius_m: 500,
        since_days: 7,
      })
      .subscribe({
        next: (rows) => {
          this.duplicates.set(rows.slice(0, 5));
          this.checkingDuplicates.set(false);
          setTimeout(() => createIcons({ icons }), 0);
        },
        error: () => {
          this.duplicates.set([]);
          this.checkingDuplicates.set(false);
        },
      });
  }

  onSubmit(): void {
    if (!this.canSubmit()) return;
    this.errorMsg.set('');
    this.submitting.set(true);
    this.svc
      .create({
        type: this.cfg().type,
        species: this.species(),
        title: this.titleValue().trim(),
        description: this.description().trim(),
        city: this.city().trim(),
        lat: this.lat() ?? undefined,
        lng: this.lng() ?? undefined,
        contact_phone: this.phone().trim() || undefined,
      })
      .subscribe({
        next: (created) => {
          const target = this.kind() === 'lost' ? '/izgubljeni' : '/pronadjeni';
          this.router.navigate([target], { queryParams: { posted: created.id } });
        },
        error: (err) => {
          this.submitting.set(false);
          const detail = err?.error?.detail;
          this.errorMsg.set(
            typeof detail === 'string' ? detail : 'Slanje nije uspelo. Pokušajte ponovo.',
          );
        },
      });
  }

  photoUrl(r: UrgentRequest): string | null {
    const u = r.photos?.[0]?.url;
    if (!u) return null;
    return u.startsWith('http') ? u : `${environment.apiUrl}${u}`;
  }

  relativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.round(diff / 3_600_000);
    if (h < 1) return 'upravo';
    if (h < 24) return `pre ${h}h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'juče' : `pre ${d} dana`;
  }
}
