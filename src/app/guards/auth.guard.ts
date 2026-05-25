import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const appwrite = inject(AppwriteService);
  const router = inject(Router);

  try {
    const loggedIn = await appwrite.isLoggedIn();
    console.log('AuthGuard - Logado:', loggedIn, 'Rota:', state.url);

    // Se estiver tentando acessar login ou sign-up
    if (state.url === '/login' || state.url === '/sign-up') {
      if (loggedIn) {
        console.log('Usuário já logado, redirecionando para profile');
        router.navigate(['/profile']);
        return false;
      }
      console.log('Permitindo acesso à página de login');
      return true;
    }

    if (!loggedIn) {
      console.log('Usuário não logado, redirecionando para login');
      router.navigate(['/login']);
      return false;
    }

    console.log('Acesso permitido à rota protegida');
    return true;
    
  } catch (error) {
    console.error('Erro no authGuard:', error);
    router.navigate(['/login']);
    return false;
  }
};