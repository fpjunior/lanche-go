import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CarrinhoService } from '../../services/carrinho.service';
import { ItemCarrinho } from '../../models/menu.model';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss'],
  standalone: false
})
export class CarrinhoComponent implements OnInit {
  @Input() compact = false;
  
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
    // TODO: Implementar lógica de finalização do pedido
    // Por enquanto, apenas mostra um alerta
    alert('Funcionalidade de finalização do pedido será implementada em breve!');
  }

  continuarComprando(): void {
    // Fecha dialogs se houver algum aberto
    this.dialog.closeAll();
    
    // Navega de volta para o dashboard (não é necessário se já estamos nele)
    // this.router.navigate(['/clientes']);
  }
}