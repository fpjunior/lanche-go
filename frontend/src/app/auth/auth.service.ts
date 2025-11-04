import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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

    // Verificar expiração do token periodicamente
    this.startTokenExpirationCheck();
  }

  /**
   * Inicia verificação periódica da expiração do token
   */
  private startTokenExpirationCheck(): void {
    setInterval(() => {
      const token = this.getToken();
      if (token && !this.isTokenValid()) {
        console.log('[AuthService] Token expirado detectado - fazendo logout automático');
        this.logoutDueToExpiration();
      }
    }, 30000); // Verifica a cada 30 segundos
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
    console.log('[AuthService] Executando logout...');
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
    const user = this.currentUserSubject.value;
    const token = this.getToken();
    
    // Verificar se há usuário E se o token é válido
    return user !== null && token !== null && this.isTokenValid();
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
    return this.http.post<any>(`${environment.apiUrl}/auth/modules-by-email`, { email })
      .pipe(
        map(response => {
          if (response.success && response.modules) {
            return response.modules;
          }
          return [];
        }),
        catchError(error => {
          console.error('Erro ao buscar módulos por email:', error);
          // Fallback para módulos básicos em caso de erro
          return of(['dashboard', 'clientes']);
        })
      );
  }

  /**
   * Obter token do localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Verificar se o token JWT é válido e não expirou
   */
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload || typeof payload !== 'object') return false;
      
      if (!payload.exp) return false;
      
      // exp é em segundos desde epoch, precisa ser convertido para milissegundos
      const expTimestamp = payload.exp * 1000;
      const now = Date.now();
      
      // Log para debug da expiração
      if (now > expTimestamp) {
        console.log('[AuthService] Token expirado:', {
          exp: new Date(expTimestamp),
          now: new Date(now),
          diffMinutes: Math.round((expTimestamp - now) / 60000)
        });
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('[AuthService] Erro ao verificar token:', e);
      return false;
    }
  }

  /**
   * Logout devido à expiração do token
   */
  logoutDueToExpiration(): void {
    console.log('[AuthService] Fazendo logout devido à expiração do token');
    this.logout();
    
    // Só redireciona se não estiver já na página de login
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Obter tempo restante do token em minutos
   */
  getTokenTimeRemaining(): number {
    const token = this.getToken();
    if (!token) return 0;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return 0;
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return 0;
      
      const expTimestamp = payload.exp * 1000;
      const now = Date.now();
      const remainingMs = expTimestamp - now;
      
      return Math.max(0, Math.floor(remainingMs / 60000)); // Retorna em minutos
    } catch (e) {
      return 0;
    }
  }

  /**
   * Verificar se o token expira em menos de X minutos
   */
  isTokenExpiringSoon(minutes: number = 5): boolean {
    return this.getTokenTimeRemaining() <= minutes;
  }
}