import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let apiReq = req;

    // Adicionar headers e token para APIs
    if (req.url.includes('localhost:3002')) {
      const token = this.authService.getToken();
      
      // Adicionar token se disponível e não for rota de login
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (token && !req.url.includes('/auth/login')) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      apiReq = req.clone({ setHeaders: headers });
      
      console.log('🔗 API Request:', apiReq.method, apiReq.url);
    }
    
    return next.handle(apiReq).pipe(
      retry(1), // Tentar novamente em caso de falha
      catchError((error: HttpErrorResponse) => {
        console.error('❌ API Error:', error);
        
        // Token expirado ou inválido - fazer logout automático
        if (error.status === 401 && error.error?.code === 'TOKEN_EXPIRED') {
          console.log('[ApiInterceptor] Token expirado - fazendo logout');
          this.authService.logoutDueToExpiration();
          return throwError(() => error);
        }

        // Token inválido
        if (error.status === 403 && error.error?.code === 'INVALID_TOKEN') {
          console.log('[ApiInterceptor] Token inválido - fazendo logout');
          this.authService.logoutDueToExpiration();
          return throwError(() => error);
        }
        
        // Se for erro de CORS ou conexão, mostrar fallback
        if (error.status === 0 || error.status === 500) {
          console.warn('⚠️ Usando dados mock devido a erro de conexão');
        }
        
        return throwError(() => error);
      })
    );
  }
}