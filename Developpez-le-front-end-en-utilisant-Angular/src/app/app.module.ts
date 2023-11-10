import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { OlympicComponent } from './olympic/olympic.component';
////////////////////////////////////////////////////////////////////////////////////
import { ChartistModule } from "ng-chartist";
import { NgxChartsModule }from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PieChartLegendComponent } from './pie-chart-legend/pie-chart-legend.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NotFoundComponent,
    OlympicComponent,
    PieChartLegendComponent

  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, ChartistModule, NgxChartsModule, BrowserAnimationsModule,],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
