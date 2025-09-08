import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BackgroundComponent } from './background/background.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    BackgroundComponent
  ],
  imports: [
    CommonModule,RouterModule
  ],
  exports:[
    NavbarComponent,
    FooterComponent,
    SidebarComponent,
    BackgroundComponent
  ]
})
export class SharedModule { }
