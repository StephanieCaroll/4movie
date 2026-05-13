import { Injectable } from '@angular/core';
import { Client, Account, ID } from 'appwrite';

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  client = new Client();
  account: Account;
  private checkingSession = false;

  constructor() {
    // Suprime aviso do localStorage
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.('localStorage') || args[0]?.includes?.('custom domain')) {
        return;
      }
      originalConsoleWarn.apply(console, args);
    };

    this.client
      .setEndpoint('https://nyc.cloud.appwrite.io/v1')
      .setProject('6a0283be001b53538516');
    
    this.account = new Account(this.client);
  }

 async isLoggedIn(): Promise<boolean> {
  if (this.checkingSession) return false;
  this.checkingSession = true;
  
  try {
    const session = await this.account.get();
    return !!session;
  } catch (error) {
   
    return false;
  } finally {
    this.checkingSession = false;
  }
}
  async createAccount(email: string, password: string, name: string) {
    try {
      return await this.account.create(ID.unique(), email, password, name);
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async getAccount() {
    try {
      return await this.account.get();
    } catch (error: any) {
      if (error?.code !== 401) {
        console.error('Erro ao obter conta:', error);
      }
      throw error;
    }
  }

  async logout() {
    try {
      return await this.account.deleteSession('current');
    } catch (error: any) {
      if (error?.code !== 401) {
        console.error('Erro ao fazer logout:', error);
      }
      throw error;
    }
  }
}