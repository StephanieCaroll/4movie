import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Caminho vazio (raiz do app)
    path: '',
    // Redireciona para a página home
    redirectTo: 'home',
    // Só redireciona se o caminho for exatamente vazio
    pathMatch: 'full',
  },
  {
    // Quando acessar /home
    path: 'home',
    // Carrega a página Home 
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    // Quando acessar /details/algum-id (ex: /details/550)
    // O :id é um parâmetro dinâmico que muda conforme o filme
    path: 'details/:id',
    // Carrega a página de detalhes
    loadComponent: () => import('./pages/details/details.page').then((m) => m.DetailsPage),
  },
  {path: 'profile', loadComponent: () => import('./pages/Profile/profile.page').then(m => m.ProfilePage)},
  {path: 'categories', loadComponent: () => import('./pages/categories/categories.page').then(m => m.CategoriesPage)},
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'sign-up', loadComponent: () => import('./pages/sign-up/sign-up.page').then(m => m.SignUpPage) }

];