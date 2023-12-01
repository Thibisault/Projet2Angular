import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from "@angular/core";
import { SimpleChanges } from '@angular/core';
import { Participation } from 'src/app/core/models/Participation';
import { HttpClient } from '@angular/common/http';
import { Olympic } from 'src/app/core/models/Olympic';
import { SelectedCountryData2 } from 'src/app/core/models/SelectedCountryData2';
import { ChartistModule } from "ng-chartist";
import * as d3 from 'd3';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-olympic',
  templateUrl: './olympic.component.html',
  styleUrls: ['./olympic.component.scss'],
})
export class OlympicComponent implements OnInit, OnDestroy {
  @Input() olympic!: Olympic;

  observable = this.http.get<Olympic[]>('/assets/mock/olympic.json');
  observer = (data: Olympic[]) => {
    this.olympicData = data;
    this.pieChartData = this.calculatePieChartData();

    const uniqueCountries = new Set(data.map(olympic => olympic.country));
    const totalCountries = uniqueCountries.size;

    const allYears = data.reduce((years, olympic) => {
      olympic.participations.forEach(participation => years.add(participation.year));
      return years;
    }, new Set());
    const totalOlympicGames = allYears.size;

    this.selectedCountryData2 = [
      { label: 'Total Number of Countries', value: totalCountries },
      { label: 'Number of Olympic Games', value: totalOlympicGames },
    ];
  }

  handler: any;

  olympicData: Olympic[] = [];
  pieChartData: any[] = [];

  selectedCountryData2: SelectedCountryData2[] = [];

  selectedCountryName: string = '';

  view: [number, number] = [0, 0];

  showCurrentPage: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.view = [innerWidth / 2.3, 400];
  }

  onResize(event: any) {
    this.view = [event.target.innerWidth / 2.3, 400];
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url !== '/line-chart') {
          this.fetchOlympicData();
        } else {
          this.olympicData = [];
          this.pieChartData = [];
        }
      }
    });
    this.fetchOlympicData();
  }

  fetchOlympicData() {
    this.handler = this.observable.subscribe(this.observer);
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
        const countryName = selectedCountry.country;
        const totalParticipations = selectedCountry.participations.length;
        const totalMedals = selectedCountry.participations.reduce((total, participation) => total + participation.medalsCount, 0);
        const totalAthletes = selectedCountry.participations.reduce((total, participation) => total + participation.athleteCount, 0);

        const dataToPass = {
          countryName: countryName,
        };

        this.router.navigate(['/line-chart', countryName], { state: dataToPass });
      }
    }
  }

  ngOnDestroy(): void {
   this.handler.unsubscribe();
}

}
