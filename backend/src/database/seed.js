import { query } from '../config/database.js';

// Dados do menu (mesmos do frontend)
const menuItemsData = [
  // Lanches
  {
    nome: 'X-Burger Clássico',
    descricao: 'Hambúrguer bovino, queijo, alface, tomate, cebola e molho especial',
    preco: 18.90,
    categoria: 'lanche',
    disponivel: true,
    ingredientes: ['Pão de hambúrguer', 'Hambúrguer bovino 150g', 'Queijo cheddar', 'Alface', 'Tomate', 'Cebola', 'Molho especial'],
    tags: ['popular', 'clássico'],
    imagem: 'assets/images/x-burger-classico.jpg'
  },
  {
    nome: 'X-Bacon Deluxe',
    descricao: 'Duplo hambúrguer, bacon crocante, queijo, alface e molho barbecue',
    preco: 24.90,
    categoria: 'lanche',
    disponivel: true,
    ingredientes: ['Pão brioche', 'Duplo hambúrguer bovino', 'Bacon', 'Queijo', 'Alface', 'Molho barbecue'],
    tags: ['premium', 'bacon'],
    imagem: 'assets/images/x-bacon-deluxe.jpg'
  },
  {
    nome: 'Chicken Crispy',
    descricao: 'Frango empanado crocante, maionese temperada, alface e tomate',
    preco: 16.90,
    categoria: 'lanche',
    disponivel: true,
    ingredientes: ['Pão de hambúrguer', 'Peito de frango empanado', 'Maionese temperada', 'Alface', 'Tomate'],
    tags: ['frango', 'crocante'],
    imagem: 'assets/images/chicken-crispy.jpg'
  },
  {
    nome: 'Veggie Burger',
    descricao: 'Hambúrguer de grão-de-bico, queijo vegano, rúcula e tomate seco',
    preco: 19.90,
    categoria: 'lanche',
    disponivel: true,
    ingredientes: ['Pão integral', 'Hambúrguer de grão-de-bico', 'Queijo vegano', 'Rúcula', 'Tomate seco'],
    tags: ['vegetariano', 'saudável'],
    imagem: 'assets/images/veggie-burger.jpg'
  },

  // Petiscos
  {
    nome: 'Batata Frita Tradicional',
    descricao: 'Porção generosa de batatas fritas crocantes',
    preco: 12.90,
    categoria: 'petisco',
    disponivel: true,
    ingredientes: ['Batata', 'Sal'],
    tags: ['clássico', 'acompanhamento'],
    imagem: 'assets/images/batata-frita.jpg'
  },
  {
    nome: 'Onion Rings',
    descricao: 'Anéis de cebola empanados e fritos',
    preco: 14.90,
    categoria: 'petisco',
    disponivel: true,
    ingredientes: ['Cebola', 'Farinha de rosca', 'Temperos'],
    tags: ['crocante', 'cebola'],
    imagem: 'assets/images/onion-rings.jpg'
  },
  {
    nome: 'Nuggets de Frango',
    descricao: '10 unidades de nuggets crocantes com molho a escolha',
    preco: 16.90,
    categoria: 'petisco',
    disponivel: true,
    ingredientes: ['Peito de frango', 'Farinha de rosca', 'Molhos diversos'],
    tags: ['frango', 'porção'],
    imagem: 'assets/images/nuggets.jpg'
  },

  // Bebidas
  {
    nome: 'Refrigerante Lata',
    descricao: 'Coca-Cola, Guaraná, Fanta ou Sprite',
    preco: 4.50,
    categoria: 'bebida',
    disponivel: true,
    ingredientes: ['Refrigerante 350ml'],
    tags: ['gelado'],
    imagem: 'assets/images/refrigerante.jpg'
  },
  {
    nome: 'Suco Natural',
    descricao: 'Laranja, acerola, manga ou abacaxi - 500ml',
    preco: 7.90,
    categoria: 'bebida',
    disponivel: true,
    ingredientes: ['Fruta fresca', 'Água', 'Açúcar opcional'],
    tags: ['natural', 'saudável'],
    imagem: 'assets/images/suco-natural.jpg'
  },
  {
    nome: 'Milkshake',
    descricao: 'Chocolate, morango ou baunilha - 400ml',
    preco: 12.90,
    categoria: 'bebida',
    disponivel: true,
    ingredientes: ['Leite', 'Sorvete', 'Calda', 'Chantilly'],
    tags: ['cremoso', 'gelado'],
    imagem: 'assets/images/milkshake.jpg'
  },

  // Sobremesas
  {
    nome: 'Brownie com Sorvete',
    descricao: 'Brownie quentinho com sorvete de baunilha e calda de chocolate',
    preco: 14.90,
    categoria: 'sobremesa',
    disponivel: true,
    ingredientes: ['Brownie de chocolate', 'Sorvete de baunilha', 'Calda de chocolate'],
    tags: ['quente', 'chocolate'],
    imagem: 'assets/images/brownie.jpg'
  },
  {
    nome: 'Açaí na Tigela',
    descricao: 'Açaí cremoso com granola, banana e mel',
    preco: 11.90,
    categoria: 'sobremesa',
    disponivel: true,
    ingredientes: ['Açaí', 'Granola', 'Banana', 'Mel'],
    tags: ['natural', 'saudável'],
    imagem: 'assets/images/acai.jpg'
  }
];

// Dados das categorias
const categoriasData = [
  {
    nome: 'Lanches',
    descricao: 'Hambúrgueres e sanduíches artesanais',
    icone: 'lunch_dining'
  },
  {
    nome: 'Bebidas',
    descricao: 'Refrigerantes, sucos naturais e milkshakes',
    icone: 'local_drink'
  },
  {
    nome: 'Sobremesas',
    descricao: 'Doces e sobremesas especiais',
    icone: 'cake'
  },
  {
    nome: 'Petiscos',
    descricao: 'Porções e acompanhamentos',
    icone: 'set_meal'
  }
];

// Função para inserir categorias
const insertCategorias = async () => {
  console.log('📂 Inserindo categorias...');
  
  for (const categoria of categoriasData) {
    const sql = `
      INSERT INTO categorias (nome, descricao, icone)
      VALUES ($1, $2, $3)
      ON CONFLICT (nome) DO NOTHING
    `;
    
    await query(sql, [categoria.nome, categoria.descricao, categoria.icone]);
    console.log(`✅ Categoria inserida: ${categoria.nome}`);
  }
};

// Função para inserir itens do menu
const insertMenuItems = async () => {
  console.log('🍔 Inserindo itens do menu...');
  
  for (const item of menuItemsData) {
    const sql = `
      INSERT INTO menu_items 
      (nome, descricao, preco, categoria, imagem, disponivel, ingredientes, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    await query(sql, [
      item.nome,
      item.descricao,
      item.preco,
      item.categoria,
      item.imagem,
      item.disponivel,
      item.ingredientes,
      item.tags
    ]);
    
    console.log(`✅ Item inserido: ${item.nome} - R$ ${item.preco}`);
  }
};

// Função principal para popular o banco
export const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando população do banco de dados...');
    
    await insertCategorias();
    await insertMenuItems();
    
    console.log('🎉 Banco de dados populado com sucesso!');
    console.log(`📊 ${categoriasData.length} categorias e ${menuItemsData.length} itens inseridos`);
    
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Processo de seeding concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no processo de seeding:', error);
      process.exit(1);
    });
}