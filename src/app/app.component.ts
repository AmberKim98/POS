import { Component } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private location: Location,
    private alertController: AlertController
  ) {
    this.platform.backButton.subscribeWithPriority(100, (processNextHandler) => {
      console.log('Back Press Handler');
      if((this.location.isCurrentPathEqualTo('/home')) || (this.location.isCurrentPathEqualTo('/login')))
      {
        console.log('Show Exit Alert!');
        this.showExitConfirm();
      }
      else {
        
        console.log('going back..');
        this.location.back();
      }
    })
  }

  showExitConfirm() {
    this.alertController.create({
      header: 'Closing App',
      message: 'Do you want to close the app?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          handler: () => {
            console.log('Application exit prevented!');
          }
        },
        {
          text: 'Exit',
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    })
    .then(alert => {
      alert.present();
    })
  }
}
