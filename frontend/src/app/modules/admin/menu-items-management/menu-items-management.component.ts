import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MenuItemsService } from 'src/app/services/menu-items.service';
import { ImageService } from 'src/app/services/image.service';
import { MenuItemFormDialogComponent } from '../menu-item-form-dialog/menu-item-form-dialog.component';

// Interface local temporária
export interface MenuItem {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  categoria_nome?: string;
  disponivel: boolean;
  ingredientes?: string[];
  tags?: string[];
  has_image?: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-menu-items-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './menu-items-management.component.html',
  styleUrls: ['./menu-items-management.component.scss']
})
export class MenuItemsManagementComponent implements OnInit {
  menuItems: MenuItem[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = '';
  categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'lanche', label: 'Lanches' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'sobremesa', label: 'Sobremesas' },
    { value: 'petisco', label: 'Petiscos' }
  ];

  constructor(
    private menuItemsService: MenuItemsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.loading = true;
    const params: any = {};
    
    if (this.selectedCategory) {
      params.categoria = this.selectedCategory;
    }
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    this.menuItemsService.getAll(params).subscribe({
      next: (response: any) => {
        this.menuItems = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar itens:', error);
        this.showMessage('Erro ao carregar itens do menu');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadMenuItems();
  }

  onCategoryChange(): void {
    this.loadMenuItems();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MenuItemFormDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenuItems();
        this.showMessage('Item criado com sucesso!');
      }
    });
  }

  openEditDialog(item: MenuItem): void {
    const dialogRef = this.dialog.open(MenuItemFormDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { mode: 'edit', item: { ...item } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMenuItems();
        this.showMessage('Item atualizado com sucesso!');
      }
    });
  }

  deleteItem(item: MenuItem): void {
    if (confirm(`Tem certeza que deseja excluir "${item.nome}"?`)) {
      this.menuItemsService.delete(item.id).subscribe({
        next: () => {
          this.loadMenuItems();
          this.showMessage('Item excluído com sucesso!');
        },
        error: (error: any) => {
          console.error('Erro ao excluir item:', error);
          this.showMessage('Erro ao excluir item');
        }
      });
    }
  }

  toggleAvailability(item: MenuItem): void {
    const updatedItem = { ...item, disponivel: !item.disponivel };
    
    this.menuItemsService.update(item.id, updatedItem).subscribe({
      next: () => {
        item.disponivel = !item.disponivel;
        this.showMessage(`Item ${item.disponivel ? 'ativado' : 'desativado'} com sucesso!`);
      },
      error: (error: any) => {
        console.error('Erro ao alterar disponibilidade:', error);
        this.showMessage('Erro ao alterar disponibilidade do item');
      }
    });
  }

  getImageUrl(item: MenuItem): string {
    if (item?.image_url) {
      return this.imageService.getImageUrl(item.image_url);
    }
    return this.imageService.getPlaceholderImage('Imagem');
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm88L3RleHQ+CiAgPC9zdmc+';
    }
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}