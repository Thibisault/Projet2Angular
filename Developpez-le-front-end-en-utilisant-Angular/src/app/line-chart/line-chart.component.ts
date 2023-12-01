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

      totalParticipations: number = 0;
      totalMedals: number = 0;
      totalAthletes: number = 0;

      selectedCountryName: string = '';
      countryName: string = '';
      selectedCountryData: SelectedCountryData2[] = [];

      private subscriptions: any[] = []; // Stocker les abonnements aux observables
      private ngUnsubscribe = new Subject(); // Verifier que les abonnements ont été détruits


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
    takeUntil(this.ngUnsubscribe) // Utiliser takeUntil pour désabonner lorsque ngUnsubscribe est déclenché
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
  const routeSubscriptionCalculateLineChartData = this.route.paramMap.pipe(
    switchMap(params => {
      const countryName = params.get('countryName');
      if (countryName !== null) {
        this.countryName = countryName;
      }
      const selectedCountry = this.olympicData.find(country => country.country === this.countryName);

      if (selectedCountry) {
        formattedData.forEach(dataItem => {
          const year = dataItem.year.toString();
          const yearParticipation = selectedCountry.participations.find(participation => participation.year === Number(year));

          if (yearParticipation) {
            this.totalMedals = yearParticipation.medalsCount;
            this.totalAthletes = yearParticipation.athleteCount;
            this.totalParticipations = 1;

            this.selectedCountryData = [
              { label: 'Participations', value: "3" },
              { label: 'Total Medals', value: this.totalMedals },
              { label: 'Total Athletes', value: this.totalAthletes }
            ];

            this.lineChartData.push({
              name: `${this.countryName} Total Medals`,
              series: [
                {
                  name: year,
                  value: this.totalMedals,
                  label: `${year}: ${this.totalMedals} Total Medals`,
                },
              ],
            });

            this.lineChartData.push({
              name: `${this.countryName} Total Athletes`,
              series: [
                {
                  name: year,
                  value: this.totalAthletes,
                  label: `${year}: ${this.totalAthletes} Total Athletes`,
                },
              ],
            });

            this.lineChartData.push({
              name: `${this.countryName} Total Participations`,
              series: [
                {
                  name: year,
                  value: this.totalParticipations,
                  label: `${year}: ${this.totalParticipations} Total Participations`,
                },
              ],
            });
          }
        });
      }
      return []; // Return an empty array here or modify as needed
    }),
    takeUntil(this.ngUnsubscribe) // Utiliser takeUntil pour désabonner lorsque ngUnsubscribe est déclenché
  );

  console.log('Avant ajout de l\'abonnement CalculateLineChart:', this.subscriptions);
  this.subscriptions.push(routeSubscriptionCalculateLineChartData); // Ajouter l'abonnement à la liste des abonnements
  console.log('Après ajout de l\'abonnement CalculateLineChart:', this.subscriptions);
}


ngOnDestroy(): void {
  // Trigger the ngUnsubscribe subject to unsubscribe from all observables
  this.ngUnsubscribe.next();
  this.ngUnsubscribe.complete();
  // Display the contents of subscriptions before destruction
  console.log('Before destruction:', this.subscriptions);

  this.subscriptions.forEach(subscription => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });
}


}




// Qui corresopnd au de l'id le plus élevée pour le pays et tout ça qui sera affiché en fonction de l'année.



