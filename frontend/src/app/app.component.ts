import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  title = 'LancheGo';
  
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.name : '';
  }

  getSelectedModule(): string {
    return this.authService.getSelectedModule() || '';
  }
}