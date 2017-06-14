import { TestBed, inject } from '@angular/core/testing';

import { SpeechDataService } from './speech-data.service';

describe('SpeechDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpeechDataService]
    });
  });

  it('should be created', inject([SpeechDataService], (service: SpeechDataService) => {
    expect(service).toBeTruthy();
  }));
});
