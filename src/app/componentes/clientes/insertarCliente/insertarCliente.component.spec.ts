/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InsertarClienteComponent } from './insertarCliente.component';

describe('InsertarClienteComponent', () => {
  let component: InsertarClienteComponent;
  let fixture: ComponentFixture<InsertarClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertarClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertarClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
