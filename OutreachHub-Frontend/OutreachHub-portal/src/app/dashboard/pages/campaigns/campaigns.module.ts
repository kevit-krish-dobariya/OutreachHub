import { NgModule } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

import { CampaignsRoutingModule } from './campaigns-routing.module';
import { CampaignsComponent } from './campaigns.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CampaignsComponent
  ],
  imports: [
    CommonModule,
    CampaignsRoutingModule,
    FormsModule,
    NgClass
  ]
})
export class CampaignsModule { }
