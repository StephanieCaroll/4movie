import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  mailOutline, 
  callOutline, 
  lockClosedOutline, 
  checkmarkDoneCircleOutline,
  arrowForwardOutline,
  logInOutline,
  alertCircleOutline,
  camera,          
  createOutline,  
  logOutOutline,   
  playCircleOutline, 
  timeOutline,     
  heart,           
  personCircle     
} from 'ionicons/icons';

// Registrar todos os ícones globalmente para que o HTML os encontre pelo "name"
addIcons({
  'person-outline': personOutline,
  'mail-outline': mailOutline,
  'call-outline': callOutline,
  'lock-closed-outline': lockClosedOutline,
  'checkmark-done-circle-outline': checkmarkDoneCircleOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'log-in-outline': logInOutline,
  'alert-circle-outline': alertCircleOutline,
  'camera': camera,
  'create-outline': createOutline,
  'log-out-outline': logOutOutline,
  'play-circle-outline': playCircleOutline,
  'time-outline': timeOutline,
  'heart': heart,
  'person-circle': personCircle
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideIonicAngular()
  ]
};