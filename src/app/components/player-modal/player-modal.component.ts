import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonicModule, ToastController } from '@ionic/angular';
import { MovieService } from '../../services/movie.service';
import { SafePipe } from "../../pipes/safe.pipe";

@Component({
  selector: 'app-player-modal',
  templateUrl: './player-modal.component.html',
  styleUrls: ['./player-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, SafePipe]
})
export class PlayerModalComponent implements OnInit {
  private modalCtrl    = inject(ModalController);
  private movieService = inject(MovieService);
  private toastCtrl    = inject(ToastController);

  @Input() filme!: any;

  videoId: string | null = null;
  isLoading = true;

  ngOnInit() {
    if (this.filme) this.buscarVideoId();
  }

  buscarVideoId() {
    this.movieService.getMovieVideos(this.filme.id).subscribe({
      next: (res: any) => {
        const video = res.results?.find((v: any) =>
          v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );
        if (video) {
          this.videoId = video.key;
        } else {
          this.mostrarToast('Vídeo não encontrado', 'warning');
          setTimeout(() => this.fecharModal(), 2500);
        }
        this.isLoading = false;
      },
      error: () => {
        this.mostrarToast('Erro ao carregar vídeo', 'danger');
        this.isLoading = false;
        setTimeout(() => this.fecharModal(), 2500);
      }
    });
  }

  getEmbedUrl(): string {
    return `https://www.youtube.com/embed/${this.videoId}?autoplay=1&rel=0&modestbranding=1`;
  }

  async mostrarToast(mensagem: string, cor = 'light') {
    const toast = await this.toastCtrl.create({ message: mensagem, duration: 2500, color: cor, position: 'top' });
    toast.present();
  }

  fecharModal() {
    this.modalCtrl.dismiss();
  }
}