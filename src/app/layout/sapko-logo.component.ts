import { Component, Input } from '@angular/core';

/**
 * Šapko brand logo — SVG mark koji koristi --color-primary varijablu
 * iz styles.scss, tako da automatski radi sa oba theme-a (dog/cat).
 *
 * Variants:
 *   'paw'      — minimalistički otisak šapice (default; čisto, kao paw-print)
 *   'heartpaw' — srce + 3 šapice (toplije, više emotivno; za marketing/footer)
 *   'monogram' — Š u zaobljenom kvadratu (strogi mark; za favicon/avatar)
 *
 * Use:
 *   <app-sapko-logo />                       // default 'paw', 1.2rem
 *   <app-sapko-logo variant="heartpaw" />
 *   <app-sapko-logo variant="monogram" size="2rem" />
 */
@Component({
  selector: 'app-sapko-logo',
  standalone: true,
  template: `
    @switch (variant) {
      @case ('heartpaw') {
        <svg
          [style.width]="size"
          [style.height]="size"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="sapko-logo"
        >
          <path
            d="M50,82 C26,68 14,52 18,38 C21,28 32,24 40,30 C44,33 47,38 50,44 C53,38 56,33 60,30 C68,24 79,28 82,38 C86,52 74,68 50,82 Z"
            fill="currentColor"
          />
          <ellipse cx="34" cy="22" rx="6" ry="8" fill="currentColor" />
          <ellipse cx="50" cy="16" rx="6" ry="8" fill="currentColor" />
          <ellipse cx="66" cy="22" rx="6" ry="8" fill="currentColor" />
        </svg>
      }
      @case ('monogram') {
        <svg
          [style.width]="size"
          [style.height]="size"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="sapko-logo"
        >
          <rect x="6" y="6" width="88" height="88" rx="22" fill="currentColor" />
          <text
            x="50"
            y="68"
            text-anchor="middle"
            font-family="var(--font-display, 'Playfair Display', Georgia, serif)"
            font-weight="800"
            font-size="56"
            fill="var(--color-surface, #FEFAF5)"
            letter-spacing="-2"
          >Š</text>
        </svg>
      }
      @default {
        <svg
          [style.width]="size"
          [style.height]="size"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="sapko-logo"
        >
          <ellipse cx="50" cy="68" rx="22" ry="18" fill="currentColor" />
          <ellipse cx="22" cy="48" rx="9"  ry="11" fill="currentColor" />
          <ellipse cx="40" cy="32" rx="8.5" ry="11" fill="currentColor" />
          <ellipse cx="60" cy="32" rx="8.5" ry="11" fill="currentColor" />
          <ellipse cx="78" cy="48" rx="9"  ry="11" fill="currentColor" />
        </svg>
      }
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);
      line-height: 0;
    }
    .sapko-logo {
      display: block;
      transition: transform 0.25s ease;
    }
    :host-context(a:hover) .sapko-logo,
    :host(:hover) .sapko-logo {
      transform: scale(1.08);
    }
  `],
})
export class SapkoLogoComponent {
  /** Logo varijanta. Default: 'paw'. */
  @Input() variant: 'paw' | 'heartpaw' | 'monogram' = 'paw';
  /** Veličina (CSS unit). Default: '1.2rem' — odgovara postojećoj .brand-icon. */
  @Input() size: string = '1.2rem';
}
