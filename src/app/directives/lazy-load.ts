import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements AfterViewInit {
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage();
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px' 
    });

    observer.observe(this.el.nativeElement);
  }

  private loadImage() {
    const img = this.el.nativeElement as HTMLImageElement;
    
    const dataSrc = img.getAttribute('data-src'); 

   if (dataSrc) {
    img.onload = () => {
     
      requestAnimationFrame(() => {
        img.classList.add('fade-in');
      });
    };
    img.src = dataSrc;
  }
}
}