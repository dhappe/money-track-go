
# Documentação Técnica - Meu Bolso

## Visão Geral
Meu Bolso é uma aplicação web para gerenciamento de finanças pessoais, permitindo usuários rastrear despesas e receitas, categorizar transações e visualizar relatórios financeiros.

## Tecnologias Utilizadas

### Frontend
- React 18.3.x
- TypeScript
- Vite (Bundler)
- TailwindCSS (Estilização)
- Shadcn/ui (Componentes)
- Tanstack Query (Gerenciamento de Estado)
- React Router DOM (Roteamento)
- Date-fns (Manipulação de Datas)

### Armazenamento
- LocalStorage (Persistência de Dados)

## Estrutura do Projeto

### Diretórios Principais
```
src/
├── components/     # Componentes React reutilizáveis
├── contexts/       # Contextos React para gerenciamento de estado
├── hooks/         # Hooks personalizados
├── lib/           # Utilitários e funções auxiliares
├── pages/         # Componentes de página
└── types/         # Definições de tipos TypeScript
```

### Contextos
- `AuthContext`: Gerencia autenticação e estado do usuário
- `TransactionContext`: Gerencia transações e categorias

### Páginas Principais
- `/`: Dashboard principal
- `/login`: Página de login
- `/signup`: Página de cadastro
- `/transactions`: Lista de transações
- `/add-transaction`: Adicionar nova transação
- `/edit-transaction/:id`: Editar transação existente
- `/planning`: Planejamento financeiro
- `/account`: Configurações da conta

## Modelos de Dados

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: Date;
  category: Category;
  description?: string;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}
```

## Funcionalidades Principais

### Autenticação
- Registro de usuário com email e senha
- Login/Logout
- Persistência de sessão

### Gerenciamento de Transações
- CRUD completo de transações
- Categorização
- Filtros por tipo (receita/despesa)
- Ordenação por data

### Dashboard
- Resumo financeiro
- Gráficos de despesas/receitas
- Balanço mensal

## Persistência de Dados
A aplicação utiliza LocalStorage para persistência, com as seguintes chaves:
- `meu_bolso_users`: Armazena dados dos usuários
- `meu_bolso_current_user`: Armazena dados do usuário atual
- `meu_bolso_transactions`: Armazena transações do usuário

## Estilização e Tema
- Tema principal baseado em azul petróleo (#2C8C99)
- Design responsivo
- Suporte a tema claro/escuro
- Animações suaves para transições

## Boas Práticas
- Componentização para reusabilidade
- TypeScript para type safety
- Hooks personalizados para lógica reutilizável
- Contextos para gerenciamento de estado
- Validação de formulários
- Feedback visual para ações do usuário

## Manutenção e Desenvolvimento

### Adicionando Novas Features
1. Criar/atualizar tipos necessários em `/types`
2. Implementar lógica de negócio em contextos ou hooks
3. Criar componentes em `/components`
4. Integrar na interface em `/pages`

### Performance
- Lazy loading para rotas
- Memoização de componentes quando necessário
- Otimização de re-renders

### Segurança
- Validação de dados
- Sanitização de inputs
- Proteção de rotas autenticadas

## Ambiente de Desenvolvimento
```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview
```
