import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SharedComponent } from './shared.component';
import { UpperbarComponent } from './upperbar/upperbar.component';


@NgModule({
  declarations: [
   SidebarComponent,
   SharedComponent,
   UpperbarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ]
  ,
  exports:[
    SharedComponent,
    SidebarComponent,
    UpperbarComponent,
  ]
})
export class LayoutModule { }
