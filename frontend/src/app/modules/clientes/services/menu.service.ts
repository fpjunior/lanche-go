import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MenuItem, MenuCategory } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:3002/api/menu';
  private menuSubject = new BehaviorSubject<MenuItem[]>([]);

  constructor(private http: HttpClient) {
    // Carregar dados iniciais
    this.loadMenuItems();
  }

  private loadMenuItems(): void {
    this.getMenuItems().subscribe(items => {
      this.menuSubject.next(items);
    });
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<{status: string, data: MenuItem[]}>(`http://localhost:3002/api/menu-items`)
      .pipe(
        map(response => {
          console.log('🔍 [MENU SERVICE] Dados REAIS recebidos do backend:', response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ [MENU SERVICE] Erro ao buscar itens - usando dados MOCK:', error);
          // Retornar dados mock em caso de erro
          return of(this.getMockData());
        })
      );
  }

  getMenuItemsByCategory(category: MenuCategory): Observable<MenuItem[]> {
    console.log('🔍 [MENU SERVICE] Buscando itens por categoria:', category);
    return this.http.get<{success: boolean, data: MenuItem[]}>(`${this.apiUrl}/categoria/${category}`)
      .pipe(
        map(response => {
          console.log('🔍 [MENU SERVICE] Resposta por categoria:', response);
          console.log('🔍 [MENU SERVICE] Dados por categoria:', response.data);
          return response.data;
        }),
        catchError(error => {
          console.error('❌ [MENU SERVICE] Erro ao buscar itens por categoria:', error);
          return of(this.getMockData().filter(item => item.categoria === category));
        })
      );
  }

  getMenuItemById(id: number): Observable<MenuItem | undefined> {
    return this.http.get<{success: boolean, data: MenuItem}>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Erro ao buscar item por ID:', error);
          return of(this.getMockData().find(item => item.id === id));
        })
      );
  }

  // Método compatível com a interface antiga (para não quebrar componentes)
  getMenuItemByIdSync(id: number): MenuItem | undefined {
    // Este método agora é síncrono apenas para compatibilidade
    // Em produção, deve-se usar getMenuItemById que retorna Observable
    const mockData = this.getMockData();
    return mockData.find(item => item.id === id);
  }

  // Manter compatibilidade com o código existente
  // TODO: Migrar para versão assíncrona
  getMenuItemByIdLegacy(id: number): MenuItem | undefined {
    return this.getMenuItemByIdSync(id);
  }

  searchMenuItems(query: string): Observable<MenuItem[]> {
    return this.http.get<{success: boolean, data: MenuItem[]}>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Erro ao buscar itens:', error);
        // Busca local nos dados mock em caso de erro
        const mockData = this.getMockData();
        const filteredItems = mockData.filter(item => 
          item.disponivel && (
            item.nome.toLowerCase().includes(query.toLowerCase()) ||
            item.descricao.toLowerCase().includes(query.toLowerCase()) ||
            item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          )
        );
        return of(filteredItems);
      })
    );
  }

  getCategories(): MenuCategory[] {
    return Object.values(MenuCategory);
  }

  getCategoryLabel(category: MenuCategory): string {
    const labels: { [key in MenuCategory]: string } = {
      [MenuCategory.LANCHE]: 'Lanches',
      [MenuCategory.BEBIDA]: 'Bebidas',
      [MenuCategory.SOBREMESA]: 'Sobremesas',
      [MenuCategory.PETISCO]: 'Petiscos'
    };
    return labels[category];
  }

  getCategoryIcon(category: MenuCategory): string {
    const icons: { [key in MenuCategory]: string } = {
      [MenuCategory.LANCHE]: 'lunch_dining',
      [MenuCategory.BEBIDA]: 'local_drink',
      [MenuCategory.SOBREMESA]: 'cake',
      [MenuCategory.PETISCO]: 'set_meal'
    };
    return icons[category];
  }

  // Dados mock para fallback em caso de erro na API
  private getMockData(): MenuItem[] {
    return [
      // Lanches
      {
        id: 1,
        nome: 'X-Burger Clássico',
        descricao: 'Hambúrguer bovino, queijo, alface, tomate, cebola e molho especial',
        preco: 18.90,
        categoria: MenuCategory.LANCHE,
        disponivel: true,
        ingredientes: ['Pão de hambúrguer', 'Hambúrguer bovino 150g', 'Queijo cheddar', 'Alface', 'Tomate', 'Cebola', 'Molho especial'],
        tags: ['popular', 'clássico'],
        imagem: 'assets/images/x-burger-classico.jpg'
      },
      {
        id: 2,
        nome: 'X-Bacon Deluxe',
        descricao: 'Duplo hambúrguer, bacon crocante, queijo, alface e molho barbecue',
        preco: 24.90,
        categoria: MenuCategory.LANCHE,
        disponivel: true,
        ingredientes: ['Pão brioche', 'Duplo hambúrguer bovino', 'Bacon', 'Queijo', 'Alface', 'Molho barbecue'],
        tags: ['premium', 'bacon'],
        imagem: 'assets/images/x-bacon-deluxe.jpg'
      },
      {
        id: 3,
        nome: 'Chicken Crispy',
        descricao: 'Frango empanado crocante, maionese temperada, alface e tomate',
        preco: 16.90,
        categoria: MenuCategory.LANCHE,
        disponivel: true,
        ingredientes: ['Pão de hambúrguer', 'Peito de frango empanado', 'Maionese temperada', 'Alface', 'Tomate'],
        tags: ['frango', 'crocante'],
        imagem: 'assets/images/chicken-crispy.jpg'
      },
      {
        id: 4,
        nome: 'Veggie Burger',
        descricao: 'Hambúrguer de grão-de-bico, queijo vegano, rúcula e tomate seco',
        preco: 19.90,
        categoria: MenuCategory.LANCHE,
        disponivel: true,
        ingredientes: ['Pão integral', 'Hambúrguer de grão-de-bico', 'Queijo vegano', 'Rúcula', 'Tomate seco'],
        tags: ['vegetariano', 'saudável'],
        imagem: 'assets/images/veggie-burger.jpg'
      },

      // Petiscos
      {
        id: 5,
        nome: 'Batata Frita Tradicional',
        descricao: 'Porção generosa de batatas fritas crocantes',
        preco: 12.90,
        categoria: MenuCategory.PETISCO,
        disponivel: true,
        ingredientes: ['Batata', 'Sal'],
        tags: ['clássico', 'acompanhamento'],
        imagem: 'assets/images/batata-frita.jpg'
      },
      {
        id: 6,
        nome: 'Onion Rings',
        descricao: 'Anéis de cebola empanados e fritos',
        preco: 14.90,
        categoria: MenuCategory.PETISCO,
        disponivel: true,
        ingredientes: ['Cebola', 'Farinha de rosca', 'Temperos'],
        tags: ['crocante', 'cebola'],
        imagem: 'assets/images/onion-rings.jpg'
      },
      {
        id: 7,
        nome: 'Nuggets de Frango',
        descricao: '10 unidades de nuggets crocantes com molho a escolha',
        preco: 16.90,
        categoria: MenuCategory.PETISCO,
        disponivel: true,
        ingredientes: ['Peito de frango', 'Farinha de rosca', 'Molhos diversos'],
        tags: ['frango', 'porção'],
        imagem: 'assets/images/nuggets.jpg'
      },

      // Bebidas
      {
        id: 8,
        nome: 'Refrigerante Lata',
        descricao: 'Coca-Cola, Guaraná, Fanta ou Sprite',
        preco: 4.50,
        categoria: MenuCategory.BEBIDA,
        disponivel: true,
        ingredientes: ['Refrigerante 350ml'],
        tags: ['gelado'],
        imagem: 'assets/images/refrigerante.jpg'
      },
      {
        id: 9,
        nome: 'Suco Natural',
        descricao: 'Laranja, acerola, manga ou abacaxi - 500ml',
        preco: 7.90,
        categoria: MenuCategory.BEBIDA,
        disponivel: true,
        ingredientes: ['Fruta fresca', 'Água', 'Açúcar opcional'],
        tags: ['natural', 'saudável'],
        imagem: 'assets/images/suco-natural.jpg'
      },
      {
        id: 10,
        nome: 'Milkshake',
        descricao: 'Chocolate, morango ou baunilha - 400ml',
        preco: 12.90,
        categoria: MenuCategory.BEBIDA,
        disponivel: true,
        ingredientes: ['Leite', 'Sorvete', 'Calda', 'Chantilly'],
        tags: ['cremoso', 'gelado'],
        imagem: 'assets/images/milkshake.jpg'
      },

      // Sobremesas
      {
        id: 11,
        nome: 'Brownie com Sorvete',
        descricao: 'Brownie quentinho com sorvete de baunilha e calda de chocolate',
        preco: 14.90,
        categoria: MenuCategory.SOBREMESA,
        disponivel: true,
        ingredientes: ['Brownie de chocolate', 'Sorvete de baunilha', 'Calda de chocolate'],
        tags: ['quente', 'chocolate'],
        imagem: 'assets/images/brownie.jpg'
      },
      {
        id: 12,
        nome: 'Açaí na Tigela',
        descricao: 'Açaí cremoso com granola, banana e mel',
        preco: 11.90,
        categoria: MenuCategory.SOBREMESA,
        disponivel: true,
        ingredientes: ['Açaí', 'Granola', 'Banana', 'Mel'],
        tags: ['natural', 'saudável'],
        imagem: 'assets/images/acai.jpg'
      }
    ];
  }
}