/*
  olympicData: any[] = [];
  lineChartData: any[] = [];
  view: [number, number] = [0, 0];

  totalParticipations: number = 0;
  totalMedals: number = 0;
  totalAthletes: number = 0;

  selectedCountryName: string = '';
  selectedCountryData: any[] = [];

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

  ngOnInit(): void {
    // Utilisez le service HTTP pour récupérer les données olympiques.
    this.http.get<Olympic[]>('/assets/mock/olympic.json').subscribe(data => {
      this.olympicData = data;

      console.log(data)
      console.log(this.olympicData)

      // Vous pouvez maintenant traiter les données ici.
      this.calculateLineChartData();
    });

    // Récupérez les paramètres de l'URL pour le nom du pays.
    this.route.paramMap.subscribe(params => {
      const countryName = params.get('countryName');
      if (countryName) {
        // Utilisez le nom du pays pour rechercher les données correspondantes dans "this.olympicData".
        const countryData = this.olympicData.find(dataItem => dataItem.countryName === countryName);

        if (countryData) {
          this.selectedCountryName = countryData.countryName;
          this.totalParticipations = countryData.totalParticipations;
          this.totalMedals = countryData.totalMedals;
          this.totalAthletes = countryData.totalAthletes;

          this.selectedCountryData = [
            { label: 'Participations', value: this.totalParticipations },
            { label: 'Total Medals', value: this.totalMedals },
            { label: 'Total Athletes', value: this.totalAthletes }
          ];

          // Mettez à jour les données du graphique à lignes.
          this.calculateLineChartData();
        } else {
          console.log('Les données pour le pays sélectionné n\'ont pas été trouvées.');
        }
      }
    });
  }

  calculateLineChartData(): void {

    this.lineChartData = [
      {
        name: `${this.selectedCountryName} Participations`,
        series: [
          {
            name: 'Total',
            value: this.totalParticipations,
            label: `Total: ${this.totalParticipations}`,
          },
        ],
      },
      {
        name: `${this.selectedCountryName} Total Medals`,
        series: [
          {
            name: 'Total',
            value: this.totalMedals,
            label: `Total: ${this.totalMedals}`,
          },
        ],
      },
      {
        name: `${this.selectedCountryName} Total Athletes`,
        series: [
          {
            name: 'Total',
            value: this.totalAthletes,
            label: `Total: ${this.totalAthletes}`,
          },
        ],
      }
    ];
  }
}


/*

calculateLineChartData(): any[] {
    const lineChartData: any[] = [];

  lineChartData.push(
    {
      name: `${this.selectedCountryName} Participations`,
      series: [
        {
          name: 'Total',
          value: this.totalParticipations,
          label: `Total: ${this.totalParticipations}`,
        },
      ],
    },
    {
      name: `${this.selectedCountryName} Total Medals`,
      series: [
        {
          name: 'Total',
          value: this.totalMedals,
          label: `Total: ${this.totalMedals}`,
        },
      ],
    },
    {
      name: `${this.selectedCountryName} Total Athletes`,
      series: [
        {
          name: 'Total',
          value: this.totalAthletes,
          label: `Total: ${this.totalAthletes}`,
        },
      ],
    }
  );
  return lineChartData;
}


/*
calculateLineChartData(): any[] {
    const lineChartData: any[] = [];

    if (this.olympicData && this.olympicData.length > 0) {
        const seriesData = this.olympicData.map((dataItem: any) => {
        return {
        name: dataItem.year.toString(),
        value: dataItem.medalsCount,
        label: `${dataItem.year.toString()}: ${dataItem.medalsCount} Medals`,
      };
    });

    const totalParticipation = seriesData.reduce((total: number, data: any) => total + data.value, 0);
    const totalMedals = this.olympicData.reduce((total: number, dataItem: any) => total + dataItem.medalsCount, 0);
    const totalAthletes = this.olympicData.reduce((total: number, dataItem: any) => total + dataItem.athleteCount, 0);

    lineChartData.push(
      {
        name: `${this.selectedCountryName} Participations`,
        series: [
          {
            name: 'Total',
            value: totalParticipation,
            label: `Total: ${totalParticipation}`,
          },
        ],
      },
      {
        name: `${this.selectedCountryName} Total Medals`,
        series: [
          {
            name: 'Total',
            value: totalMedals,
            label: `Total: ${totalMedals}`,
          },
        ],
      },
      {
        name: `${this.selectedCountryName} Total Athletes`,
        series: [
          {
            name: 'Total',
            value: totalAthletes,
            label: `Total: ${totalAthletes}`,
          },
        ],
      }
    );

  }
  return lineChartData;
}
*/

