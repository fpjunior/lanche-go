import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CreateOrderRequest {
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  endereco_entrega?: string;
  metodo_pagamento?: string;
  observacoes?: string;
  itens: {
    menu_item_id: number;
    nome_item: string;
    preco_unitario: number;
    quantidade: number;
    observacoes?: string;
  }[];
}

export interface Order {
  id: number;
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email?: string;
  endereco_entrega?: string;
  total: number;
  status: string;
  metodo_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  itens: {
    id: number;
    menu_item_id: number;
    nome_item: string;
    preco_unitario: number;
    quantidade: number;
    subtotal: number;
    observacoes?: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.apiUrl, orderData).pipe(
      catchError((error: any) => {
        console.error('Erro na requisição:', error);
        throw error;
      })
    );
  }

  getOrders(filters?: {
    status?: string;
    cliente_telefone?: string;
    limit?: number;
  }): Observable<ApiResponse<Order[]>> {
    let params = new HttpParams();
    
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.cliente_telefone) {
      params = params.set('cliente_telefone', filters.cliente_telefone);
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ApiResponse<Order[]>>(this.apiUrl, { params });
  }

  getOrderById(id: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteOrder(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  // Métodos utilitários
  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'preparando': 'Preparando',
      'pronto': 'Pronto',
      'entregue': 'Entregue',
      'cancelado': 'Cancelado'
    };
    return statusLabels[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'pendente': 'warn',
      'confirmado': 'primary',
      'preparando': 'accent',
      'pronto': 'primary',
      'entregue': 'primary',
      'cancelado': 'warn'
    };
    return statusColors[status] || 'primary';
  }
}