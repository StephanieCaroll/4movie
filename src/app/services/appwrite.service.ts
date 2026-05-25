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
    // Silenciar warnings específicos do Appwrite
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
    
    console.log('✅ Appwrite configurado com sucesso!');
    console.log('Endpoint:', this.client.config.endpoint);
    console.log('Project ID:', this.client.config.project);
  }

  async isLoggedIn(): Promise<boolean> {
    if (this.checkingSession) return false;
    this.checkingSession = true;
    
    try {
      const session = await this.account.get();
      console.log('✅ Usuário logado:', session.$id);
      return true;
    } catch (error: any) {
      if (error?.code === 401) {
        
        console.log('ℹ️ Usuário não autenticado (estado normal)');
      } else {
        console.error('Erro ao verificar login:', error);
      }
      return false;
    } finally {
      this.checkingSession = false;
    }
  }

  async createAccount(email: string, password: string, name: string) {
    try {
      console.log('📝 Criando conta para:', email);
      const user = await this.account.create(ID.unique(), email, password, name);
      console.log('✅ Conta criada com sucesso');
      return user;
    } catch (error: any) {
      console.error('❌ Erro ao criar conta:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      console.log('🔐 Tentando login:', email);
      console.log('Usando endpoint:', this.client.config.endpoint);
      
      const session = await this.account.createEmailPasswordSession(email, password);
      console.log('✅ Login realizado, session:', session.$id);
      
      // Aguarda um pouco para garantir que a sessão foi criada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se realmente logou
      const user = await this.account.get();
      console.log('✅ Usuário autenticado:', user.email);
      
      return session;
    } catch (error: any) {
      console.error('❌ Erro detalhado no login:', {
        code: error?.code,
        message: error?.message,
        type: error?.type
      });
      throw error;
    }
  }

  async getAccount() {
    try {
      return await this.account.get();
    } catch (error: any) {
      if (error?.code === 401) {
       
        console.log('ℹ️ Usuário não autenticado, retornando null');
        return null;
      }
      console.error('Erro ao obter conta:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.account.deleteSession('current');
      console.log('✅ Logout realizado com sucesso');
      return true;
    } catch (error: any) {
      if (error?.code !== 401) {
        console.error('Erro ao fazer logout:', error);
      }
      throw error;
    }
  }

  async updateProfileName(name: string) {
    try {
      return await this.account.updateName(name);
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      throw error;
    }
  }

  async updatePrefs(prefs: any) {
    try {
      return await this.account.updatePrefs(prefs);
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File) {
    try {
      return await this.storage.createFile(this.BUCKET_ID, ID.unique(), file);
    } catch (error) {
      console.error('Erro ao upload avatar:', error);
      throw error;
    }
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