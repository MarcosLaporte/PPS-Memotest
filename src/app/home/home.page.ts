import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Difficulty, User } from '../interfaces';
import { NavController } from '@ionic/angular';
import { MySwal, ToastInfo } from '../utils';
import { HighscoresService } from '../services/highscores.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  protected userInSession: User | null;

  constructor(public auth: AuthService, protected navCtrl: NavController, private scoresServ: HighscoresService) {
    this.userInSession = auth.UserInSession;
  }

  ngOnInit() {
    this.auth.userInSessionObs.subscribe((user) => this.userInSession = user);
  }

  selectDif(difficulty: Difficulty) {
    this.navCtrl.navigateRoot(['/game'], {
      state: { difficulty: difficulty }
    });
  }

  async requestDifficulty() {
    const result = await MySwal.fire({
      title: 'Seleccione una dificultad',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      confirmButtonText: 'Fácil',
      confirmButtonColor: '#a5dc86',
      showDenyButton: true,
      denyButtonText: 'Media',
      denyButtonColor: '#f0ec0d',
      showCancelButton: true,
      cancelButtonText: 'Difícil',
      cancelButtonColor: '#f27474'
    });
    
    return result.isConfirmed ? 'easy' : result.isDenied ? 'mid' : 'hard';
  }

  async showHighScores() {
    const difficulty = await this.requestDifficulty();
    this.scoresServ.difficulty = difficulty;
    await this.scoresServ.showHighscores();
  }

  signOut() {
    this.auth.signOut();
    ToastInfo.fire('Sesión cerrada.');
    this.navCtrl.navigateBack('/login');
  }
}
