import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Adicionar headers para APIs
    if (req.url.includes('localhost:3002')) {
      const apiReq = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('🔗 API Request:', apiReq.method, apiReq.url);
      
      return next.handle(apiReq).pipe(
        retry(1), // Tentar novamente em caso de falha
        catchError((error: HttpErrorResponse) => {
          console.error('❌ API Error:', error);
          
          // Se for erro de CORS ou conexão, mostrar fallback
          if (error.status === 0 || error.status === 500) {
            console.warn('⚠️ Usando dados mock devido a erro de conexão');
          }
          
          return throwError(error);
        })
      );
    }

    return next.handle(req);
  }
}