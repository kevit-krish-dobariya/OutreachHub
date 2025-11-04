import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponent } from './shared/shared.component';
import { AuthGuard } from './core/guards/auth.guard';


const routes: Routes = [

   { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  {
    path:'',
    component:SharedComponent,
    canActivate:[AuthGuard],
  children:[
  {
    path: 'dashboard',
     //canActivate:[AuthGuard],
     loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)

   },
   {
    path: 'workspace',
    loadChildren: () => import('./workspace/workspace.module').then(m => m.WorkspaceModule)
  },
  {
    path: 'workspaceusers',
    loadChildren: () => import('./workspaceusers/workspaceusers.module').then(m => m.WorkspaceusersModule)
  },
]
  },
  { path: '**', redirectTo: 'auth/login' }

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
