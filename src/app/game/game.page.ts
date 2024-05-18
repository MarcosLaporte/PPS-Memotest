import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Difficulty } from '../interfaces';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit {
  difficulty!: Difficulty;

  constructor(private router: Router) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.difficulty = navigation.extras.state['difficulty'];
    }
  }
}
