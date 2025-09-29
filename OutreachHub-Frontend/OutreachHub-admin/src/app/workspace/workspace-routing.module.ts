import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkspaceListComponent } from './workspace-list/workspace-list.component';
import { AddWorkspaceComponent } from './add-workspace/add-workspace.component';
import { CreateWorkspaceComponent } from './create-workspace/create-workspace.component';
import { UpdateWorkspaceComponent } from './update-workspace/update-workspace.component';

const routes: Routes = [
  { path: '', redirectTo: 'workspace-list', pathMatch: 'full' },
  { path: 'workspace-list', component: WorkspaceListComponent },
  {
    path:'add-workspace',
    component:AddWorkspaceComponent,
  },
  {
    path: 'create',
    component:CreateWorkspaceComponent

   },
   {
    path: 'edit/:id',
    component:UpdateWorkspaceComponent
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceRoutingModule { }
