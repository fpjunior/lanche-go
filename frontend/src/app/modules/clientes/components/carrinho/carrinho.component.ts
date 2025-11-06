import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CarrinhoService } from '../../services/carrinho.service';
import { ItemCarrinho } from '../../models/menu.model';
import { PedidoDialogComponent } from '../pedido-dialog/pedido-dialog.component';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss'],
  standalone: false
})
export class CarrinhoComponent implements OnInit {
  @Input() compact = false;
  @Output() finalizarClicked = new EventEmitter<void>();
  
  itens: ItemCarrinho[] = [];
  total = 0;

  constructor(
    private carrinhoService: CarrinhoService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carrinhoService.getItensCarrinho().subscribe(itens => {
      this.itens = itens;
    });

    this.carrinhoService.getTotal().subscribe(total => {
      this.total = total;
    });
  }

  atualizarQuantidade(index: number, novaQuantidade: number): void {
    if (novaQuantidade <= 0) {
      this.removerItem(index);
    } else {
      this.carrinhoService.atualizarQuantidade(index, novaQuantidade);
    }
  }

  removerItem(index: number): void {
    this.carrinhoService.removerItem(index);
  }

  limparCarrinho(): void {
    this.carrinhoService.limparCarrinho();
  }

  getQuantidadeTotal(): number {
    return this.carrinhoService.getQuantidadeItens();
  }

  finalizarPedido(): void {
    if (this.itens.length === 0) {
      alert('Carrinho está vazio!');
      return;
    }
    
    // Se estamos no modo compacto (sidebar), emitir evento para o dashboard
    if (this.compact) {
      this.finalizarClicked.emit();
    } else {
      // Se não estamos compacto, abrir modal diretamente
      this.abrirModalPedido();
    }
  }

  private abrirModalPedido(): void {
    const dialogRef = this.dialog.open(PedidoDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        itens: this.itens,
        total: this.total
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.pedidoCriado) {
        console.log('Pedido finalizado com sucesso!');
      }
    });
  }

  continuarComprando(): void {
    // Fecha dialogs se houver algum aberto
    this.dialog.closeAll();
    
    // Navega de volta para o dashboard (não é necessário se já estamos nele)
    // this.router.navigate(['/clientes']);
  }
}