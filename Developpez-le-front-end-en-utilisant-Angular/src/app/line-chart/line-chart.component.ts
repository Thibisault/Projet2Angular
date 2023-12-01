import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Olympic } from 'src/app/core/models/Olympic';
import { Participation } from 'src/app/core/models/Participation';
import { SelectedCountryData2 } from 'src/app/core/models/SelectedCountryData2';
import { LineChartData } from 'src/app/core/models/LineChartData';

import * as d3 from 'd3';
import { ChartistModule } from "ng-chartist";
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, takeUntil  } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit, OnDestroy{
    @Input() olympic!: Olympic;

      olympicData: Olympic[] = [];
      lineChartData: LineChartData[] = [];
      view: [number, number] = [0, 0];

      selectedCountryName: string = '';
      countryName: string = '';
      selectedCountryData: SelectedCountryData2[] = [];

      private subscriptions: any[] = []; // Stocker les abonnements aux observables

      constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router
      ) {
        this.view = [innerWidth / 2.3, 400];
      }

      onResize(event: any) {
        this.view = [event.target.innerWidth / 2.3, 400];
      }

     toggleLineChart() {
        this.router.navigate(['/olympics']);
      }

formatDataByYear(data: Olympic[]): any[] {
  const formattedData: any[] = [];
  const uniqueYears: number[] = [];

  // Collectez toutes les années uniques dans les données.
  data.forEach(country => {
    country.participations.forEach(participation => {
      if (!uniqueYears.includes(participation.year)) {
        uniqueYears.push(participation.year);
      }
    });
  });

  // Pour chaque année unique, calculez les totaux pour chaque pays.
  uniqueYears.forEach(year => {
    const yearData: any = { year: year };
    data.forEach(country => {
      const participation = country.participations.find(p => p.year === year);
      if (participation) {
        yearData[country.country] = {
          totalAthletes: participation.athleteCount,
          totalMedals: participation.medalsCount,
          totalParticipations: 1, // Chaque pays a participé une fois par année
        };
      } else {
        yearData[country.country] = {
          totalAthletes: 0,
          totalMedals: 0,
          totalParticipations: 0,
        };
      }
    });
    formattedData.push(yearData);
  });

  return formattedData;
}

ngOnInit(): void {
  const routeSubscriptionNgOnInit = this.route.paramMap.pipe(
    switchMap(params => {
      const countryName = params.get('countryName');
      if (countryName !== null) {
        this.countryName = countryName;
      }
      return this.http.get<Olympic[]>('/assets/mock/olympic.json');
    }),
  ).subscribe(data => {
    this.olympicData = data;

    const formattedData = this.formatDataByYear(data);

    this.calculateLineChartData(formattedData);
  });

  console.log('Avant ajout de l\'abonnement ngOnInit:', this.subscriptions);
  this.subscriptions.push(routeSubscriptionNgOnInit); // ajouter l'abonnement à la liste des abonnements
  console.log('Après ajout de l\'abonnement ngOnInit:', this.subscriptions);
}



calculateLineChartData(formattedData: any[]): void {
  this.lineChartData = [];

  const years = formattedData.map(dataItem => dataItem.year.toString());

  const totalMedalsSeries = {
    name: `Medals Total`,
    series: years.map(year => ({
      name: year,
      value: formattedData.find(dataItem => dataItem.year.toString() === year)?.[this.countryName]?.totalMedals || 0,
      label: `${year}: ${formattedData.find(dataItem => dataItem.year.toString() === year)?.[this.countryName]?.totalMedals || 0} Total Medals`,
    })),
  };

  const totalAthletesSeries = {
    name: `Athletes Total`,
    series: years.map(year => ({
      name: year,
      value: formattedData.find(dataItem => dataItem.year.toString() === year)?.[this.countryName]?.totalAthletes || 0,
      label: `${year}: ${formattedData.find(dataItem => dataItem.year.toString() === year)?.[this.countryName]?.totalAthletes || 0} Total Athletes`,
    })),
  };

  const totalParticipationsSeries = {
    name: `Participations Total`,
    series: years.map(year => ({
      name: year,
      value: formattedData.find(dataItem => dataItem.year.toString() === year)?.[this.countryName]?.totalParticipations || 0,
      label: `${year}: ${formattedData.find(dataItem => dataItem.year.toString() === year)?.[this.countryName]?.totalParticipations || 0} Total Participations`,
    })),
  };

  const totalParticipations = totalParticipationsSeries.series.reduce((total, series) => total + series.value, 0);
  const totalMedals = totalMedalsSeries.series.reduce((total, series) => total + series.value, 0);
  const totalAthletes = totalAthletesSeries.series.reduce((total, series) => total + series.value, 0);

  this.selectedCountryData = [
    { label: 'Total Participations', value: totalParticipations },
    { label: 'Total Medals', value: totalMedals },
    { label: 'Total Athletes', value: totalAthletes },
  ];

  this.lineChartData.push(totalMedalsSeries, totalAthletesSeries, totalParticipationsSeries);
}

ngOnDestroy(): void {
  console.log('Avant destruction:', this.subscriptions);
  this.subscriptions.forEach(subscription => {
    if (subscription) {
      subscription.unsubscribe();
      console.log('Après destruction:', this.subscriptions);
    }
  });
}
}
