import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarDeleteComponent } from './confirmar-delete.component';

describe('ConfirmarDeleteComponent', () => {
  let component: ConfirmarDeleteComponent;
  let fixture: ComponentFixture<ConfirmarDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmarDeleteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmarDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
