import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

export const routes: Routes = [
  { path: '', component: LandingComponent },

  { path: 'login', component: LoginComponent },
  { path: 'login/user', component: LoginComponent },
  { path: 'login/volunteer', component: LoginComponent },
  { path: 'login/admin', component: LoginComponent },

  { path: 'register', component: RegisterComponent },

  // ✅ FIXED USER DASHBOARD
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
  },

  { path: '**', redirectTo: '' }
];
