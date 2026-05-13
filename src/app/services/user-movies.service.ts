import { Injectable, signal, computed, inject } from '@angular/core';
import { AppwriteService } from './appwrite.service';
import { UserService } from './user.service';
import { ID, Query } from 'appwrite';
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
  public purchasedMovies = computed(() => 
    this.userMoviesSignal().filter(movie => movie.type === 'buy')
  );
  public rentedMovies = computed(() => 
    this.userMoviesSignal().filter(movie => movie.type === 'rent')
  );

  constructor() {
    this.loadUserMovies();
  }

  async loadUserMovies() {
    const user = await this.userService.getCurrentUser();
    if (!user) return;

    try {
      const response = await this.appwrite.databases.listDocuments(
        this.DB_ID,
        this.COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      this.userMoviesSignal.set(response.documents as unknown as UserMovie[]);
    } catch (error) {
      console.error('Erro ao carregar filmes do usuário:', error);
    }
  }

  async addMovie(movie: any, type: 'rent' | 'buy', price: number, days?: number) {
    const user = await this.userService.getCurrentUser();
    
    if (!user) {
      this.showToast('Faça login para continuar', 'toast-warning');
      return false;
    }

    // Verifica se já possui o filme (comprado ou alugado ativo)
    const existingMovie = this.userMoviesSignal().find(
      m => m.movieId === movie.id && 
      (m.type === 'buy' || (m.type === 'rent' && (!m.expiresAt || new Date(m.expiresAt) > new Date())))
    );

    if (existingMovie) {
      const message = existingMovie.type === 'buy' 
        ? 'Você já comprou este filme!' 
        : 'Você já possui este filme alugado!';
      this.showToast(message, 'toast-warning');
      return false;
    }

    const now = new Date();
    const userMovie: UserMovie = {
      userId: user.$id,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      type: type,
      purchaseDate: now.toISOString(),
      price: price,
      rentalDays: days
    };

    // Se for aluguel, adiciona data de expiração
    if (type === 'rent' && days) {
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + days);
      userMovie.expiresAt = expiresAt.toISOString();
    }

    try {
      const doc = await this.appwrite.databases.createDocument(
        this.DB_ID,
        this.COLLECTION_ID,
        ID.unique(),
        userMovie
      );
      
      this.userMoviesSignal.update(movies => [...movies, doc as unknown as UserMovie]);
      
      const message = type === 'buy' 
        ? `Parabéns! Você agora é dono de ${movie.title}` 
        : `${movie.title} alugado por ${days} dias!`;
      
      this.showToast(message, 'toast-success');
      return true;
    } catch (error) {
      console.error('Erro ao salvar filme:', error);
      this.showToast('Erro ao processar compra', 'toast-danger');
      return false;
    }
  }

  async removeExpiredRentals() {
    const now = new Date();
    const expiredMovies = this.userMoviesSignal().filter(
      movie => movie.type === 'rent' && movie.expiresAt && new Date(movie.expiresAt) < now
    );

    for (const movie of expiredMovies) {
      if (movie.$id) {
        try {
          await this.appwrite.databases.deleteDocument(this.DB_ID, this.COLLECTION_ID, movie.$id);
          this.userMoviesSignal.update(movies => movies.filter(m => m.$id !== movie.$id));
        } catch (error) {
          console.error('Erro ao remover filme expirado:', error);
        }
      }
    }
  }

  async removeMovie(movieId: string) {
    try {
      await this.appwrite.databases.deleteDocument(this.DB_ID, this.COLLECTION_ID, movieId);
      this.userMoviesSignal.update(movies => movies.filter(m => m.$id !== movieId));
      this.showToast('Filme removido', 'toast-success');
    } catch (error) {
      console.error('Erro ao remover filme:', error);
      this.showToast('Erro ao remover filme', 'toast-danger');
    }
  }

  getDaysRemaining(expiresAt: string): number {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  private async showToast(message: string, cssClass: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      cssClass: `custom-toast ${cssClass}`
    });
    await toast.present();
  }
}