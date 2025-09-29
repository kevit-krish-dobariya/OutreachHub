import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { RouterModule } from '@angular/router';
import { LayoutModule } from '../shared/layout.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { WorkspaceModule } from '../workspace/workspace.module';



@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    WorkspaceModule,
    LayoutModule,
    RouterModule,
    NgxChartsModule
  ]
})
export class DashboardModule { }
