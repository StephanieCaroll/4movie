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

  // Verifica se existe uma sessão ativa sem lançar erro no console
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.account.get();
      return true;
    } catch {
      return false;
    }
  }

  async createAccount(email: string, password: string, name: string) {
    return await this.account.create(ID.unique(), email, password, name);
  }

  async login(email: string, password: string) {
    return await this.account.createEmailPasswordSession(email, password);
  }

  async getAccount() {
    return await this.account.get();
  }

  async logout() {
    return await this.account.deleteSession('current');
  }
}