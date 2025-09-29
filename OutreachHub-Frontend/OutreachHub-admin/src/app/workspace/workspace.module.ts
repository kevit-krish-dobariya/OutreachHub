import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceListComponent } from './workspace-list/workspace-list.component';
import { LayoutModule } from '../shared/layout.module';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { AddWorkspaceComponent } from './add-workspace/add-workspace.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateWorkspaceComponent } from './create-workspace/create-workspace.component';
import { UpdateWorkspaceComponent } from './update-workspace/update-workspace.component';


@NgModule({
  declarations: [
    WorkspaceListComponent,
    AddWorkspaceComponent,
    CreateWorkspaceComponent,
    UpdateWorkspaceComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    WorkspaceRoutingModule,
    LayoutModule,
    
    
    

  ]
})
export class WorkspaceModule { }
