import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  {
    path: 'udomi',
    loadComponent: () => import('./features/adoption/adoption-list.component').then((m) => m.AdoptionListComponent),
  },
  {
    path: 'urgentno',
    loadComponent: () => import('./features/urgent/urgent-board.component').then((m) => m.UrgentBoardComponent),
  },
  {
    path: 'izgubljeno-nadjeno',
    title: 'Izgubljeno & Nađeno — Šapko',
    loadComponent: () => import('./features/reports/lost-found.component').then((m) => m.LostFoundComponent),
  },
  {
    path: 'izgubljeno-nadjeno/:id',
    loadComponent: () => import('./features/reports/report-detail.component').then((m) => m.ReportDetailComponent),
  },
  { path: 'izgubljeni', redirectTo: '/izgubljeno-nadjeno?tab=lost', pathMatch: 'full' },
  { path: 'pronadjeni', redirectTo: '/izgubljeno-nadjeno?tab=found', pathMatch: 'full' },
  {
    path: 'prijavi',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/report-hub.component').then((m) => m.ReportHubComponent),
  },
  {
    path: 'prijavi/izgubljen',
    canActivate: [authGuard],
    data: { kind: 'lost' },
    loadComponent: () => import('./features/reports/report-form.component').then((m) => m.ReportFormComponent),
  },
  {
    path: 'prijavi/pronadjen',
    canActivate: [authGuard],
    data: { kind: 'found' },
    loadComponent: () => import('./features/reports/report-form.component').then((m) => m.ReportFormComponent),
  },
  {
    path: 'prijavi/udomi',
    redirectTo: 'moj-nalog',
  },
  {
    path: 'donori',
    loadComponent: () => import('./features/donors/donors-info.component').then((m) => m.DonorsInfoComponent),
  },
  {
    path: 'kako-radi',
    loadComponent: () => import('./features/how-it-works/how-it-works.component').then((m) => m.HowItWorksComponent),
  },
  {
    path: 'prijava',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registracija',
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'moj-nalog',
    canActivate: [authGuard],
    loadComponent: () => import('./features/account/account.component').then((m) => m.AccountComponent),
  },
  { path: '**', redirectTo: '' },
];
