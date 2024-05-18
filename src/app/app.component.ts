import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { ToastWarning } from './utils';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService, private navCtrl: NavController) {
    const ssUser = sessionStorage.getItem('userInSession');
    this.auth.UserInSession = ssUser ? JSON.parse(ssUser) : null;
  }

  ngOnInit() {
    this.navCtrl.navigateRoot('splash');
    window.addEventListener('storage', (e) => {
      if (e.storageArea === sessionStorage && e.key === 'userInSession') {
        this.auth.signOut();
        ToastWarning.fire('Hubo un problema con su sesión.', ' Ingrese nuevamente.');
        this.navCtrl.navigateRoot('login');
      }
    });
  }
}
