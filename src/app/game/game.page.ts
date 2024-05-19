import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Difficulty } from '../interfaces';
import { MySwal, ToastError, ToastInfo } from '../utils';
import { NavController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import arrayShuffle from 'array-shuffle';
import { AuthService } from '../services/auth.service';
import { ListResult } from '@angular/fire/storage';

declare type Topic = 'animals' | 'tools' | 'fruits';
declare type MemoData = { pairs: number, topic: Topic };
declare type MemoConfig = Map<Difficulty, MemoData>;
const availableMemos: MemoConfig = new Map<Difficulty, MemoData>([
  ['easy', { pairs: 3, topic: 'animals' }],
  ['mid', { pairs: 5, topic: 'tools' }],
  ['hard', { pairs: 8, topic: 'fruits' }]
]);
declare interface Card {
  url: string,
  value: string,
  isCopy: boolean
};
enum CardStatus { Hide, Show, Correct, Wrong };
@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  difficulty!: Difficulty;
  memo!: MemoData;
  private allCards?: ListResult;
  cards: Card[] = [];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storage: StorageService,
    private spinner: NgxSpinnerService,
    private auth: AuthService
  ) { }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (!navigation?.extras?.state || !this.isDifficulty(navigation.extras.state['difficulty'])) {
      this.navCtrl.navigateRoot(['/home']);
      ToastError.fire('Hubo un error.');
      return;
    }

    this.spinner.show();
    this.difficulty = navigation.extras.state['difficulty'];
    this.memo = availableMemos.get(this.difficulty)!;

    const topic = this.memo.topic;
    document.getElementById('cards-container')?.classList.add(topic);
    this.allCards = await this.storage.getAllFiles(`images/memotest/${topic}/`);

    await this.loadNewMemotest();
    this.spinner.hide();
  }

  private isDifficulty = (data: any) => ['easy', 'mid', 'hard'].includes(data);

  async loadNewMemotest() {
    if (!this.allCards) throw new Error('Ocurrió un problema.');
    let cardsChosenIndex: number[] = [];

    for (let i = 0; i < this.memo.pairs; i++) {
      let random: number;
      do {
        random = Math.floor(Math.random() * (this.allCards.items).length);
      } while (cardsChosenIndex.includes(random));

      cardsChosenIndex.push(random);
      const fileRef = this.allCards.items[random];
      const url = await this.storage.getFileDownloadUrl(fileRef.fullPath);
      const name = (fileRef.name).split('.')[0];
      this.cards.push({ url: url, value: name, isCopy: false });
      this.cards.push({ url: url, value: name, isCopy: true });
    }

    this.cards = arrayShuffle(this.cards);
  }

  stopwatch?: Stopwatch;
  chosenCard1?: Card;
  chosenCard2?: Card;

  startStopwatch() {
    this.stopwatch = new Stopwatch();
    this.stopwatch.displayElementId = 'stopwatch';
    this.stopwatch.start();
  }

  private isLoading: boolean = false;
  private correctGuesses: Card[] = [];
  async flipCard(card: Card) {
    if (!this.stopwatch) this.startStopwatch();
    if (this.isLoading) return;
    if (card === this.chosenCard1) {
      ToastError.fire('Seleccione una tarjeta diferente.');
      return;
    }

    const chosenCardHtml = document.getElementById(this.getCardId(card));
    this.handleCard(chosenCardHtml!, CardStatus.Show);
    if (!this.chosenCard1) {
      this.chosenCard1 = card;
      return;
    }

    this.isLoading = true;
    const firstCardHtml = document.getElementById(this.getCardId(this.chosenCard1!));
    this.chosenCard2 = card;
    if (this.sameCards()) {
      this.handleCard(firstCardHtml!, CardStatus.Correct);
      this.correctGuesses.push(this.chosenCard1);
      this.handleCard(chosenCardHtml!, CardStatus.Correct);
      this.correctGuesses.push(card);

      if (this.correctGuesses.length === this.cards.length) this.finishGame();
    } else {
      this.handleCard(firstCardHtml!, CardStatus.Wrong);
      this.handleCard(chosenCardHtml!, CardStatus.Wrong);
      await this.delay(750);

      this.handleCard(firstCardHtml!, CardStatus.Hide);
      this.handleCard(chosenCardHtml!, CardStatus.Hide);
    }

    this.chosenCard1 = undefined;
    this.chosenCard2 = undefined;
    this.isLoading = false;
  }

  private handleCard = (card: HTMLElement, status: CardStatus) => {
    switch (status) {
      case CardStatus.Hide:
        card.classList.remove('show');
        card.classList.add('hide');
        card.removeAttribute('color');
        break;
      case CardStatus.Show:
        card.classList.remove('hide');
        card.classList.add('show');
        card.setAttribute('color', 'tertiary');
        break;
      case CardStatus.Correct:
        card.setAttribute('disabled', 'true');
        card.setAttribute('color', 'success');
        break;
      case CardStatus.Wrong:
        card.setAttribute('color', 'danger');
        break;
    }
  }

  getCardId = (card: Card) => `${card.value}${card.isCopy ? '-copy' : ''}`;
  private sameCards = () => this.chosenCard1?.value === this.chosenCard2?.value;
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  finishGame() {
    this.stopwatch!.stop();
    MySwal.fire({
      title: 'Felicidades!',
      html: `Ha terminado en ${this.stopwatch!.getFormattedTime()}s`,
      icon: 'success',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: true,
      confirmButtonText: 'Jugar de nuevo',
      showCancelButton: false,
      showDenyButton: true,
      denyButtonText: 'Cambiar dificultad'
    }).then(async (res) => {
      if (res.isConfirmed) {
        this.spinner.show();
        this.correctGuesses = [];
        this.cards = [];
        this.stopwatch = undefined;
        await this.loadNewMemotest();
        this.spinner.hide();
      } else this.navCtrl.navigateRoot(['/home']);
    });
  }

  signOut() {
    this.auth.signOut();
    ToastInfo.fire('Sesión cerrada.');
    this.navCtrl.navigateBack('/login');
  }
}

class Stopwatch {
  private startTime: number = 0;
  private elapsedTime: number = 0;
  private intervalId: any = null;
  displayElementId?: string;

  start() {
    if (this.intervalId !== null) return;
    this.startTime = Date.now() - this.elapsedTime;
    this.intervalId = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.displayTime();
    }, 100);
  }

  stop() {
    if (this.intervalId === null) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  reset() {
    this.stop();
    this.elapsedTime = 0;
    this.displayTime();
  }

  private displayTime() {
    const timeStr = this.getFormattedTime();

    if (this.displayElementId) {
      const htmlEl = document.getElementById(this.displayElementId);
      if (htmlEl) { htmlEl.innerText = timeStr; return; };
    }

    console.log(timeStr);
  }

  getTimeMs() {
    return this.elapsedTime;
  }

  getFormattedTime() {
    const time = new Date(this.elapsedTime);
    const minSeconds = time.getMinutes() * 60;
    const seconds = String(minSeconds + time.getSeconds()).padStart(2, '0');
    const milliseconds = String(time.getMilliseconds()).padStart(3, '0');

    return `${seconds}.${milliseconds}`;
  }
}
