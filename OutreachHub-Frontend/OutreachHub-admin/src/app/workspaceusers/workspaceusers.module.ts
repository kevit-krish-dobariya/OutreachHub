import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkspaceusersRoutingModule } from './workspaceusers-routing.module';
import { UsersComponent } from './users/users.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '../shared/layout.module';
import { NewUsersComponent } from './new-users/new-users.component';


@NgModule({
  declarations: [
    UsersComponent,
    NewUsersComponent
  ],
  imports: [
    CommonModule,
    WorkspaceusersRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        LayoutModule,
  ]
})
export class WorkspaceusersModule { }
