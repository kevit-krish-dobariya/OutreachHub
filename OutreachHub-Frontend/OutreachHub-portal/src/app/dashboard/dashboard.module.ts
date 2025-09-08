import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { SharedModule } from '../shared/shared.module';
import { TableModule } from 'primeng/table';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { CampaignsComponent } from './pages/campaigns/campaigns.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { TemplatesComponent } from './pages/templates/templates.component';
import { ContactsModule } from './pages/contacts/contacts.module';
import { CampaignsModule } from './pages/campaigns/campaigns.module';
import { TemplatesModule } from './pages/templates/templates.module';
import { DashboardComponent } from './dashboard.component';



@NgModule({
  declarations: [
    DashboardComponent,
    HomeComponent

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    TableModule,
    NgChartsModule,
    FormsModule,
    ContactsModule,
    CampaignsModule,
    TemplatesModule
  ]

})
export class DashboardModule { }
