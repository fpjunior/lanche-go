import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemCarrinho, MenuItem, Pedido, StatusPedido, ClienteInfo } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private itensCarrinho: ItemCarrinho[] = [];
  private carrinhoSubject = new BehaviorSubject<ItemCarrinho[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);

  constructor() {}

  getItensCarrinho(): Observable<ItemCarrinho[]> {
    return this.carrinhoSubject.asObservable();
  }

  getTotal(): Observable<number> {
    return this.totalSubject.asObservable();
  }

  adicionarItem(menuItem: MenuItem, quantidade: number = 1, observacoes?: string): void {
    const itemExistente = this.itensCarrinho.find(item => 
      item.menuItem.id === menuItem.id && item.observacoes === observacoes
    );

    if (itemExistente) {
      itemExistente.quantidade += quantidade;
      itemExistente.subtotal = itemExistente.quantidade * itemExistente.menuItem.preco;
    } else {
      const novoItem: ItemCarrinho = {
        menuItem,
        quantidade,
        observacoes,
        subtotal: quantidade * menuItem.preco
      };
      this.itensCarrinho.push(novoItem);
    }

    this.atualizarCarrinho();
  }

  removerItem(index: number): void {
    if (index >= 0 && index < this.itensCarrinho.length) {
      this.itensCarrinho.splice(index, 1);
      this.atualizarCarrinho();
    }
  }

  atualizarQuantidade(index: number, novaQuantidade: number): void {
    if (index >= 0 && index < this.itensCarrinho.length && novaQuantidade > 0) {
      this.itensCarrinho[index].quantidade = novaQuantidade;
      this.itensCarrinho[index].subtotal = novaQuantidade * this.itensCarrinho[index].menuItem.preco;
      this.atualizarCarrinho();
    }
  }

  limparCarrinho(): void {
    this.itensCarrinho = [];
    this.atualizarCarrinho();
  }

  private atualizarCarrinho(): void {
    this.carrinhoSubject.next([...this.itensCarrinho]);
    this.calcularTotal();
  }

  private calcularTotal(): void {
    const total = this.itensCarrinho.reduce((acc, item) => acc + item.subtotal, 0);
    this.totalSubject.next(total);
  }

  getQuantidadeItens(): number {
    return this.itensCarrinho.reduce((acc, item) => acc + item.quantidade, 0);
  }

  criarPedido(clienteInfo: ClienteInfo, observacoesGerais?: string): Observable<Pedido> {
    return new Observable(observer => {
      const novoPedido: Pedido = {
        id: Date.now(), // Simulação de ID
        itens: [...this.itensCarrinho],
        total: this.totalSubject.value,
        status: StatusPedido.NOVO,
        dataHora: new Date(),
        observacoesGerais,
        clienteInfo
      };

      // Simular envio do pedido (delay de rede)
      setTimeout(() => {
        // Limpar carrinho após criar pedido
        this.limparCarrinho();
        observer.next(novoPedido);
        observer.complete();
      }, 1000);
    });
  }
}