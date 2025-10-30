import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesDashboardComponent } from './components/clientes-dashboard/clientes-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: ClientesDashboardComponent,
    data: {
      title: 'Fazer Pedido'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientesRoutingModule { }