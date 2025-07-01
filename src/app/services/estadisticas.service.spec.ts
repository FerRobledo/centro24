/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EstadisticasService } from './estadisticas.service';

describe('Service: Estadisticas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EstadisticasService]
    });
  });

  it('should ...', inject([EstadisticasService], (service: EstadisticasService) => {
    expect(service).toBeTruthy();
  }));
});
