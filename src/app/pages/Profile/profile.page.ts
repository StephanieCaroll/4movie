import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonLabel,
  IonItem

} from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonLabel,
    IonItem
  ]
})

export class ProfilePage implements OnInit {

  usuario: any;

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    this.usuario = this.userService.getUser();
  }

}