import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonButtons, IonMenuButton, 
  IonSearchbar, IonButton, IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gridOutline, personOutline, cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'], 
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    IonHeader, IonToolbar, IonButtons, IonMenuButton, 
    IonSearchbar, IonButton, IonIcon
  ]
})
export class HeaderComponent {
  @Input() searchQuery: string = '';
  @Input() itemCount: number = 0;
  
  // Necessário para o [(searchQuery)] na Home
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<any>();

  constructor() {
    addIcons({ gridOutline, personOutline, cartOutline });
  }

  onSearchChange(event: any) {
    const value = event.target.value;
    this.searchQueryChange.emit(value); 
    this.searchChange.emit(event);      
  }
}