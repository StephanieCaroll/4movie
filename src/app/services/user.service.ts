import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private userData: any = null;

  constructor() {}

  setUserData(data: any) {
    this.userData = data;
  }

  getUserData() {
    return this.userData;
  }
}