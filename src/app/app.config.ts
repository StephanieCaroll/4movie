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
  alertCircleOutline
} from 'ionicons/icons';

// Registrar todos os ícones globalmente
addIcons({
  'person-outline': personOutline,
  'mail-outline': mailOutline,
  'call-outline': callOutline,
  'lock-closed-outline': lockClosedOutline,
  'checkmark-done-circle-outline': checkmarkDoneCircleOutline,
  'arrow-forward-outline': arrowForwardOutline,
  'log-in-outline': logInOutline,
  'alert-circle-outline': alertCircleOutline
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideIonicAngular()
  ]
};