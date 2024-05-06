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
      const audio = new Audio('../../assets/sounds/cards.mp3');
      audio.play();
    }, 500);
    setTimeout(() => {
      navCtrl.navigateRoot('/home');
      history.pushState(null, '');
    }, 2650);
  }
}
