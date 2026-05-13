import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const appwrite = inject(AppwriteService);
  const router = inject(Router);

  const loggedIn = await appwrite.isLoggedIn();

  // Se o usuário tentar acessar login estando logado, manda para o perfil
  if (state.url === '/login' || state.url === '/sign-up') {
    if (loggedIn) {
      router.navigate(['/profile']);
      return false;
    }
    return true;
  }

  // Se não estiver logado e tentar acessar perfil, manda para o login
  if (!loggedIn) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};