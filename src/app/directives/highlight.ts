import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appMovieHighlight]',
  standalone: true 
})
export class MovieHighlightDirective {

  @HostBinding('class.is-hovered') isHovered: boolean = false;

  constructor() { }

  @HostListener('mouseenter') onMouseEnter() {
    this.isHovered = true;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.isHovered = false;
  }
}