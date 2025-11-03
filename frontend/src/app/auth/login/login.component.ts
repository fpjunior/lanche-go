import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  availableModules: string[] = [];
  modulesLoaded = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      module: [{ value: '', disabled: true }, Validators.required]
    });
  }

  ngOnInit(): void {
    // Se já estiver autenticado, redirecionar
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  onEmailChange(): void {
    const email = this.loginForm.get('email')?.value;
    
    if (email && this.loginForm.get('email')?.valid) {
      this.loadModules(email);
    } else {
      this.availableModules = [];
      this.modulesLoaded = false;
      this.loginForm.get('module')?.disable();
      this.loginForm.get('module')?.setValue('');
    }
  }

  private loadModules(email: string): void {
    this.authService.getModulesByEmail(email).subscribe({
      next: (modules) => {
        this.availableModules = modules;
        this.modulesLoaded = true;
        
        if (modules.length > 0) {
          this.loginForm.get('module')?.enable();
        } else {
          this.loginForm.get('module')?.disable();
          this.showMessage('Nenhum módulo disponível para este email');
        }
      },
      error: (error) => {
        console.error('Erro ao carregar módulos:', error);
        this.showMessage('Erro ao carregar módulos');
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      
      const { email, password, module } = this.loginForm.value;
      
      this.authService.login(email, password, module).subscribe({
        next: (response) => {
          this.loading = false;
          this.showMessage('Login realizado com sucesso!');
          
          // Redirecionar baseado no módulo selecionado
          this.redirectToModule(module);
        },
        error: (error) => {
          this.loading = false;
          this.showMessage(error.message || 'Erro ao fazer login');
        }
      });
    }
  }

  private redirectToModule(module: string): void {
    switch (module) {
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'clientes':
        this.router.navigate(['/clientes']);
        break;
      case 'cozinha':
        this.router.navigate(['/cozinha']);
        break;
      case 'pedidos':
        this.router.navigate(['/pedidos']);
        break;
      case 'produtos':
        this.router.navigate(['/produtos']);
        break;
      case 'gerente':
        this.router.navigate(['/gerente']);
        break;
      case 'financeiro':
        this.router.navigate(['/financeiro']);
        break;
      case 'configuracoes':
        this.router.navigate(['/configuracoes']);
        break;
      case 'admin':
      case 'usuarios':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  getModuleLabel(module: string): string {
    const labels: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'clientes': 'Clientes',
      'cozinha': 'Cozinha',
      'pedidos': 'Pedidos',
      'produtos': 'Produtos',
      'gerente': 'Gerente',
      'financeiro': 'Financeiro',
      'configuracoes': 'Configurações',
      'admin': 'Administrador',
      'usuarios': 'Usuários'
    };
    return labels[module] || module;
  }
}