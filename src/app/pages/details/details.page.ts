import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonText,
  IonSpinner
} from '@ionic/angular/standalone';
import { MovieService, Movie } from '../../services/movie.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonText,
    IonSpinner
  ]
})
export class DetailsPage implements OnInit {
  filme: Movie | null = null;
  loading: boolean = true;
  filmeId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    public movieService: MovieService
  ) {}

  ngOnInit() {
    this.filmeId = this.route.snapshot.paramMap.get('id');
    console.log('ID do filme:', this.filmeId);
    
    if (this.filmeId) {
      this.carregarDetalhes(parseInt(this.filmeId));
    }
  }

  carregarDetalhes(id: number) {
    this.movieService.getMovieById(id).subscribe({
      next: (filme) => {
        this.filme = filme;
        this.loading = false;
        console.log('✅ Detalhes carregados:', filme.title);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar detalhes:', err);
        this.loading = false;
      }
    });
  }
}