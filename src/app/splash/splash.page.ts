import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {
  constructor(private navCtrl: NavController) {
    setTimeout(() => {
      navCtrl.navigateRoot('/home');
      history.pushState(null, '');
    }, 2650);
  }
}
