import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredModule = route.data['module'];
    
    if (!requiredModule) {
      return true; // Se não há módulo requerido, permite acesso
    }

    if (this.authService.hasModule(requiredModule)) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}