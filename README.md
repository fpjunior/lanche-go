# LancheGo - Sistema de Lanchonete

## 🍔 Sobre o Projeto

LancheGo é um sistema completo para lanchonetes desenvolvido em Angular 19 com Material Design. O projeto é baseado na estrutura do prontuário eletrônico e foi adaptado para atender às necessidades específicas de uma lanchonete.

## 🏗️ Arquitetura

O sistema é organizado em módulos funcionais:

- **Clientes**: Interface para clientes fazerem pedidos
- **Cozinha**: Gerenciamento de pedidos e preparação
- **Gerente**: Dashboard com relatórios e analytics
- **Admin**: Administração completa do sistema

## 🚀 Funcionalidades Implementadas

### ✅ Módulo de Clientes (Funcional)
- **Catálogo de produtos** com categorias (Lanches, Bebidas, Sobremesas, Petiscos)
- **Sistema de carrinho** com controle de quantidade
- **Busca e filtros** por categoria
- **Finalização de pedido** com dados do cliente
- **Interface responsiva** e amigável

### 🔧 Outros Módulos (Em Desenvolvimento)
- Cozinha: Dashboard básico criado
- Gerente: Dashboard básico criado  
- Admin: Dashboard básico criado

## 🛠️ Tecnologias Utilizadas

- **Angular 19** - Framework principal
- **Angular Material** - Componentes UI
- **TypeScript** - Linguagem de programação
- **SCSS** - Estilização
- **RxJS** - Programação reativa

## 📁 Estrutura do Projeto

```
lanche-go/frontend/
├── src/
│   ├── app/
│   │   ├── auth/                 # Autenticação
│   │   │   ├── login/            # Componente de login
│   │   │   ├── auth.service.ts   # Serviço de autenticação
│   │   │   ├── auth.guard.ts     # Guard de autenticação
│   │   │   └── module.guard.ts   # Guard de módulos
│   │   ├── home/                 # Página inicial
│   │   ├── modules/              # Módulos funcionais
│   │   │   ├── clientes/         # Módulo de clientes
│   │   │   │   ├── components/   # Componentes
│   │   │   │   ├── models/       # Modelos de dados
│   │   │   │   └── services/     # Serviços
│   │   │   ├── cozinha/          # Módulo da cozinha
│   │   │   ├── gerente/          # Módulo gerencial
│   │   │   └── admin/            # Módulo administrativo
│   │   ├── app-routing.module.ts # Roteamento principal
│   │   ├── app.component.*       # Componente raiz
│   │   └── app.module.ts         # Módulo principal
│   └── environments/             # Configurações de ambiente
├── package.json                  # Dependências
├── angular.json                  # Configuração do Angular
└── tsconfig.json                 # Configuração TypeScript
```

## 🔐 Sistema de Autenticação

### Login Demo
- **Email**: demo@lanchego.com
- **Senha**: 123456
- **Módulos disponíveis**: Clientes, Cozinha, Gerente, Admin

### Funcionalidades de Auth
- Autenticação por email/senha
- Seleção de módulo no login
- Guards de rota para proteger módulos
- Persistência de sessão no localStorage

## 🍽️ Módulo de Clientes - Detalhado

### Cardápio
O sistema possui um cardápio completo com:

#### 🍔 Lanches
- X-Burger Clássico (R$ 18,90)
- X-Bacon Deluxe (R$ 24,90)
- Chicken Crispy (R$ 16,90)
- Veggie Burger (R$ 19,90)

#### 🥤 Bebidas
- Refrigerante Lata (R$ 4,50)
- Suco Natural (R$ 7,90)
- Milkshake (R$ 12,90)

#### 🍰 Sobremesas
- Brownie com Sorvete (R$ 14,90)
- Açaí na Tigela (R$ 11,90)

#### 🍟 Petiscos
- Batata Frita Tradicional (R$ 12,90)
- Onion Rings (R$ 14,90)
- Nuggets de Frango (R$ 16,90)

### Funcionalidades do Cliente
1. **Navegação por categorias** - Filtros rápidos
2. **Busca inteligente** - Por nome, descrição ou tags
3. **Carrinho dinâmico** - Adicionar, remover, alterar quantidades
4. **Finalização em etapas**:
   - Revisão do pedido
   - Dados do cliente
   - Confirmação final

## 📱 Interface e UX

### Design System
- **Material Design** para consistência visual
- **Paleta de cores** profissional (Primary: Indigo, Accent: Pink)
- **Tipografia** Roboto para legibilidade
- **Iconografia** Material Icons

### Responsividade
- **Mobile First** - Interface otimizada para dispositivos móveis
- **Grid responsivo** - Adaptação automática de layout
- **Touch friendly** - Botões e controles adequados para toque

### Acessibilidade
- **ARIA labels** para leitores de tela
- **Contraste adequado** nas cores
- **Navegação por teclado** funcionional

## 🔄 Fluxo do Pedido

1. **Cliente acessa** o módulo de clientes
2. **Navega pelo cardápio** usando filtros ou busca
3. **Adiciona itens** ao carrinho
4. **Revisa o pedido** no carrinho
5. **Clica em finalizar** e abre o dialog
6. **Revisa os itens** (pode editar ainda)
7. **Informa dados pessoais** (nome obrigatório)
8. **Confirma o pedido** final
9. **Recebe confirmação** e pedido é enviado

## 🚧 Próximos Passos

### Fase 2 - Backend Integration
- [ ] API REST para persistência
- [ ] Autenticação JWT
- [ ] Banco de dados (PostgreSQL/MySQL)
- [ ] Upload de imagens dos produtos

### Fase 3 - Módulo Cozinha
- [ ] Fila de pedidos em tempo real
- [ ] Status de preparação
- [ ] Notificações automáticas
- [ ] Timer de preparação

### Fase 4 - Módulo Gerencial
- [ ] Dashboard com gráficos (Chart.js)
- [ ] Relatórios de vendas
- [ ] Análise de produtos mais vendidos
- [ ] Métricas de performance

### Fase 5 - Módulo Admin
- [ ] CRUD de produtos
- [ ] Gestão de usuários
- [ ] Configurações do sistema
- [ ] Backup e logs

### Fase 6 - Features Avançadas
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Integração com pagamentos
- [ ] Sistema de delivery
- [ ] Programa de fidelidade

## 🔧 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Angular CLI

### Instalação
```bash
# Navegar para o diretório do frontend
cd lanche-go/frontend

# Instalar dependências
npm install

# Instalar Angular CLI globalmente (se necessário)
npm install -g @angular/cli

# Executar em modo desenvolvimento
ng serve

# Ou usar npm script
npm start
```

### Build para Produção
```bash
# Build otimizado
ng build --configuration production

# Os arquivos estarão em dist/lanche-go/
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run build:dev` - Build para desenvolvimento
- `npm run watch` - Build com watch mode
- `npm test` - Executa testes unitários

## 🎯 Objetivos do Projeto

1. **Demonstrar competências** em Angular moderno
2. **Aplicar boas práticas** de desenvolvimento
3. **Criar interface usuário** intuitiva e eficiente
4. **Implementar arquitetura** escalável e mantível
5. **Usar TypeScript** de forma efetiva
6. **Aplicar Material Design** corretamente

## 🤝 Contribuição

Este é um projeto de demonstração baseado no prontuário eletrônico. O foco está na qualidade do código, arquitetura e experiência do usuário.

## 📄 Licença

Projeto desenvolvido para fins de demonstração e aprendizado.

---

**Desenvolvido com ❤️ usando Angular 19 + Material Design**