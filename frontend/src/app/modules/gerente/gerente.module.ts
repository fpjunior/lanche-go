import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { GerenteRoutingModule } from './gerente-routing.module';
import { GerenteDashboardComponent } from './gerente-dashboard.component';

@NgModule({
  declarations: [
    GerenteDashboardComponent
  ],
  imports: [
    CommonModule,
    GerenteRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class GerenteModule { }