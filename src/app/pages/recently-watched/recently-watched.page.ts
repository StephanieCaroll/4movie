import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { RecentlyWatchedService } from '../../services/recently-watched.service';

@Component({
  selector: 'app-recently-watched',
  templateUrl: './recently-watched.page.html',
  styleUrls: ['./recently-watched.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class RecentlyWatchedPage implements OnInit {
  public watchedService = inject(RecentlyWatchedService);

  ngOnInit() {
    this.watchedService.loadRecentlyWatched();
  }

  // Função para calcular os minutos restantes
  getRemainingTime(duration: number, progress: number): number {
    if (!duration || !progress) return 0;
    const remainingSeconds = duration - progress;
    // Retorna o valor arredondado em minutos
    return Math.max(1, Math.ceil(remainingSeconds / 60)); 
  }
}