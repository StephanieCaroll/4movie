import { Injectable, inject } from '@angular/core';
import { AppwriteService } from './appwrite.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private appwrite = inject(AppwriteService);
  private userData: any;

  setUser(data: any) {
    this.userData = data;
  }

  getUser() {
    return this.userData;
  }

  // Método necessário para o funcionamento do carrinho
  async getCurrentUser() {
    if (this.userData) return this.userData;
    try {
      const account = await this.appwrite.getAccount();
      this.userData = account;
      return account;
    } catch {
      return null;
    }
  }
}