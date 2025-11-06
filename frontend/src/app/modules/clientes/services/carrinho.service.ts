import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemCarrinho, MenuItem, Pedido, StatusPedido, ClienteInfo } from '../models/menu.model';
import { OrderService, CreateOrderRequest } from '../../../services/order.service';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private itensCarrinho: ItemCarrinho[] = [];
  private carrinhoSubject = new BehaviorSubject<ItemCarrinho[]>([]);
  private totalSubject = new BehaviorSubject<number>(0);

  constructor(private orderService: OrderService) {}

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

  getQuantidadeItem(menuItemId: number): number {
    const item = this.itensCarrinho.find(item => item.menuItem.id === menuItemId);
    return item ? item.quantidade : 0;
  }

  diminuirQuantidade(menuItemId: number): void {
    const itemIndex = this.itensCarrinho.findIndex(item => item.menuItem.id === menuItemId);
    if (itemIndex >= 0) {
      const item = this.itensCarrinho[itemIndex];
      if (item.quantidade > 1) {
        item.quantidade--;
        item.subtotal = item.quantidade * item.menuItem.preco;
        this.atualizarCarrinho();
      } else {
        this.removerItem(itemIndex);
      }
    }
  }

  criarPedido(clienteInfo: ClienteInfo, observacoesGerais?: string): Observable<Pedido> {
    // Preparar dados do pedido para o backend
    const orderData: CreateOrderRequest = {
      cliente_nome: clienteInfo.nome,
      cliente_telefone: clienteInfo.telefone || '',
      cliente_email: '', // Pode ser adicionado no futuro
      endereco_entrega: clienteInfo.mesa ? `Mesa ${clienteInfo.mesa}` : undefined,
      metodo_pagamento: 'dinheiro', // Pode ser configurável no futuro
      observacoes: observacoesGerais,
      itens: this.itensCarrinho.map(item => ({
        menu_item_id: item.menuItem.id,
        nome_item: item.menuItem.nome,
        preco_unitario: item.menuItem.preco,
        quantidade: item.quantidade,
        observacoes: item.observacoes
      }))
    };

    return new Observable(observer => {
      this.orderService.createOrder(orderData).subscribe({
        next: (response) => {
          
          // Converter resposta do backend para formato local
          const novoPedido: Pedido = {
            id: response.data.id,
            itens: [...this.itensCarrinho],
            total: response.data.total,
            status: StatusPedido.NOVO,
            dataHora: new Date(response.data.created_at),
            observacoesGerais,
            clienteInfo
          };

          // Limpar carrinho após criar pedido
          this.limparCarrinho();
          
          observer.next(novoPedido);
          observer.complete();
        },
        error: (error) => {
          console.error('❌ Erro ao criar pedido no backend:', error);
          observer.error(error);
        }
      });
    });
  }
}