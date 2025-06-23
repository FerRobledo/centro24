/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ClientesService } from './clientes.service';

describe('Service: Clientes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientesService]
    });
  });

  it('should ...', inject([ClientesService], (service: ClientesService) => {
    expect(service).toBeTruthy();
  }));
});
