import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacoes?: string;
  image_url?: string;
  categoria?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'lanche_go_cart';
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());

  constructor() {
    // Carregar carrinho do localStorage na inicialização
    this.loadCartFromStorage();
  }

  get cart$(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  get currentCart(): Cart {
    return this.cartSubject.value;
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      total: 0,
      itemCount: 0
    };
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(this.STORAGE_KEY);
      if (savedCart) {
        const cart = JSON.parse(savedCart);
        this.cartSubject.next(cart);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
      this.clearCart();
    }
  }

  private saveCartToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentCart));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }

  private calculateCartTotals(): Cart {
    const items = this.currentCart.items;
    const total = items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantidade, 0);

    return {
      items,
      total: Number(total.toFixed(2)),
      itemCount
    };
  }

  addToCart(item: any, quantidade: number = 1, observacoes?: string): void {
    const currentCart = this.currentCart;
    const existingItemIndex = currentCart.items.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      // Item já existe no carrinho, aumentar quantidade
      currentCart.items[existingItemIndex].quantidade += quantidade;
      if (observacoes) {
        currentCart.items[existingItemIndex].observacoes = observacoes;
      }
    } else {
      // Novo item no carrinho
      const cartItem: CartItem = {
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        quantidade,
        observacoes,
        image_url: item.image_url,
        categoria: item.categoria
      };
      currentCart.items.push(cartItem);
    }

    const updatedCart = this.calculateCartTotals();
    this.cartSubject.next(updatedCart);
    this.saveCartToStorage();
  }

  removeFromCart(itemId: number): void {
    const currentCart = this.currentCart;
    currentCart.items = currentCart.items.filter(item => item.id !== itemId);
    
    const updatedCart = this.calculateCartTotals();
    this.cartSubject.next(updatedCart);
    this.saveCartToStorage();
  }

  updateQuantity(itemId: number, novaQuantidade: number): void {
    if (novaQuantidade <= 0) {
      this.removeFromCart(itemId);
      return;
    }

    const currentCart = this.currentCart;
    const itemIndex = currentCart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      currentCart.items[itemIndex].quantidade = novaQuantidade;
      const updatedCart = this.calculateCartTotals();
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage();
    }
  }

  updateObservacoes(itemId: number, observacoes: string): void {
    const currentCart = this.currentCart;
    const itemIndex = currentCart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex >= 0) {
      currentCart.items[itemIndex].observacoes = observacoes;
      this.cartSubject.next(currentCart);
      this.saveCartToStorage();
    }
  }

  clearCart(): void {
    const emptyCart = this.getInitialCart();
    this.cartSubject.next(emptyCart);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getItemQuantity(itemId: number): number {
    const item = this.currentCart.items.find(cartItem => cartItem.id === itemId);
    return item ? item.quantidade : 0;
  }

  isInCart(itemId: number): boolean {
    return this.currentCart.items.some(item => item.id === itemId);
  }

  getTotalItems(): number {
    return this.currentCart.itemCount;
  }

  getTotalPrice(): number {
    return this.currentCart.total;
  }

  // Formato para enviar ao backend
  getCartForCheckout(): any {
    return {
      itens: this.currentCart.items.map(item => ({
        menu_item_id: item.id,
        nome_item: item.nome,
        preco_unitario: item.preco,
        quantidade: item.quantidade,
        observacoes: item.observacoes || ''
      })),
      total: this.currentCart.total
    };
  }
}