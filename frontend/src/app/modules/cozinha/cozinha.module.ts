import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CozinhaRoutingModule } from './cozinha-routing.module';
import { CozinhaDashboardComponent } from './cozinha-dashboard.component';

@NgModule({
  declarations: [
    CozinhaDashboardComponent
  ],
  imports: [
    CommonModule,
    CozinhaRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class CozinhaModule { }