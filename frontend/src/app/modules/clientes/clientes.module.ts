import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Components
import { ClientesRoutingModule } from './clientes-routing.module';
import { ClientesDashboardComponent } from './components/clientes-dashboard/clientes-dashboard.component';
import { MenuItemComponent } from './components/menu-item/menu-item.component';
import { CarrinhoComponent } from './components/carrinho/carrinho.component';
import { PedidoDialogComponent } from './components/pedido-dialog/pedido-dialog.component';

@NgModule({
  declarations: [
    ClientesDashboardComponent,
    MenuItemComponent,
    CarrinhoComponent,
    PedidoDialogComponent
  ],
  imports: [
    CommonModule,
    ClientesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatGridListModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ]
})
export class ClientesModule { }