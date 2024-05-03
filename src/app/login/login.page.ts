import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NavController } from '@ionic/angular';
import { ToastError, ToastSuccess } from '../utils';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  email: string = "";
  password: string = "";

  constructor(
    private auth: AuthService,
    public navCtrl: NavController,
    private spinner: NgxSpinnerService
  ) { }

  async login() {
    this.spinner.show();
    try {
      await this.auth.signInToFirebase(this.email, this.password)

      this.email = "";
      this.password = "";
      this.spinner.hide();
      ToastSuccess.fire('Operación realizada con éxito.')
      this.navCtrl.navigateBack('/home')
    } catch (error: any) {
      this.spinner.hide();
      ToastError.fire('Ups! Algo salió mal.', error.message);
    }
  }

  quickFill(email: string, pass: string) {
    this.email = email;
    this.password = pass;
  }
}
