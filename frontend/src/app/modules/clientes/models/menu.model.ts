export interface MenuItem {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: MenuCategory | string; // Permitir string para dados da API
  imagem?: string;
  disponivel: boolean;
  ingredientes?: string[];
  tags?: string[];
  has_image?: boolean; // Campo do backend
  image_url?: string; // Campo do backend
  created_at?: string;
  updated_at?: string;
}

export interface ItemCarrinho {
  menuItem: MenuItem;
  quantidade: number;
  observacoes?: string;
  subtotal: number;
}

export interface Pedido {
  id?: number;
  itens: ItemCarrinho[];
  total: number;
  status: StatusPedido;
  dataHora: Date;
  observacoesGerais?: string;
  clienteInfo?: ClienteInfo;
}

export interface ClienteInfo {
  nome: string;
  telefone?: string;
  mesa?: string;
}

export enum MenuCategory {
  LANCHE = 'lanche',
  BEBIDA = 'bebida',
  SOBREMESA = 'sobremesa',
  PETISCO = 'petisco'
}

export enum StatusPedido {
  NOVO = 'novo',
  CONFIRMADO = 'confirmado',
  PREPARANDO = 'preparando',
  PRONTO = 'pronto',
  ENTREGUE = 'entregue',
  CANCELADO = 'cancelado'
}