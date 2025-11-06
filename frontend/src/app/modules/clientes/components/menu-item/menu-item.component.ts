import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { MenuItem } from '../../models/menu.model';
import { ImageService } from '../../../../services/image.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  standalone: false
})
export class MenuItemComponent {
  @Input() menuItem!: MenuItem;
  @Output() adicionarCarrinho = new EventEmitter<MenuItem>();

  private imageService = inject(ImageService);
  private carrinhoService = inject(CarrinhoService);
  private snackBar = inject(MatSnackBar);

  onAdicionarCarrinho(): void {
    // Emite o evento para o dashboard tratar
    this.adicionarCarrinho.emit(this.menuItem);
  }

  getQuantityInCart(): number {
    return this.carrinhoService.getQuantidadeItem(this.menuItem.id);
  }

  isInCart(): boolean {
    return this.getQuantityInCart() > 0;
  }

  increaseQuantity(): void {
    this.carrinhoService.adicionarItem(this.menuItem, 1);
    this.showMessage(`Quantidade atualizada!`);
  }

  decreaseQuantity(): void {
    this.carrinhoService.diminuirQuantidade(this.menuItem.id);
    this.showMessage(`Quantidade atualizada!`);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  getImageUrl(): string {
    console.log('🖼️ [MENU ITEM] menuItem:', this.menuItem);
    console.log('🖼️ [MENU ITEM] has_image:', this.menuItem.has_image);
    console.log('🖼️ [MENU ITEM] image_url:', this.menuItem.image_url);
    console.log('🖼️ [MENU ITEM] imagem:', this.menuItem.imagem);
    
    // Priorizar image_url do backend (campo has_image e image_url)
    if (this.menuItem.has_image && this.menuItem.image_url) {
      return `http://localhost:3002${this.menuItem.image_url}`;
    }
    
    // Fallback para campo imagem (antigo)
    if (this.menuItem.imagem) {
      return this.imageService.getImageUrl(this.menuItem.imagem);
    }
    
    // Usar placeholder baseado na categoria
    const categoria = typeof this.menuItem.categoria === 'string' 
      ? this.menuItem.categoria 
      : 'default';
    return this.imageService.getPlaceholderImage(categoria);
  }

  hasTag(tag: string): boolean {
    return this.menuItem.tags?.includes(tag) || false;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Em caso de erro, usar placeholder baseado na categoria
    const categoria = typeof this.menuItem.categoria === 'string' 
      ? this.menuItem.categoria 
      : 'default';
    target.src = this.imageService.getPlaceholderImage(categoria);
  }
}