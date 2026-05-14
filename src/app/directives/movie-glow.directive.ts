import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appMovieGlow]',
  standalone: true
})
export class MovieGlowDirective {
  // @HostBinding permite controlar o CSS diretamente pelo TS
  @HostBinding('style.box-shadow') shadow: string = 'none';
  @HostBinding('style.filter') filter: string = 'brightness(1)';
  @HostBinding('style.transition') transition: string = '0.3s ease-in-out';

  @HostListener('mouseenter') onMouseEnter() {
    // Adiciona um brilho azulado e aumenta levemente o brilho da imagem
    this.shadow = '0 0 15px rgba(52, 152, 219, 0.7)';
    this.filter = 'brightness(1.1)';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.shadow = 'none';
    this.filter = 'brightness(1)';
  }
}