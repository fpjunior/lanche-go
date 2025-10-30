import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth/auth.guard';
import { ModuleGuard } from './auth/module.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Home'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login'
    }
  },
  {
    path: 'clientes',
    loadChildren: () => import('./modules/clientes/clientes.module').then(m => m.ClientesModule),
    canActivate: [AuthGuard, ModuleGuard],
    data: {
      module: 'clientes',
      title: 'Clientes'
    }
  },
  {
    path: 'cozinha',
    loadChildren: () => import('./modules/cozinha/cozinha.module').then(m => m.CozinhaModule),
    canActivate: [AuthGuard, ModuleGuard],
    data: {
      module: 'cozinha',
      title: 'Cozinha'
    }
  },
  {
    path: 'gerente',
    loadChildren: () => import('./modules/gerente/gerente.module').then(m => m.GerenteModule),
    canActivate: [AuthGuard, ModuleGuard],
    data: {
      module: 'gerente',
      title: 'Gerente'
    }
  },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, ModuleGuard],
    data: {
      module: 'admin',
      title: 'Administração'
    }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }