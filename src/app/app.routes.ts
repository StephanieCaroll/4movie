// Importa o tipo de dados para rotas do Angular
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
  {
  path: 'profile',
  loadComponent: () => import('./pages/Profile/profile.page').then(m => m.ProfilePage)
  }
];