import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,// 👈 Parent container
     //canActivate: [AuthGuard],
    children: [
      {
        path:'',
        component:HomeComponent
      },
      // {
      //   path: 'contacts',
      //   loadChildren: () => import('../dashboard/pages/contacts/contacts.module').then(m => m.ContactsModule)
      // },
      // {
      //   path: 'campaigns',
      //   loadChildren: () => import('../dashboard/pages/campaigns/campaigns.module').then(m => m.CampaignsModule)
      // },
      // {
      //   path: 'templates',
      //   loadChildren: () => import('../dashboard/pages/templates/templates.module').then(m => m.TemplatesModule)
      // },
      // {
      //   path:'about',
      //   loadChildren: () => import('../dashboard/pages/about/about.module').then(m => m.AboutModule)
      // }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
