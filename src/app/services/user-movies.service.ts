import { Injectable, signal, computed, inject } from '@angular/core';
import { AppwriteService } from './appwrite.service';
import { UserService } from './user.service';
import { ID, Query, Permission, Role } from 'appwrite';
import { ToastController } from '@ionic/angular';

export interface UserMovie {
  $id?: string;
  userId: string;
  movieId: number;
  title: string;
  posterPath: string;
  type: 'rent' | 'buy';
  purchaseDate: string;
  expiresAt?: string; 
  price: number;
  rentalDays?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserMoviesService {
  private appwrite = inject(AppwriteService);
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);
  
  private readonly DB_ID = '6a04e0420022f3b7ac95';
  private readonly COLLECTION_ID = 'user_movies'; 
  
  private userMoviesSignal = signal<UserMovie[]>([]);
  public movies = computed(() => this.userMoviesSignal());
  
  public purchasedMovies = computed(() => this.userMoviesSignal().filter(m => m.type === 'buy'));
  public rentedMovies = computed(() => this.userMoviesSignal().filter(m => m.type === 'rent'));

  constructor() {
    this.loadUserMovies();
  }

  async loadUserMovies() {
    try {
      const user = await this.userService.getCurrentUser();
      if (!user) {
        console.log('Usuário não logado, não é possível carregar filmes');
        this.userMoviesSignal.set([]);
        return;
      }

      // Verifica se a coleção existe antes de tentar listar
      try {
        const response = await this.appwrite.databases.listDocuments(
          this.DB_ID,
          this.COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        
        this.userMoviesSignal.set(response.documents as unknown as UserMovie[]);
        await this.removeExpiredRentals();
      } catch (error: any) {
        if (error?.code === 404) {
          console.error(`Coleção '${this.COLLECTION_ID}' não encontrada. Por favor, crie ela no dashboard do Appwrite.`);
          this.showToast('Erro de configuração: Contate o suporte', 'toast-danger');
          this.userMoviesSignal.set([]);
        } else if (error?.code === 401) {
          console.error('Permissão negada ao acessar coleção de filmes');
          this.userMoviesSignal.set([]);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('ERRO CRÍTICO AO CARREGAR FILMES:', error.message);
      this.userMoviesSignal.set([]);
    }
  }

  public canTransact(movieId: number): boolean {
    const movies = this.userMoviesSignal();
    if (!movies || movies.length === 0) return true;
    
    const movie = movies.find(m => m.movieId === movieId);
    if (!movie) return true;
    
    if (movie.type === 'buy') return false;
    
    if (movie.type === 'rent' && movie.expiresAt) {
      const now = new Date();
      const expires = new Date(movie.expiresAt);
      return now > expires;
    }
    
    return true;
  }

  async addMovie(movie: any, type: 'rent' | 'buy', price: number, days?: number) {
    try {
      const user = await this.userService.getCurrentUser();
      if (!user) throw new Error('Usuário não logado');

      const now = new Date();
      
      // Criando objeto limpo para evitar erro de atributo inexistente
      const payload: any = {
        userId: String(user.$id),
        movieId: Number(movie.id),
        title: String(movie.title),
        posterPath: String(movie.poster_path || ''),
        type: String(type),
        purchaseDate: now.toISOString(),
        price: Number(price)
      };

      if (type === 'rent' && days) {
        const expires = new Date(now);
        expires.setDate(expires.getDate() + days);
        payload.expiresAt = expires.toISOString();
        payload.rentalDays = Number(days);
      }

      // Tenta remover se já existir (para atualizar aluguel)
      const existing = this.userMoviesSignal().find(m => m.movieId === movie.id);
      if (existing?.$id) {
        await this.appwrite.databases.deleteDocument(this.DB_ID, this.COLLECTION_ID, existing.$id);
      }

      // Configura permissões do documento
      const permissions = [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id))
      ];

      const doc = await this.appwrite.databases.createDocument(
        this.DB_ID,
        this.COLLECTION_ID,
        ID.unique(),
        payload,
        permissions
      );
      
      this.userMoviesSignal.update(list => [...list.filter(m => m.movieId !== movie.id), doc as unknown as UserMovie]);
      this.showToast(`${movie.title} adicionado à sua biblioteca!`, 'toast-success');
      return true;

    } catch (error: any) {
      console.error('FALHA AO SALVAR NO APPWRITE:', error);
      
      if (error?.code === 404) {
        this.showToast('Erro: Coleção não configurada. Contate o suporte.', 'toast-danger');
      } else if (error?.code === 401) {
        this.showToast('Erro de permissão. Faça login novamente.', 'toast-danger');
      } else {
        this.showToast(`Erro: ${error.message || 'Falha ao adicionar filme'}`, 'toast-danger');
      }
      return false;
    }
  }

  async removeExpiredRentals() {
    const now = new Date();
    const expired = this.userMoviesSignal().filter(m => 
      m.type === 'rent' && 
      m.expiresAt && 
      new Date(m.expiresAt) < now
    );
    
    for (const movie of expired) {
      if (movie.$id) {
        try {
          await this.appwrite.databases.deleteDocument(this.DB_ID, this.COLLECTION_ID, movie.$id);
          this.userMoviesSignal.update(list => list.filter(item => item.$id !== movie.$id));
          console.log(`Aluguel expirado removido: ${movie.title}`);
        } catch (error) {
          console.error(`Erro ao remover filme expirado ${movie.title}:`, error);
        }
      }
    }
    
    if (expired.length > 0) {
      this.showToast(`${expired.length} aluguel(is) expirado(s) removido(s)`, 'toast-info');
    }
  }

  getRemainingTimeDisplay(expiresAt: string): string {
    if (!expiresAt) return '';
    
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  async refreshUserMovies() {
    await this.loadUserMovies();
  }

  private async showToast(message: string, cssClass: string) {
    const toast = await this.toastCtrl.create({ 
      message, 
      duration: 2000, 
      cssClass: `custom-toast ${cssClass}`,
      position: 'bottom'
    });
    await toast.present();
  }
}