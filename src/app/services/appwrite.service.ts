import { Injectable } from '@angular/core';
import { Client, Account, ID, Databases, Storage } from 'appwrite';

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  client = new Client();
  account: Account;
  databases: Databases; 
  storage: Storage;
  private checkingSession = false;
  private readonly BUCKET_ID = '6a0e532700349b2c726e'; 

  constructor() {
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
    this.databases = new Databases(this.client); 
    this.storage = new Storage(this.client); 
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

  async updateProfileName(name: string) {
    return await this.account.updateName(name);
  }

  async updatePrefs(prefs: any) {
    return await this.account.updatePrefs(prefs);
  }

  async uploadAvatar(file: File) {
   
    return await this.storage.createFile(this.BUCKET_ID, ID.unique(), file);
  }

 getAvatarUrl(fileId: string): string {
    if (!fileId || fileId === 'undefined') {
      return 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }

    try {
      
      const view = this.storage.getFileView(this.BUCKET_ID, fileId);
      return view.toString();
    } catch (error) {
      console.error('Erro ao gerar URL da imagem', error);
      return 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }
  }
}