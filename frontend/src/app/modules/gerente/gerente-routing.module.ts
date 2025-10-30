import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GerenteDashboardComponent } from './gerente-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: GerenteDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GerenteRoutingModule { }