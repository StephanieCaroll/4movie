import { Injectable, signal, computed, inject } from '@angular/core';
import { AppwriteService } from './appwrite.service';
import { UserService } from './user.service';
import { ID, Query, Permission, Role } from 'appwrite';
import { ToastController } from '@ionic/angular';

export interface FavoriteMovie {
  $id?: string;
  userId: string;
  movieId: number;
  title: string;
  posterPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private appwrite = inject(AppwriteService);
  private userService = inject(UserService);
  private toastCtrl = inject(ToastController);

  private readonly DB_ID = '6a04e0420022f3b7ac95';
  private readonly COLLECTION_ID = 'favorites'; 

  private favoritesSignal = signal<FavoriteMovie[]>([]);
  public favorites = computed(() => this.favoritesSignal());

  constructor() {
    this.loadFavorites();
  }

  async loadFavorites() {
    try {
      const user = await this.userService.getCurrentUser();
      if (!user) {
        this.favoritesSignal.set([]);
        return;
      }

      try {
        const response = await this.appwrite.databases.listDocuments(
          this.DB_ID,
          this.COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        this.favoritesSignal.set(response.documents as unknown as FavoriteMovie[]);
      } catch (error: any) {
        if (error?.code === 404) {
          console.error(`Coleção '${this.COLLECTION_ID}' não encontrada no Appwrite.`);
          this.favoritesSignal.set([]);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar favoritos:', error);
      this.favoritesSignal.set([]);
    }
  }

  isFavorite(movieId: number): boolean {
    return this.favoritesSignal().some(m => m.movieId === movieId);
  }

  async toggleFavorite(movie: any) {
    try {
      const user = await this.userService.getCurrentUser();
      if (!user) {
        this.showToast('Faça login para favoritar filmes', 'toast-danger');
        return;
      }

      const existing = this.favoritesSignal().find(m => m.movieId === movie.id);

      if (existing?.$id) {
        // Se já for favorito, remove
        await this.appwrite.databases.deleteDocument(this.DB_ID, this.COLLECTION_ID, existing.$id);
        this.favoritesSignal.update(list => list.filter(item => item.$id !== existing.$id));
        this.showToast(`${movie.title} removido dos favoritos!`, 'toast-info');
      } else {
        // Se não for, adiciona
        const payload = {
          userId: String(user.$id),
          movieId: Number(movie.id),
          title: String(movie.title),
          posterPath: String(movie.poster_path || '')
        };

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

        this.favoritesSignal.update(list => [...list, doc as unknown as FavoriteMovie]);
        this.showToast(`${movie.title} adicionado aos favoritos!`, 'toast-success');
      }
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error);
      this.showToast('Erro ao atualizar favoritos', 'toast-danger');
    }
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