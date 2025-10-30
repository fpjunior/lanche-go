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

  // Simulação de login para desenvolvimento
  login(email: string, password: string, module: string): Observable<LoginResponse> {
    // Simulação de usuário válido
    const mockUser: User = {
      id: 1,
      name: 'Usuário Demo',
      email: email,
      modules: ['clientes', 'cozinha', 'gerente', 'admin']
    };

    const mockResponse: LoginResponse = {
      success: true,
      user: mockUser,
      token: 'mock-jwt-token',
      modules: mockUser.modules
    };

    // Simular delay de rede
    return new Observable(observer => {
      setTimeout(() => {
        // Validação simples para desenvolvimento
        if (email === 'demo@lanchego.com' && password === '123456') {
          this.setCurrentUser(mockUser);
          this.setSelectedModule(module);
          localStorage.setItem('authToken', mockResponse.token);
          observer.next(mockResponse);
        } else {
          observer.error({ message: 'Credenciais inválidas' });
        }
        observer.complete();
      }, 1000);
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

  // Para desenvolvimento: buscar módulos disponíveis por email
  getModulesByEmail(email: string): Observable<string[]> {
    // Simulação para desenvolvimento
    const mockModules = ['clientes', 'cozinha', 'gerente', 'admin'];
    
    return new Observable(observer => {
      setTimeout(() => {
        if (email === 'demo@lanchego.com') {
          observer.next(mockModules);
        } else {
          observer.next([]);
        }
        observer.complete();
      }, 500);
    });
  }
}