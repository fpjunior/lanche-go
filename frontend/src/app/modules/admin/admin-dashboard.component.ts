import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="dashboard-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>admin_panel_settings</mat-icon>
            Painel Administrativo
          </mat-card-title>
          <mat-card-subtitle>Administração completa do sistema</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>Bem-vindo ao painel administrativo!</p>
          <p>Aqui você poderá:</p>
          <ul>
            <li>Gerenciar usuários e permissões</li>
            <li>Configurar cardápio e preços</li>
            <li>Administrar configurações do sistema</li>
            <li>Backup e restauração de dados</li>
            <li>Logs e auditoria do sistema</li>
            <li>Integrações com sistemas externos</li>
          </ul>
          
          <div style="margin-top: 20px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <h3>⚙️ Em Desenvolvimento</h3>
            <p>Este módulo incluirá todas as funcionalidades de administração e configuração do sistema.</p>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" disabled>
            <mat-icon>people</mat-icon>
            Usuários
          </button>
          <button mat-button disabled>
            <mat-icon>restaurant_menu</mat-icon>
            Cardápio
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
export class AdminDashboardComponent { }