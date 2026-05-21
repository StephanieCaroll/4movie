import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonGrid, IonRow, IonCol, IonCard, IonIcon, IonButton, IonLabel } from '@ionic/angular/standalone';
import { FavoritesService } from '../../services/favorites.service';
import { addIcons } from 'ionicons';
import { heart, trashOutline, arrowBackOutline } from 'ionicons/icons';
import { LazyLoadDirective } from '../../directives/lazy-load';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonIcon,
    IonButton,
    IonLabel,
    LazyLoadDirective
  ]
})
export class FavoritesPage implements OnInit {
  public favoritesService = inject(FavoritesService);
  imageBaseUrl = 'https://image.tmdb.org/t/p/w300';

  constructor() {
    addIcons({ heart, trashOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.favoritesService.loadFavorites();
  }

  removeFavorite(movie: any) {
    this.favoritesService.toggleFavorite({
      id: movie.movieId,
      title: movie.title,
      poster_path: movie.posterPath
    });
  }
}