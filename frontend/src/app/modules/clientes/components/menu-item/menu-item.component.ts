import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MenuItem } from '../../models/menu.model';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  standalone: false
})
export class MenuItemComponent {
  @Input() menuItem!: MenuItem;
  @Output() adicionarCarrinho = new EventEmitter<MenuItem>();

  onAdicionarCarrinho(): void {
    this.adicionarCarrinho.emit(this.menuItem);
  }

  getImageUrl(): string {
    return this.menuItem.imagem || 'assets/images/no-image.svg';
  }

  hasTag(tag: string): boolean {
    return this.menuItem.tags?.includes(tag) || false;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/no-image.svg';
  }
}