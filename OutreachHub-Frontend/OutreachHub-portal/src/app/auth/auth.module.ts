import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';



@NgModule({
 declarations: [
    SignupComponent,
    LoginComponent,

  ],
  imports: [
    CommonModule,SharedModule,ReactiveFormsModule,AuthRoutingModule
  ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AuthModule { }
