import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent implements OnInit {

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirecionar automaticamente para o módulo selecionado
    const selectedModule = this.authService.getSelectedModule();
    if (selectedModule && selectedModule !== '') {
      this.navigateToModule(selectedModule);
    }
  }

  navigateToModule(module: string): void {
    switch (module) {
      case 'clientes':
        this.router.navigate(['/clientes']);
        break;
      case 'cozinha':
        this.router.navigate(['/cozinha']);
        break;
      case 'gerente':
        this.router.navigate(['/gerente']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      default:
        // Ficar na home se não houver módulo específico
        break;
    }
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.name : '';
  }

  getAvailableModules(): string[] {
    return this.authService.getAvailableModules();
  }

  getModuleLabel(module: string): string {
    const labels: { [key: string]: string } = {
      'clientes': 'Clientes',
      'cozinha': 'Cozinha',
      'gerente': 'Gerente',
      'admin': 'Administrador'
    };
    return labels[module] || module;
  }

  getModuleIcon(module: string): string {
    const icons: { [key: string]: string } = {
      'clientes': 'restaurant_menu',
      'cozinha': 'kitchen',
      'gerente': 'analytics',
      'admin': 'admin_panel_settings'
    };
    return icons[module] || 'dashboard';
  }
}