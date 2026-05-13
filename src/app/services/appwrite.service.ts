import { Injectable } from '@angular/core';
import { Client, Account, ID } from 'appwrite';

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  client = new Client();
  account: Account;

  constructor() {
    this.client
      .setEndpoint('https://nyc.cloud.appwrite.io/v1')
      .setProject('6a0283be001b53538516'); 
    
    this.account = new Account(this.client);
  }

  // Criar conta (Sign Up)
  async createAccount(email: string, password: string, name: string) {
    return await this.account.create(ID.unique(), email, password, name);
  }

  // Criar sessão (Login)
  async login(email: string, password: string) {
    return await this.account.createEmailPasswordSession(email, password);
  }

  // Obter dados do usuário logado
  async getAccount() {
    return await this.account.get();
  }

  // Encerrar sessão (Logout)
  async logout() {
    // 'current' deleta a sessão ativa neste dispositivo
    return await this.account.deleteSession('current');
  }
}