import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonicModule, ToastController } from '@ionic/angular';
import { MovieService } from '../../services/movie.service';
import { SafePipe } from "../../pipes/safe.pipe";
import { RecentlyWatchedService } from '../../services/recently-watched.service';

@Component({
  selector: 'app-player-modal',
  templateUrl: './player-modal.component.html',
  styleUrls: ['./player-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, SafePipe]
})
export class PlayerModalComponent implements OnInit, OnDestroy {
  private modalCtrl    = inject(ModalController);
  private movieService = inject(MovieService);
  private toastCtrl    = inject(ToastController);
  private watchedService = inject(RecentlyWatchedService);

  @Input() filme!: any;

  videoId: string | null = null;
  isLoading = true;
  player: any; 

  ngOnInit() {
    if (this.filme) this.buscarVideoId();
  }

  ngOnDestroy() {
    if (this.player && this.player.destroy) {
      this.player.destroy();
    }
  }

  buscarVideoId() {
    this.movieService.getMovieVideos(this.filme.id).subscribe({
      next: (res: any) => {
        if (res && Array.isArray(res.results)) {
          
          let video = res.results.find((v: any) => 
            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser') && v.iso_639_1 === 'pt'
          );

          if (!video) {
            video = res.results.find((v: any) => 
              v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
            );
          }

          if (video) {
            this.videoId = video.key;
            this.initYouTubePlayer();
          } else {
            this.mostrarToast('Vídeo não encontrado', 'warning');
            this.isLoading = false;
            setTimeout(() => this.fecharModal(), 2500);
          }
        }
      },
      error: () => {
        this.mostrarToast('Erro ao carregar vídeo', 'danger');
        this.isLoading = false;
        setTimeout(() => this.fecharModal(), 2500);
      }
    });
  }

  async initYouTubePlayer() {
    if ((window as any).YT && (window as any).YT.Player) {
      this.createPlayer();
      return;
    }

    if (!(document.getElementById('youtube-api-script'))) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  createPlayer() {
    const createInstance = () => {
      const savedData = this.watchedService.recentlyWatched().find(m => m.movieId === this.filme.id);
      const startSeconds = savedData && savedData.progress ? Math.floor(savedData.progress) : 0;

      this.player = new (window as any).YT.Player('yt-player-iframe', {
        height: '100%',
        width: '100%',
        videoId: this.videoId,
        playerVars: { 
          'autoplay': 1, 
          'rel': 0, 
          'modestbranding': 1,
          'start': startSeconds 
        },
        events: {
          'onReady': () => {
            this.isLoading = false;
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.ready) {
      (window as any).YT.ready(createInstance);
    } else {
      createInstance();
    }
  }

  async mostrarToast(mensagem: string, cor = 'light') {
    const toast = await this.toastCtrl.create({ message: mensagem, duration: 2500, color: cor, position: 'top' });
    toast.present();
  }

  fecharModal() {
    if (this.player && typeof this.player.getCurrentTime === 'function') {
      const currentTime = this.player.getCurrentTime();
      const duration = this.player.getDuration();
      
      if (duration > 0) {
        this.watchedService.addWatchedMovie(this.filme, currentTime, duration);
      }
    } else {
      this.watchedService.addWatchedMovie(this.filme, 0, 0);
    }
    
    this.modalCtrl.dismiss();
  }
}