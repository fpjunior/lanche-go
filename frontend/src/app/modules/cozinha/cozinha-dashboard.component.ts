import { Component } from '@angular/core';

@Component({
  selector: 'app-cozinha-dashboard',
  template: `
    <div class="dashboard-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>kitchen</mat-icon>
            Dashboard da Cozinha
          </mat-card-title>
          <mat-card-subtitle>Gerenciar pedidos e preparação</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>Bem-vindo ao módulo da cozinha!</p>
          <p>Aqui você poderá:</p>
          <ul>
            <li>Visualizar pedidos pendentes</li>
            <li>Marcar pedidos como em preparação</li>
            <li>Finalizar pedidos prontos</li>
            <li>Gerenciar fila de produção</li>
          </ul>
          
          <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <h3>🚧 Em Desenvolvimento</h3>
            <p>Este módulo será implementado nas próximas iterações do projeto.</p>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" disabled>
            <mat-icon>restaurant</mat-icon>
            Ver Pedidos
          </button>
          <button mat-button disabled>
            <mat-icon>settings</mat-icon>
            Configurações
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    ul {
      margin: 15px 0;
    }
    
    li {
      margin: 5px 0;
    }
  `],
  standalone: false
})
export class CozinhaDashboardComponent { }