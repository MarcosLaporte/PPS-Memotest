import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../interfaces';
import { NavController } from '@ionic/angular';
import { ToastInfo } from '../utils';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit{
  protected userInSession: User | null;

  constructor(public auth: AuthService, protected navCtrl: NavController) {
    this.userInSession = auth.UserInSession;

  }

  ngOnInit() {
    this.auth.userInSessionObs.subscribe((user) => this.userInSession = user);
  }

  signOut() {
    this.auth.signOut();
    ToastInfo.fire('Sesión cerrada.');
    this.navCtrl.navigateBack('/login');
  }
}
