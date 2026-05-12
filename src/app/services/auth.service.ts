import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userData: any;

  constructor() { }

  setUserData(data: any) {
    this.userData = data;
  }

  getUserData() {
    return this.userData;
  }
}