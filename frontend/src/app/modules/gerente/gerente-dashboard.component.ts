import { Component } from '@angular/core';

@Component({
  selector: 'app-gerente-dashboard',
  template: `
    <div class="dashboard-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>analytics</mat-icon>
            Dashboard Gerencial
          </mat-card-title>
          <mat-card-subtitle>Relatórios e análises do negócio</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>Bem-vindo ao módulo gerencial!</p>
          <p>Aqui você poderá:</p>
          <ul>
            <li>Visualizar relatórios de vendas</li>
            <li>Acompanhar performance dos produtos</li>
            <li>Analisar métricas de atendimento</li>
            <li>Gerar relatórios financeiros</li>
            <li>Monitorar indicadores de performance</li>
          </ul>
          
          <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <h3>📊 Em Desenvolvimento</h3>
            <p>Este módulo incluirá dashboards interativos com gráficos e relatórios detalhados.</p>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" disabled>
            <mat-icon>bar_chart</mat-icon>
            Relatórios
          </button>
          <button mat-button disabled>
            <mat-icon>trending_up</mat-icon>
            Analytics
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
export class GerenteDashboardComponent { }