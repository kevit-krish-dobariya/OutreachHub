import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
 {
         path: 'workspaces',
         loadChildren: () => import('../workspace/workspace.module').then(m => m.WorkspaceModule)
       },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
