# Šapko Frontend — Claude Instructions

## Tech Stack
- Angular 21 (standalone components, signals, new control flow `@if` / `@for`)
- TypeScript strict mode
- RxJS (via HttpClient)
- SCSS
- UI language: Serbian (Latin script)

## Start Dev Server
```bash
npm install
npm start   # ng serve on http://localhost:4200
```

Backend expected at `http://localhost:8000` (see `src/environments/environment.ts`).

## Structure
- `src/app/core/` — services, guards, interceptors, models (app-wide singletons)
- `src/app/features/` — feature pages: `home`, `auth`, `adoption`, `urgent`, `donors`, `account`
- `src/app/layout/` — chrome: navbar, footer
- `src/app/shared/` — reusable components (to add as needed)
- `src/environments/` — `environment.ts` (dev) and `environment.prod.ts`

## Routes (Serbian URL slugs)
| Path | Component |
|------|-----------|
| `/` | Home — hero + pillars |
| `/udomi` | Adoption listings |
| `/urgentno` | Urgent help board (all types, filterable) |
| `/donori` | Donor registry info + CTA |
| `/prijava` | Login |
| `/registracija` | Register |
| `/moj-nalog` | Account (guarded) |

## Conventions
- Standalone components only, `imports: [...]` in decorator
- Use signals for local component state, RxJS only at HTTP boundary
- Auth token stored in `localStorage` under `sapko.access` / `sapko.refresh`
- `authInterceptor` attaches the Bearer token to every HTTP request
- `authGuard` protects routes that require login

## Scripts
- `npm start` — dev server (`ng serve`)
- `npm test` — run tests (`ng test` via Vitest)
- `npm run build` — production build

---

## TypeScript Best Practices

- Use strict type checking (already enabled in tsconfig)
- Prefer type inference when the type is obvious
- Never use `any` — use `unknown` when type is uncertain
- Always define return types for public methods
- Use interfaces for data shapes, types for unions/aliases

---