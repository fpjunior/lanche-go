import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  modules: string[];
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  modules: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private selectedModuleSubject = new BehaviorSubject<string>('');
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Recuperar dados do localStorage na inicialização
    const savedUser = localStorage.getItem('currentUser');
    const savedModule = localStorage.getItem('selectedModule');
    
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
    
    if (savedModule) {
      this.selectedModuleSubject.next(savedModule);
    }
  }

  // Login usando API real
  login(email: string, password: string, module: string): Observable<LoginResponse> {
    const loginData = {
      email: email,
      senha: password
    };

    return new Observable(observer => {
      this.http.post<any>(`${environment.apiUrl}/auth/login`, loginData).subscribe({
        next: (response) => {
          if (response.status === 'SUCCESS' && response.data?.usuario) {
            const user: User = {
              id: response.data.usuario.id,
              name: response.data.usuario.nome,
              email: response.data.usuario.email,
              modules: response.data.usuario.modulos || []
            };

            const loginResponse: LoginResponse = {
              success: true,
              user: user,
              token: response.data.token,
              modules: user.modules
            };

            // Validar se o módulo selecionado está disponível para o usuário
            if (user.modules.includes(module)) {
              this.setCurrentUser(user);
              this.setSelectedModule(module);
              localStorage.setItem('authToken', response.data.token);
              observer.next(loginResponse);
            } else {
              observer.error({ message: 'Nenhum módulo disponível para este email' });
            }
          } else {
            observer.error({ message: response.message || 'Erro no login' });
          }
          observer.complete();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Credenciais inválidas';
          observer.error({ message: errorMessage });
          observer.complete();
        }
      });
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.selectedModuleSubject.next('');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedModule');
    localStorage.removeItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getSelectedModule(): string {
    return this.selectedModuleSubject.value;
  }

  setSelectedModule(module: string): void {
    this.selectedModuleSubject.next(module);
    localStorage.setItem('selectedModule', module);
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasModule(module: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.modules.includes(module) : false;
  }

  getAvailableModules(): string[] {
    const user = this.getCurrentUser();
    return user ? user.modules : [];
  }

  // Buscar módulos disponíveis por email
  getModulesByEmail(email: string): Observable<string[]> {
    return new Observable(observer => {
      // Fazer uma tentativa de login temporária apenas para obter os módulos
      // Ou implementar um endpoint específico no backend para buscar módulos por email
      
      // Por enquanto, retornar todos os módulos disponíveis no sistema
      // O backend validará se o usuário tem acesso durante o login
      const availableModules = [
        'dashboard', 
        'pedidos', 
        'produtos', 
        'clientes', 
        'financeiro', 
        'configuracoes', 
        'usuarios'
      ];
      
      setTimeout(() => {
        observer.next(availableModules);
        observer.complete();
      }, 300);
    });
  }
}