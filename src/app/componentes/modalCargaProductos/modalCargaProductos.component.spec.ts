/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ModalCargaProductosComponent } from './modalCargaProductos.component';

describe('ModalCargaProductosComponent', () => {
  let component: ModalCargaProductosComponent;
  let fixture: ComponentFixture<ModalCargaProductosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCargaProductosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCargaProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
