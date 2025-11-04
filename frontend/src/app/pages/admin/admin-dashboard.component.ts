import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatGridListModule
  ],
  template: `
    <div class="admin-dashboard">
      <h1>Painel Administrativo</h1>
      <p class="subtitle">Gerencie os recursos do sistema</p>

      <mat-grid-list cols="3" rowHeight="200px" gutterSize="16">
        <!-- Gerenciar Menu -->
        <mat-grid-tile>
          <mat-card class="admin-card">
            <mat-card-content class="card-content">
              <mat-icon class="admin-icon">restaurant_menu</mat-icon>
              <h3>Gerenciar Menu</h3>
              <p>Adicionar, editar e remover itens do cardápio</p>
              <button 
                mat-raised-button 
                color="primary" 
                [routerLink]="['/admin/menu-items']">
                Acessar
              </button>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Usuários -->
        <mat-grid-tile>
          <mat-card class="admin-card">
            <mat-card-content class="card-content">
              <mat-icon class="admin-icon">people</mat-icon>
              <h3>Usuários</h3>
              <p>Gerenciar usuários e permissões</p>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Relatórios -->
        <mat-grid-tile>
          <mat-card class="admin-card">
            <mat-card-content class="card-content">
              <mat-icon class="admin-icon">analytics</mat-icon>
              <h3>Relatórios</h3>
              <p>Visualizar relatórios e estatísticas</p>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Configurações -->
        <mat-grid-tile>
          <mat-card class="admin-card">
            <mat-card-content class="card-content">
              <mat-icon class="admin-icon">settings</mat-icon>
              <h3>Configurações</h3>
              <p>Configurações gerais do sistema</p>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Pedidos -->
        <mat-grid-tile>
          <mat-card class="admin-card">
            <mat-card-content class="card-content">
              <mat-icon class="admin-icon">receipt_long</mat-icon>
              <h3>Pedidos</h3>
              <p>Gerenciar pedidos do sistema</p>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- Financeiro -->
        <mat-grid-tile>
          <mat-card class="admin-card">
            <mat-card-content class="card-content">
              <mat-icon class="admin-icon">attach_money</mat-icon>
              <h3>Financeiro</h3>
              <p>Controle financeiro e faturamento</p>
              <button mat-raised-button color="primary" disabled>
                Em breve
              </button>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      color: #2c3e50;
      margin-bottom: 8px;
      font-size: 2rem;
      font-weight: 500;
    }

    .subtitle {
      color: #7f8c8d;
      margin-bottom: 32px;
      font-size: 1.1rem;
    }

    .admin-card {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      cursor: pointer;
    }

    .admin-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .card-content {
      text-align: center;
      padding: 16px;
      width: 100%;
    }

    .admin-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3f51b5;
      margin-bottom: 16px;
    }

    h3 {
      margin: 0 0 8px 0;
      color: #2c3e50;
      font-weight: 500;
    }

    p {
      margin: 0 0 16px 0;
      color: #7f8c8d;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    button {
      margin-top: auto;
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 16px;
      }

      h1 {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      mat-grid-list {
        cols: 1 !important;
      }
    }

    @media (max-width: 1024px) and (min-width: 769px) {
      mat-grid-list {
        cols: 2 !important;
      }
    }
  `]
})
export class AdminDashboardComponent {

}