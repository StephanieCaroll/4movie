import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonContent,      
  IonHeader,       
  IonTitle,       
  IonToolbar,      
  IonList,         
  IonItem,         
  IonThumbnail,    
  IonLabel,        
  IonSpinner       
} from '@ionic/angular/standalone';

import { MovieService, Movie } from '../../services/movie.service';

@Component({
  selector: 'app-home',        
  templateUrl: './home.page.html',  
  styleUrls: ['./home.page.scss'],  
  standalone: true,           
  imports: [                   
    CommonModule,              
    RouterModule,             
    IonContent,                
    IonHeader,                
    IonTitle,                  
    IonToolbar,                
    IonList,                   
    IonItem,                   
    IonThumbnail,              
    IonLabel,                 
    IonSpinner                
  ]
})
export class HomePage implements OnInit {
  // Array que vai armazenar a lista de filmes
  movies: Movie[] = [];
  
  // Flag que indica se está carregando (exibe spinner enquanto true)
  loading: boolean = true;

  // Construtor: public permite acessar o service no template HTML

  constructor(public movieService: MovieService) { }

  // ngOnInit: executado automaticamente quando a página é carregada
  ngOnInit() {
    // Chama o service que busca os filmes populares
    this.movieService.getPopularMovies().subscribe({
      // next: quando os dados chegam com sucesso
      next: (response) => {
        // Pegamos os primeiros 10 filmes da lista
        this.movies = response.results.slice(0, 10);
        // Esconde o spinner de loading
        this.loading = false;
        // Log no console para debug
        console.log('✅ Filmes carregados:', this.movies.length);
      },
      // error: se algo der errado na requisição
      error: (err) => {
        // Mostra o erro no console
        console.error('❌ Erro na API:', err);
        // Esconde o spinner mesmo com erro
        this.loading = false;
      }
    });
  }
}