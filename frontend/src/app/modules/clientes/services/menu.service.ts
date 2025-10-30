import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MenuItem, MenuCategory } from '../models/menu.model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems: MenuItem[] = [
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

  private menuSubject = new BehaviorSubject<MenuItem[]>(this.menuItems);

  constructor() {}

  getMenuItems(): Observable<MenuItem[]> {
    return this.menuSubject.asObservable();
  }

  getMenuItemsByCategory(category: MenuCategory): Observable<MenuItem[]> {
    return new Observable(observer => {
      const items = this.menuItems.filter(item => item.categoria === category && item.disponivel);
      observer.next(items);
      observer.complete();
    });
  }

  getMenuItemById(id: number): MenuItem | undefined {
    return this.menuItems.find(item => item.id === id);
  }

  searchMenuItems(query: string): Observable<MenuItem[]> {
    return new Observable(observer => {
      const items = this.menuItems.filter(item => 
        item.disponivel && (
          item.nome.toLowerCase().includes(query.toLowerCase()) ||
          item.descricao.toLowerCase().includes(query.toLowerCase()) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
      );
      observer.next(items);
      observer.complete();
    });
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
}