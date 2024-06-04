import { Injectable } from '@angular/core';
import { Difficulty, Score, User } from '../interfaces';
import { AuthService } from './auth.service';
import { DatabaseService } from './database.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MySwal } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class HighscoresService {
  difficulty?: Difficulty;
  maxAmount: number = 5;

  constructor(
    private auth: AuthService,
    private db: DatabaseService,
    private spinner: NgxSpinnerService,
  ) { }

  async showHighscores(showNewGameBtn: boolean = false) {
    if (!this.difficulty) throw new Error('Difficulty not provided.');
    this.spinner.show();
    const highscores = await this.getScores(this.difficulty);
    this.spinner.hide();

    const result = await MySwal.fire({
      title: `Mejores puntajes Dificultad ${this.parseDifficulty(this.difficulty)}`,
      html: await this.createListElement(highscores),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: showNewGameBtn,
      confirmButtonText: 'Jugar de nuevo',
      showCancelButton: true,
      cancelButtonText: 'Volver al inicio'
    });

    return result.isConfirmed ? 'confirm' : 'cancel';
  }

  private readonly getScores = async (difficulty: Difficulty): Promise<Score[]> => {
    return (await this.db.getData<Score>('memoScores', 'seconds'))
      .filter((score) => score.difficulty === difficulty)
      .slice(0, this.maxAmount);
  };

  private readonly parseDifficulty = (difficulty: Difficulty) => {
    return difficulty === 'easy' ? 'Fácil' : difficulty === 'mid' ? 'Media' : 'Difícil';
  }

  private readonly createListElement = async (highscores: Score[]) => {
    this.spinner.show();
    const listElement = document.createElement('ul');
    for (let score of highscores) {
      const itemEl = document.createElement('li');
      const user = await this.db.getDataFromDoc<User>('users', score.userDocId);
      itemEl.innerHTML = `${user.name} ${user.lastname} - ${score.seconds}"`;
      if (this.auth.UserInSession!.id === user.id)
        itemEl.style.fontWeight = 'bolder';
      itemEl.style.textAlign = 'start';
      itemEl.style.fontFamily = '"Raleway", sans-serif';
      itemEl.style.fontSize = '1.5rem';
      listElement.appendChild(itemEl);
    }
    this.spinner.hide();
    return listElement;
  }
}
