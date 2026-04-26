import { Component, Input } from '@angular/core';

/**
 * Šapko brand logo — match-uje "Sapko Landing.html" mock 1:1.
 *
 * Default = wordmark sa SVG paw-mark (umesto slova "Š") + tekst "apko" u text boji.
 * SVG koristi --primary boju, automatski prati dog/cat theme.
 *
 * Variants:
 *   'wordmark'  — paw-Š + "apko" tekst (default; za nav/footer)
 *   'paw'       — samo paw print mark (za favicon, mali avatar)
 *   'monogram'  — Š u zaobljenom kvadratu (alt favicon)
 *
 * Use:
 *   <app-sapko-logo />
 *   <app-sapko-logo variant="paw" size="1.6rem" />
 */
@Component({
  selector: 'app-sapko-logo',
  standalone: true,
  template: `
    @switch (variant) {
      @case ('paw') {
        <svg
          [style.width]="size"
          [style.height]="size"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="sapko-paw"
        >
          <ellipse cx="50" cy="68" rx="22" ry="18" fill="currentColor" />
          <ellipse cx="22" cy="48" rx="9"  ry="11" fill="currentColor" />
          <ellipse cx="40" cy="32" rx="8.5" ry="11" fill="currentColor" />
          <ellipse cx="60" cy="32" rx="8.5" ry="11" fill="currentColor" />
          <ellipse cx="78" cy="48" rx="9"  ry="11" fill="currentColor" />
        </svg>
      }
      @case ('monogram') {
        <svg
          [style.width]="size"
          [style.height]="size"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="sapko-paw"
        >
          <rect x="6" y="6" width="88" height="88" rx="22" fill="currentColor" />
          <text x="50" y="68" text-anchor="middle"
            font-family="Inter, sans-serif"
            font-weight="800" font-size="56"
            fill="#FBF6EE" letter-spacing="-2"
          >Š</text>
        </svg>
      }
      @default {
        <span class="sapko-wordmark" [style.font-size]="size" aria-label="Šapko">
          <svg
            class="sapko-wordmark__mark"
            viewBox="0 0 100 140"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <g transform="translate(28, 6) scale(0.18)">
              <ellipse cx="50" cy="68" rx="22" ry="18" fill="currentColor"/>
              <ellipse cx="22" cy="48" rx="9"  ry="11" fill="currentColor"/>
              <ellipse cx="40" cy="32" rx="8.5" ry="11" fill="currentColor"/>
              <ellipse cx="60" cy="32" rx="8.5" ry="11" fill="currentColor"/>
              <ellipse cx="78" cy="48" rx="9"  ry="11" fill="currentColor"/>
            </g>
            <g transform="translate(56, 6) scale(0.18)">
              <ellipse cx="50" cy="68" rx="22" ry="18" fill="currentColor"/>
              <ellipse cx="22" cy="48" rx="9"  ry="11" fill="currentColor"/>
              <ellipse cx="40" cy="32" rx="8.5" ry="11" fill="currentColor"/>
              <ellipse cx="60" cy="32" rx="8.5" ry="11" fill="currentColor"/>
              <ellipse cx="78" cy="48" rx="9"  ry="11" fill="currentColor"/>
            </g>
            <path d="M 78 58 C 78 44, 65 38, 50 38 C 35 38, 24 44, 24 56 C 24 66, 32 70, 50 74 C 70 78, 80 84, 80 98 C 80 112, 66 120, 50 120 C 32 120, 22 112, 22 98"
                  fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round"/>
          </svg>
          <span class="sapko-wordmark__text">apko</span>
        </span>
      }
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      line-height: 1;
      color: var(--primary, var(--color-primary));
    }

    /* Wordmark: paw-mark stands in for "Š" + plain "apko" text */
    .sapko-wordmark {
      display: inline-flex;
      align-items: flex-end;
      gap: 2px;
      font-family: 'Inter', -apple-system, sans-serif;
      letter-spacing: -0.02em;
      font-weight: 800;
      line-height: 1;
    }
    .sapko-wordmark__mark {
      width: calc(1em * 70 / 92);
      height: auto;
      display: block;
      color: var(--primary, var(--color-primary));
      transition: color 0.3s ease, transform 0.25s ease;
    }
    .sapko-wordmark__text {
      font-weight: 800;
      letter-spacing: -0.05em;
      line-height: 1;
      margin-left: -2px;
      color: var(--text, var(--color-text));
      font-size: 1em;
    }

    /* Footer (dark-bg) override — use :host-context */
    :host-context(.foot-brand) .sapko-wordmark__text { color: #fff; }
    :host-context(.foot-brand) .sapko-wordmark__mark { filter: brightness(1.05); }

    /* Hover */
    :host-context(a:hover) .sapko-wordmark__mark,
    :host(:hover) .sapko-wordmark__mark { transform: scale(1.06); }

    /* Single-mark variants */
    svg.sapko-paw {
      display: block;
      transition: transform 0.25s ease;
    }
    :host-context(a:hover) svg.sapko-paw,
    :host(:hover) svg.sapko-paw { transform: scale(1.08); }
  `],
})
export class SapkoLogoComponent {
  /** Default 'wordmark' = paw-mark + "apko" text (match mock). */
  @Input() variant: 'wordmark' | 'paw' | 'monogram' = 'wordmark';
  /** For wordmark: behaves as font-size. For paw/monogram: width+height. Default '2rem' (mock value). */
  @Input() size: string = '2rem';
}
