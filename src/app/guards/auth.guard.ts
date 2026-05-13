import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AppwriteService } from '../services/appwrite.service';

export const authGuard: CanActivateFn = async () => {
  const appwrite = inject(AppwriteService);
  const router = inject(Router);

  try {
    const user = await appwrite.getAccount();
    return !!user; 
  } catch (e) {
    router.navigate(['/login']); 
    return false;
  }
};