import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pie-chart-legend',
  template: `
    <div *ngFor="let item of legendItems">
      <span>{{ item.name }}</span>: <span>{{ item.value }}</span>
    </div>
  `,
  styleUrls: ['./pie-chart-legend.component.scss'],
})
export class PieChartLegendComponent {
  @Input() legendItems: any[] = [];
}
