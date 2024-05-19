import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Difficulty } from '../interfaces';
import { ToastError, ToastInfo } from '../utils';
import { NavController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { NgxSpinnerService } from 'ngx-spinner';
import arrayShuffle from 'array-shuffle';
import { AuthService } from '../services/auth.service';

declare type Topic = 'animals' | 'tools' | 'fruits';
declare type MemoData = { amount: number, topic: Topic };
declare type MemoConfig = Map<Difficulty, MemoData>;
const availableMemos: MemoConfig = new Map<Difficulty, MemoData>([
  ['easy', { amount: 3, topic: 'animals' }],
  ['mid', { amount: 5, topic: 'tools' }],
  ['hard', { amount: 8, topic: 'fruits' }]
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
  cards: Card[] = [];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private storage: StorageService,
    private spinner: NgxSpinnerService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      let auxDif = navigation.extras.state['difficulty'];
      if (!this.isDifficulty(auxDif)) {
        this.navCtrl.navigateRoot(['/home']);
        ToastError.fire('Hubo un error.');
      } else {
        this.difficulty = auxDif;
        // this.loadMemotest(availableMemos.get(this.difficulty)!.topic);
        this.cards = [
          {
            "url": "https://firebasestorage.googleapis.com/v0/b/primer-parcial-app1.appspot.com/o/images%2Fmemotest%2Fanimals%2Fsnake.png?alt=media&token=edeb2da7-f6e0-46df-958d-2f2bcd0ac351",
            "value": "snake",
            "isCopy": false
          },
          {
            "url": "https://firebasestorage.googleapis.com/v0/b/primer-parcial-app1.appspot.com/o/images%2Fmemotest%2Fanimals%2Fsnake.png?alt=media&token=edeb2da7-f6e0-46df-958d-2f2bcd0ac351",
            "value": "snake",
            "isCopy": true
          },
          {
            "url": "https://firebasestorage.googleapis.com/v0/b/primer-parcial-app1.appspot.com/o/images%2Fmemotest%2Fanimals%2Fpenguin.png?alt=media&token=aaad0805-0030-4db0-81d3-7564f23101d7",
            "value": "penguin",
            "isCopy": true
          },
          {
            "url": "https://firebasestorage.googleapis.com/v0/b/primer-parcial-app1.appspot.com/o/images%2Fmemotest%2Fanimals%2Fpenguin.png?alt=media&token=aaad0805-0030-4db0-81d3-7564f23101d7",
            "value": "penguin",
            "isCopy": false
          },
          {
            "url": "https://firebasestorage.googleapis.com/v0/b/primer-parcial-app1.appspot.com/o/images%2Fmemotest%2Fanimals%2Fcat.png?alt=media&token=58a9b5ed-f8ae-424c-9d3c-b53b8c6c2999",
            "value": "cat",
            "isCopy": false
          },
          {
            "url": "https://firebasestorage.googleapis.com/v0/b/primer-parcial-app1.appspot.com/o/images%2Fmemotest%2Fanimals%2Fcat.png?alt=media&token=58a9b5ed-f8ae-424c-9d3c-b53b8c6c2999",
            "value": "cat",
            "isCopy": true
          }
        ]; //TODO: Erase this hardcoded data
      }
    } else {
      this.navCtrl.navigateRoot(['/home']);
      ToastError.fire('Hubo un error.');
    }
  }

  private isDifficulty = (data: any) => {
    const difficulties: Difficulty[] = ['easy', 'mid', 'hard'];
    return difficulties.includes(data);
  }

  async loadMemotest(topic: Topic) {
    this.spinner.show();
    this.memo = availableMemos.get(this.difficulty)!;

    let cardsChosenIndex: number[] = [];
    const list = await this.storage.getAllFiles(`images/memotest/${topic}/`);

    for (let i = 0; i < this.memo.amount; i++) {
      let random: number;
      do {
        random = Math.floor(Math.random() * (list.items).length);
      } while (cardsChosenIndex.includes(random));

      cardsChosenIndex.push(random);
      const fileRef = list.items[random];
      const url = await this.storage.getFileDownloadUrl(fileRef.fullPath);
      const name = (fileRef.name).split('.')[0];
      this.cards.push({ url: url, value: name, isCopy: false });
      this.cards.push({ url: url, value: name, isCopy: true });
    }

    this.cards = arrayShuffle(this.cards);
    this.spinner.hide();
  }

  chosenCard1?: Card;
  chosenCard2?: Card;

  private isLoading: boolean = false;
  async flipCard(card: Card) {
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
      this.handleCard(chosenCardHtml!, CardStatus.Correct);
    } else {
      this.handleCard(firstCardHtml!, CardStatus.Wrong);
      this.handleCard(chosenCardHtml!, CardStatus.Wrong);
      await this.delay(1500);
      
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

  signOut() {
    this.auth.signOut();
    ToastInfo.fire('Sesión cerrada.');
    this.navCtrl.navigateBack('/login');
  }
}
