import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackMyBusComponent } from './track-my-bus.component';

describe('TrackMyBusComponent', () => {
  let component: TrackMyBusComponent;
  let fixture: ComponentFixture<TrackMyBusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrackMyBusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackMyBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
