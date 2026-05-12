import { Injectable } from '@angular/core';
import { Client, Account, ID } from 'appwrite';

@Injectable({
  providedIn: 'root'
})
export class AppwriteService {
  client = new Client();
  account: Account;

  constructor() {
    // REGIÃO: Nova York (NYC)
    this.client
      .setEndpoint('https://nyc.cloud.appwrite.io/v1')
      .setProject('6a0283be001b53538516'); 
    
    this.account = new Account(this.client);
    
    // Verificação
    console.log('✅ Appwrite Service Configurado:', {
      endpoint: 'https://nyc.cloud.appwrite.io/v1',
      projectId: '6a0283be001b53538516'
    });
  }

  async createAccount(email: string, password: string, name: string) {
    try {
      const response = await this.account.create(
        ID.unique(), 
        email, 
        password, 
        name
      );
      console.log('✅ Conta criada:', response);
      return response;
    } catch (error) {
      console.error('❌ Erro Appwrite:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  }
}