import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../shared/layout.module';



@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
    
   

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LayoutModule,
    RouterModule
    
  ]
})
export class DashboardModule { }
