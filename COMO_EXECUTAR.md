# 🚀 Como Executar o LancheGo

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- **Node.js 18+** - [Download aqui](https://nodejs.org/)
- **npm** (vem com Node.js) ou **yarn**
- **Angular CLI** (opcional, mas recomendado)

## Passos para Executar

### 1. Navegar para o diretório do projeto
```bash
cd c:\ws\teste\lanche-go\frontend
```

### 2. Instalar o Angular CLI (se não tiver)
```bash
npm install -g @angular/cli
```

### 3. Instalar as dependências
```bash
npm install
```

### 4. Executar o projeto
```bash
ng serve
```

Ou usando npm:
```bash
npm start
```

### 5. Acessar a aplicação
Abra o navegador e acesse: `http://localhost:4200`

## 🔐 Login de Demonstração

Para acessar o sistema, use as credenciais:
- **Email**: demo@lanchego.com
- **Senha**: 123456

## 📱 Funcionalidades Disponíveis

### ✅ Módulo Clientes (Totalmente Funcional)
1. Faça login e selecione o módulo "Clientes"
2. Navegue pelo cardápio usando os filtros de categoria
3. Use a barra de busca para encontrar itens específicos
4. Adicione itens ao carrinho
5. Clique no ícone do carrinho para finalizar o pedido
6. Preencha os dados e confirme o pedido

### 🚧 Outros Módulos (Interface Básica)
- **Cozinha**: Dashboard informativo
- **Gerente**: Dashboard informativo  
- **Admin**: Dashboard informativo

## 🛠️ Comandos Úteis

```bash
# Servidor de desenvolvimento
ng serve

# Build para produção
ng build --prod

# Executar testes
ng test

# Verificar versão do Angular
ng version
```

## 🐛 Possíveis Problemas

### Erro: "Cannot find module '@angular/...'"
**Solução**: Execute `npm install` novamente

### Erro: "ng is not recognized"
**Solução**: Instale o Angular CLI globalmente
```bash
npm install -g @angular/cli
```

### Porta já em uso
**Solução**: Use uma porta diferente
```bash
ng serve --port 4201
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o Node.js está instalado corretamente
2. Certifique-se de estar no diretório correto
3. Execute `npm install` antes de iniciar
4. Verifique se não há outros projetos Angular rodando na mesma porta

## 🎯 Próximos Passos

Após executar o projeto, explore:
1. **Tela de login** - Teste o sistema de autenticação
2. **Módulo Clientes** - Funcionalidade completa de pedidos
3. **Interface responsiva** - Teste em diferentes tamanhos de tela
4. **Fluxo completo** - Do login até a finalização do pedido

---

**Desenvolvido com Angular 19 + Material Design** 🍔