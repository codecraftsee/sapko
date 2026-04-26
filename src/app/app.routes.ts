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
