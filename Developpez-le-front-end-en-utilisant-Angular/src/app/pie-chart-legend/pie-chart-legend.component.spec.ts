import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChartLegendComponent } from './pie-chart-legend.component';

describe('PieChartLegendComponent', () => {
  let component: PieChartLegendComponent;
  let fixture: ComponentFixture<PieChartLegendComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PieChartLegendComponent]
    });
    fixture = TestBed.createComponent(PieChartLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
