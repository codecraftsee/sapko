import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UrgentService } from '../../core/services/urgent.service';
import { AuthService } from '../../core/services/auth.service';
import { MatchSuggestion, UrgentRequest } from '../../core/models/api.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-report-detail',
  imports: [RouterLink],
  template: `
    <section class="page-header" [class.is-lost]="report()?.type === 'lost_pet'" [class.is-found]="report()?.type === 'injured_stray'">
      <div class="container">
        <a routerLink="/izgubljeno-nadjeno" class="back-link">
          <i class="ph ph-arrow-left"></i> Nazad na listu
        </a>
        @if (loading()) {
          <p class="muted">Učitavanje…</p>
        } @else if (!report()) {
          <p class="muted">Oglas nije pronađen.</p>
        } @else {
          <span class="eyebrow">
            @switch (report()!.type) {
              @case ('lost_pet')      { <i class="ph-fill ph-magnifying-glass"></i> Izgubljen }
              @case ('injured_stray') { <i class="ph-fill ph-paw-print"></i> Pronađen }
              @default                { Oglas }
            }
            · {{ report()!.status === 'resolved' ? 'Spojen' : 'Otvoren' }}
          </span>
          <h1>{{ report()!.title }}</h1>
          <p class="lead">{{ report()!.description }}</p>
          <p class="meta">
            <i class="ph ph-map-pin"></i> {{ report()!.city }}
            @if (report()!.lat != null && report()!.lng != null) {
              · {{ report()!.lat!.toFixed(4) }}, {{ report()!.lng!.toFixed(4) }}
            }
            <span class="dot"></span>
            {{ relativeTime(report()!.created_at) }}
          </p>
        }
      </div>
    </section>

    @if (report() && report()!.status !== 'resolved') {
      <section class="block">
        <div class="container container--narrow">
          <h2 class="section-title">
            <i class="ph-fill ph-sparkle"></i> Moguća poklapanja
          </h2>

          @if (matchesLoading()) {
            <p class="muted">Tražimo poklapanja…</p>
          } @else if (matches().length === 0) {
            <p class="muted">
              Nema poklapanja u radijusu od 5 km u poslednje 2 nedelje.
              @if (report()!.lat == null) {
                <br><strong>Savet:</strong> dodajte lokaciju na mapi pri prijavi — bez nje algoritam ne može da uporedi oglase.
              }
            </p>
          } @else {
            <div class="match-list">
              @for (m of matches(); track m.id) {
                <article class="match-card" [class.is-acting]="acting() === m.id">
                  <a [routerLink]="['/izgubljeno-nadjeno', m.other!.id]" class="match-card__media">
                    @if (otherPhotoUrl(m); as src) {
                      <img [src]="src" [alt]="m.other!.title" />
                    } @else {
                      <i class="ph ph-image"></i>
                    }
                  </a>
                  <div class="match-card__body">
                    <div class="match-card__head">
                      <a [routerLink]="['/izgubljeno-nadjeno', m.other!.id]" class="match-card__title">{{ m.other!.title }}</a>
                      <span class="match-card__score">poklapanje {{ (m.score * 100).toFixed(0) }}%</span>
                    </div>
                    <p class="match-card__meta">
                      <i class="ph ph-map-pin"></i> {{ m.other!.city }}
                      <span class="dot"></span>
                      {{ relativeTime(m.other!.created_at) }}
                    </p>
                    <p class="match-card__desc">{{ m.other!.description }}</p>

                    @if (!isLoggedIn()) {
                      <p class="hint">
                        <a routerLink="/prijava">Prijavite se</a> da biste potvrdili ili odbacili poklapanje.
                      </p>
                    } @else {
                      <div class="match-card__actions">
                        <button type="button" class="btn btn--confirm" (click)="confirm(m)" [disabled]="!!acting()">
                          <i class="ph ph-check"></i> Ovo je moj ljubimac
                        </button>
                        <button type="button" class="btn btn--reject" (click)="reject(m)" [disabled]="!!acting()">
                          Nije
                        </button>
                      </div>
                    }
                  </div>
                </article>
              }
            </div>
          }

          @if (errorMsg()) {
            <p class="form-error">{{ errorMsg() }}</p>
          }
        </div>
      </section>
    }

    @if (report()?.status === 'resolved') {
      <section class="block">
        <div class="container container--narrow">
          <div class="resolved-banner">
            <i class="ph-fill ph-heart-straight"></i>
            <div>
              <h3>Oglas je rešen</h3>
              <p>Ljubimac je spojen sa vlasnikom. Hvala što ste pomogli.</p>
            </div>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    :host { display: block; }
    .container { max-width: 1180px; margin: 0 auto; padding: 0 1.5rem; }
    .container--narrow { max-width: 760px; }
    section.block { padding: 2.5rem 0 4rem; }
    .muted { color: var(--text-muted); }

    .page-header {
      padding: 2.5rem 1.5rem 2rem;
      border-bottom: 1px solid var(--border);
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 14%, transparent) 0%, transparent 60%),
        var(--bg-base);
    }
    .page-header.is-lost {
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--lost) 14%, transparent) 0%, transparent 60%),
        var(--bg-base);
    }
    .page-header.is-found {
      background:
        radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--found) 14%, transparent) 0%, transparent 60%),
        var(--bg-base);
    }
    .page-header h1 {
      font-size: clamp(1.6rem, 3vw, 2.2rem);
      margin: 0.6rem 0 0.5rem;
      letter-spacing: -0.025em;
      text-wrap: balance;
    }
    .page-header .lead {
      margin: 0 0 0.8rem; color: var(--text-muted);
      font-size: 1rem; max-width: 640px;
    }
    .page-header .meta {
      margin: 0; font-size: 0.85rem; color: var(--text-muted);
      display: inline-flex; align-items: center; gap: 0.35rem;
    }
    .page-header .meta [class*="ph"] { font-size: 0.95rem; }
    .meta .dot { width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: 0.5; margin: 0 0.3rem; }

    .back-link {
      display: inline-flex; align-items: center; gap: 0.35rem;
      color: var(--text-muted); font-size: 0.85rem; font-weight: 500;
      text-decoration: none;
      margin-bottom: 0.8rem;
    }
    .back-link:hover { color: var(--text); }

    .eyebrow {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.3rem 0.8rem;
      background: rgba(255,255,255,0.7);
      color: var(--text);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-pill);
      font-size: 0.72rem; font-weight: 700;
      letter-spacing: 0.1em; text-transform: uppercase;
    }
    .eyebrow [class*="ph"] { font-size: 0.9rem; }

    .section-title {
      font-size: 1.2rem;
      letter-spacing: -0.015em;
      display: inline-flex; align-items: center; gap: 0.45rem;
      margin: 0 0 1.25rem;
    }
    .section-title [class*="ph"] { color: var(--primary); }

    .match-list { display: flex; flex-direction: column; gap: 0.9rem; }
    .match-card {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: opacity 0.2s;
    }
    .match-card.is-acting { opacity: 0.55; }
    .match-card__media {
      background: var(--bg-subtle);
      display: flex; align-items: center; justify-content: center;
      color: var(--text-faint);
      text-decoration: none;
    }
    .match-card__media img { width: 100%; height: 100%; object-fit: cover; }
    .match-card__media [class*="ph"] { font-size: 1.8rem; }
    .match-card__body { padding: 0.95rem 1.1rem 1.1rem; display: flex; flex-direction: column; gap: 0.45rem; }
    .match-card__head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.8rem; flex-wrap: wrap; }
    .match-card__title {
      font-size: 1rem; font-weight: 600; letter-spacing: -0.015em;
      color: var(--text); text-decoration: none;
    }
    .match-card__title:hover { color: var(--primary); }
    .match-card__score {
      font-size: 0.72rem; font-weight: 700;
      color: var(--primary-hover);
      background: var(--primary-soft-bg);
      border: 1px solid var(--primary-soft-border);
      padding: 0.18rem 0.55rem;
      border-radius: var(--radius-pill);
      letter-spacing: 0.04em;
      white-space: nowrap;
    }
    .match-card__meta {
      margin: 0; color: var(--text-muted); font-size: 0.82rem;
      display: inline-flex; align-items: center; gap: 0.3rem;
    }
    .match-card__meta [class*="ph"] { font-size: 0.9rem; }
    .match-card__desc {
      margin: 0; color: var(--text-muted); font-size: 0.88rem;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
      line-height: 1.5;
    }
    .match-card__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.35rem; }
    .hint { margin: 0.3rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
    .hint a { color: var(--primary); font-weight: 600; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.5rem 1rem;
      background: var(--bg-base);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      font: inherit; font-size: 0.85rem; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn--confirm {
      background: var(--found);
      color: #fff;
      border-color: var(--found);
    }
    .btn--confirm:hover:not(:disabled) { background: var(--found-hover); border-color: var(--found-hover); }
    .btn--reject:hover:not(:disabled) { border-color: var(--text-muted); color: var(--text); }

    .form-error {
      margin: 1rem 0 0;
      padding: 0.65rem 0.9rem;
      background: var(--urgent-soft-bg);
      border: 1px solid var(--urgent-soft-border);
      border-radius: var(--radius-sm);
      color: var(--urgent);
      font-size: 0.88rem;
    }

    .resolved-banner {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.5rem 1.75rem;
      background: var(--found-soft-bg);
      border: 1px solid var(--found-soft-border);
      border-radius: var(--radius-lg);
    }
    .resolved-banner [class*="ph"] { font-size: 2.2rem; color: var(--found); flex-shrink: 0; }
    .resolved-banner h3 { margin: 0 0 0.2rem; font-size: 1.1rem; color: var(--text); }
    .resolved-banner p { margin: 0; color: var(--text-muted); font-size: 0.92rem; }

    @media (max-width: 560px) {
      .match-card { grid-template-columns: 1fr; }
      .match-card__media { height: 160px; }
    }
  `],
})
export class ReportDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(UrgentService);
  private auth = inject(AuthService);

  reportId = signal<string>('');
  report = signal<UrgentRequest | null>(null);
  loading = signal(true);

  matches = signal<MatchSuggestion[]>([]);
  matchesLoading = signal(false);

  acting = signal<string | null>(null);
  errorMsg = signal('');

  isLoggedIn = computed(() => this.auth.isLoggedIn());

  ngOnInit(): void {
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id') ?? '';
      this.reportId.set(id);
      this.loadAll(id);
    });
  }

  private loadAll(id: string): void {
    this.loading.set(true);
    this.svc.get(id).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
        if (r.status !== 'resolved' && (r.type === 'lost_pet' || r.type === 'injured_stray')) {
          this.loadMatches(id);
        }
      },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
      },
    });
  }

  private loadMatches(id: string): void {
    this.matchesLoading.set(true);
    this.svc.potentialMatches(id).subscribe({
      next: (rows) => {
        this.matches.set(rows);
        this.matchesLoading.set(false);
      },
      error: () => {
        this.matches.set([]);
        this.matchesLoading.set(false);
      },
    });
  }

  confirm(m: MatchSuggestion): void {
    this.errorMsg.set('');
    this.acting.set(m.id);
    this.svc.confirmMatch(m.id).subscribe({
      next: () => {
        this.acting.set(null);
        this.loadAll(this.reportId());
      },
      error: (err) => {
        this.acting.set(null);
        const detail = err?.error?.detail;
        this.errorMsg.set(typeof detail === 'string' ? detail : 'Slanje nije uspelo. Pokušajte ponovo.');
      },
    });
  }

  reject(m: MatchSuggestion): void {
    this.errorMsg.set('');
    this.acting.set(m.id);
    this.svc.rejectMatch(m.id).subscribe({
      next: () => {
        this.acting.set(null);
        this.matches.update(arr => arr.filter(x => x.id !== m.id));
      },
      error: (err) => {
        this.acting.set(null);
        const detail = err?.error?.detail;
        this.errorMsg.set(typeof detail === 'string' ? detail : 'Slanje nije uspelo. Pokušajte ponovo.');
      },
    });
  }

  otherPhotoUrl(m: MatchSuggestion): string | null {
    const u = m.other?.photos?.[0]?.url;
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
