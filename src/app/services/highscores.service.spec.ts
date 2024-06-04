import { TestBed } from '@angular/core/testing';

import { HighscoresService } from './highscores.service';

describe('HighscoresService', () => {
  let service: HighscoresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighscoresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
