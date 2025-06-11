/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CobranzaService } from './cobranza.service';

describe('Service: Cobranza', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CobranzaService]
    });
  });

  it('should ...', inject([CobranzaService], (service: CobranzaService) => {
    expect(service).toBeTruthy();
  }));
});
