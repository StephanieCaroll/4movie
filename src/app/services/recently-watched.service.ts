import { Injectable, signal, computed, inject } from '@angular/core';
import { AppwriteService } from './appwrite.service';
import { UserService } from './user.service';
import { ID, Query, Permission, Role } from 'appwrite';

export interface RecentlyWatched {
  $id?: string;
  userId: string;
  movieId: number;
  title: string;
  posterPath: string;
  watchedAt: string;
  progress: number;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecentlyWatchedService {
  private appwrite = inject(AppwriteService);
  private userService = inject(UserService);
  
  private readonly DB_ID = '6a04e0420022f3b7ac95'; 
  private readonly COLLECTION_ID = 'recently_watched'; 
  
  private watchedSignal = signal<RecentlyWatched[]>([]);
  public recentlyWatched = computed(() => this.watchedSignal());

  constructor() {
    this.loadRecentlyWatched();
  }

  async loadRecentlyWatched() {
    try {
      const user = await this.userService.getCurrentUser();
      if (!user) {
        this.watchedSignal.set([]);
        return;
      }

      const response = await this.appwrite.databases.listDocuments(
        this.DB_ID,
        this.COLLECTION_ID,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('watchedAt'),
          Query.limit(20)
        ]
      );
      
      this.watchedSignal.set(response.documents as unknown as RecentlyWatched[]);
    } catch (error: any) {
      console.error('Erro ao carregar assistidos por último:', error);
      this.watchedSignal.set([]);
    }
  }

  async addWatchedMovie(movie: any, progress: number = 0, duration: number = 0) {
    try {
      const user = await this.userService.getCurrentUser();
      if (!user) return;

      const now = new Date().toISOString();
      const existing = this.watchedSignal().find(m => m.movieId === movie.id);

      if (existing?.$id) {
        await this.appwrite.databases.updateDocument(
          this.DB_ID,
          this.COLLECTION_ID,
          existing.$id,
          { 
            watchedAt: now,
            progress: progress,
            duration: duration
          }
        );
      } else {
        const payload = {
          userId: String(user.$id),
          movieId: Number(movie.id),
          title: String(movie.title || movie.name),
          posterPath: String(movie.poster_path || ''),
          watchedAt: now,
          progress: Number(progress),
          duration: Number(duration)
        };

        const permissions = [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
          Permission.delete(Role.user(user.$id))
        ];

        await this.appwrite.databases.createDocument(
          this.DB_ID,
          this.COLLECTION_ID,
          ID.unique(),
          payload,
          permissions
        );
      }
      
      await this.loadRecentlyWatched();
    } catch (error) {
      console.error('Erro ao adicionar aos assistidos:', error);
    }
  }
}