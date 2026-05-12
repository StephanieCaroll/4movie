import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonInput,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonInput,
    IonLabel,
    IonIcon
  ]
})
export class LoginPage implements OnInit {

  email: string = '';
  senha: string = '';
  usuario: string = '';

  constructor(private router: Router, private userService: UserService) { }

  entrar() {

    const dadosUsuario = {
      email: this.email,
      senha: this.senha,
      usuario: this.usuario
    };

    this.userService.setUser(dadosUsuario);

    this.router.navigate(['/profile']);
  }

  ngOnInit() {}

}