import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from "@angular/core";
import { SimpleChanges } from '@angular/core';
import { Participation } from 'src/app/core/models/Participation';
import { HttpClient } from '@angular/common/http';
import { Olympic } from 'src/app/core/models/Olympic';
import { ChartistModule } from "ng-chartist";
import * as d3 from 'd3';


@Component({
  selector: 'app-olympic',
  templateUrl: './olympic.component.html',
  styleUrls: ['./olympic.component.scss'],
})
export class OlympicComponent implements OnInit {
  @Input() olympic!: Olympic;

  olympicData: Olympic[] = [];
  pieChartData: any[] = [];
  lineChartData: any[] = [];

  legendCustomSchema: any[] = [];

  selectedCountryData: any[] = [];

  selectedCountryName: string = '';

  constructor(private http: HttpClient) {}

    showLegend = true;
    toggleLegend() {
      this.showLegend = !this.showLegend;
    }


    showLineChart = false;
    toggleLineChart() {
      this.showLineChart = !this.showLineChart;
    }

  ngOnInit(): void {
  this.fetchOlympicData();
  console.log('olympicData:', this.olympicData);
  }

  fetchOlympicData() {
    this.http.get<Olympic[]>('/assets/mock/olympic.json').subscribe((data) => {
    this.olympicData = data;
    console.log('olympicData:', this.olympicData);
    this.pieChartData = this.calculatePieChartData();
    this.lineChartData = this.calculateLineChartData();
 });
  }

  calculatePieChartData(): any[] {
    const pieChartData: any[] = [];

    if (this.olympicData && this.olympicData.length > 0) {
      this.olympicData.forEach((country) => {
        const medalsCount = country.participations.reduce((total, participation) => total + participation.medalsCount, 0);
        pieChartData.push({ name: `${country.country} Medals`, value: medalsCount });
      });
    }
    return pieChartData;
  }

  onPieChartSliceSelect(event: any) {
    if (event.name) {
      const selectedCountry = this.olympicData.find((country) => `${country.country} Medals` === event.name);

      if (selectedCountry) {
        const totalParticipations = selectedCountry.participations.length;
        const totalMedals = selectedCountry.participations.reduce((total, participation) => total + participation.medalsCount, 0);
        const totalAthletes = selectedCountry.participations.reduce((total, participation) => total + participation.athleteCount, 0);
        this.selectedCountryName = selectedCountry.country;
        this.lineChartData = [
          {
            name: 'Medals',
            series: selectedCountry.participations.map((participation) => ({
              name: participation.year.toString(),
              value: participation.medalsCount,
            })),
          },
                    {
                      name: 'Athletes',
                      series: selectedCountry.participations.map((participation) => ({
                        name: participation.year.toString(),
                        value: participation.athleteCount,
                      })),
                    },
        ];

        this.selectedCountryData = [
          { label: 'Total Participations', value: totalParticipations },
          { label: 'Total Medals', value: totalMedals },
          { label: 'Total Athletes', value: totalAthletes },
        ];
        this.showLineChart = true;
      }
    }
  }


  calculateLineChartData(): any[] {
    const lineChartData: any[] = [];

    if (this.olympicData && this.olympicData.length > 0) {
      this.olympicData.forEach((country) => {
        const seriesData = country.participations.map((participation) => ({
          name: participation.year.toString(),
          value: participation.medalsCount,
          label: `${participation.year.toString()}: ${participation.medalsCount} Medals`,
        }));

        const totalParticipation = seriesData.reduce((total, data) => total + data.value, 0);
        const totalMedals = country.participations.reduce((total, participation) => total + participation.medalsCount, 0);
        const totalAthletes = country.participations.reduce((total, participation) => total + participation.athleteCount, 0);

        lineChartData.push(
          {
            name: `${country.country} Participations`,
            series: [
              {
                name: 'Total',
                value: totalParticipation,
                label: `Total: ${totalParticipation}`,
              },
            ],
          },
          {
            name: `${country.country} Total Medals`,
            series: [
              {
                name: 'Total',
                value: totalMedals,
                label: `Total: ${totalMedals}`,
              },
            ],
          },
          {
            name: `${country.country} Total Athletes`,
            series: [
              {
                name: 'Total',
                value: totalAthletes,
                label: `Total: ${totalAthletes}`,
              },
            ],
          }
        );
      });
    }
    return lineChartData;
  }
}


