import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnelMedicalComponent } from './personnel-medical.component';

describe('PersonnelMedicalComponent', () => {
  let component: PersonnelMedicalComponent;
  let fixture: ComponentFixture<PersonnelMedicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonnelMedicalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonnelMedicalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
