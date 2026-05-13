import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const appwrite = inject(AppwriteService);
  const router = inject(Router);

  try {
    const loggedIn = await appwrite.isLoggedIn();

    // Se o usuário tentar acessar login/signup estando logado, manda para o perfil
    if (state.url === '/login' || state.url === '/sign-up') {
      if (loggedIn) {
        router.navigate(['/profile']);
        return false;
      }
      return true;
    }

    // Para qualquer outra rota protegida, verifica se está logado
    if (!loggedIn) {
      router.navigate(['/login']);
      return false;
    }

    return true;
    
  } catch (error) {
    console.error('Erro no authGuard:', error);
    // Em caso de erro, redireciona para login por segurança
    router.navigate(['/login']);
    return false;
  }
};