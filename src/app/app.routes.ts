import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
  {
    path: 'profile',
    loadComponent: () => import('./pages/Profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [authGuard] // O Guard agora protege o Login contra quem já está logado
  },
  { path: 'sign-up', loadComponent: () => import('./pages/sign-up/sign-up.page').then(m => m.SignUpPage) },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories.page').then(m => m.CategoriesPage) },
  { path: 'details/:id', loadComponent: () => import('./pages/details/details.page').then(m => m.DetailsPage) },
  { path: 'cart', loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage) },
];