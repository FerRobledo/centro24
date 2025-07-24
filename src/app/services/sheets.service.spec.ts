/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SheetsService } from './sheets.service';

describe('Service: Sheets', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SheetsService]
    });
  });

  it('should ...', inject([SheetsService], (service: SheetsService) => {
    expect(service).toBeTruthy();
  }));
});
