import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stacks',
    loadComponent: () => import('./components/stacks/stacks.component').then(m => m.StacksComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stacks/:id',
    loadComponent: () => import('./components/stacks/stack-detail/stack-detail.component').then(m => m.StackDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'study/:id',
    loadComponent: () => import('./components/study/study.component').then(m => m.StudyComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stats',
    loadComponent: () => import('./components/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
