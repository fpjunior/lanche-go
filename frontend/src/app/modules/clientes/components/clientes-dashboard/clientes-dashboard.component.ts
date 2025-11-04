import { Component, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { CarrinhoService } from '../../services/carrinho.service';
import { MenuItem, MenuCategory, ItemCarrinho } from '../../models/menu.model';
import { MatDialog } from '@angular/material/dialog';
import { PedidoDialogComponent } from '../pedido-dialog/pedido-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-clientes-dashboard',
  templateUrl: './clientes-dashboard.component.html',
  styleUrls: ['./clientes-dashboard.component.scss'],
  standalone: false
})
export class ClientesDashboardComponent implements OnInit {
  menuItems: MenuItem[] = [];
  itensCarrinho: ItemCarrinho[] = [];
  totalCarrinho = 0;
  quantidadeItensCarrinho = 0;
  categorias = Object.values(MenuCategory);
  categoriaSelecionada: MenuCategory | null = null;
  searchQuery = '';

  constructor(
    private menuService: MenuService,
    private carrinhoService: CarrinhoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.carregarMenu();
    this.configurarCarrinho();
  }

  private carregarMenu(): void {
    this.menuService.getMenuItems().subscribe({
      next: (items) => {
        this.menuItems = items;
      },
      error: (error) => {
        console.error('Erro ao carregar menu:', error);
      }
    });
  }

  private configurarCarrinho(): void {
    this.carrinhoService.getItensCarrinho().subscribe(itens => {
      this.itensCarrinho = itens;
      this.quantidadeItensCarrinho = this.carrinhoService.getQuantidadeItens();
    });

    this.carrinhoService.getTotal().subscribe(total => {
      this.totalCarrinho = total;
    });
  }

  filtrarPorCategoria(categoria: MenuCategory | null): void {
    this.categoriaSelecionada = categoria;
    
    if (categoria) {
      this.menuService.getMenuItemsByCategory(categoria).subscribe(items => {
        this.menuItems = items;
      });
    } else {
      this.carregarMenu();
    }
  }

  buscarItens(): void {
    if (this.searchQuery.trim()) {
      this.menuService.searchMenuItems(this.searchQuery).subscribe(items => {
        this.menuItems = items;
        this.categoriaSelecionada = null;
      });
    } else {
      this.carregarMenu();
      this.categoriaSelecionada = null;
    }
  }

  adicionarAoCarrinho(item: MenuItem): void {
    this.carrinhoService.adicionarItem(item);
    this.showMessage(`${item.nome} adicionado ao carrinho!`);
  }

  getCategoryLabel(category: MenuCategory): string {
    return this.menuService.getCategoryLabel(category);
  }

  getCategoryIcon(category: MenuCategory): string {
    return this.menuService.getCategoryIcon(category);
  }

  abrirCarrinho(): void {
    const dialogRef = this.dialog.open(PedidoDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        itens: this.itensCarrinho,
        total: this.totalCarrinho
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.pedidoCriado) {
        this.showMessage('Pedido realizado com sucesso!');
      }
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  getItensVisiveis(): MenuItem[] {
    return this.menuItems.filter(item => item.disponivel);
  }
}