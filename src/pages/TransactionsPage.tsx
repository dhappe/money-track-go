
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { formatDistanceToNow, format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Wallet, PiggyBank, Calendar, Edit, Trash2 } from 'lucide-react';
import { Transaction, TransactionType } from '@/types';

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const { transactions, deleteTransaction, categories } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         transaction.category.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    
    const matchesCategory = filterCategory === 'all' || transaction.category.id === filterCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Group transactions by date
  const groupedTransactions: { [date: string]: Transaction[] } = {};
  
  filteredTransactions.forEach(transaction => {
    const dateStr = format(transaction.date, 'yyyy-MM-dd');
    if (!groupedTransactions[dateStr]) {
      groupedTransactions[dateStr] = [];
    }
    groupedTransactions[dateStr].push(transaction);
  });

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transações</h1>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select defaultValue="all" onValueChange={setFilterType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all" onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedDates.length > 0 ? (
          sortedDates.map(dateStr => (
            <div key={dateStr}>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                {getFormattedDate(new Date(dateStr))}
              </h2>
              <div className="space-y-3">
                {groupedTransactions[dateStr].map(transaction => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction}
                    onDelete={() => deleteTransaction(transaction.id)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <div className="text-muted-foreground mb-3">Nenhuma transação encontrada</div>
            <Button asChild>
              <Link to="/add-transaction">Adicionar transação</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onDelete }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${transaction.type === 'income' ? 'bg-green-100 text-income' : 'bg-red-100 text-expense'}`}>
              {transaction.type === 'income' ? 
                <Wallet size={20} /> : 
                getCategoryIcon(transaction.category.icon)}
            </div>
            
            <div>
              <h3 className="font-medium">
                {transaction.category.name}
              </h3>
              {transaction.description && (
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={`font-medium ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
            </span>
            <div className="flex items-center mt-1">
              <Link to={`/edit-transaction/${transaction.id}`} className="p-1 text-muted-foreground hover:text-foreground">
                <Edit size={16} />
              </Link>
              <button 
                onClick={onDelete}
                className="p-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

function getFormattedDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  if (isSameDay(date, today)) {
    return 'Hoje';
  } else if (isSameDay(date, yesterday)) {
    return 'Ontem';
  } else {
    return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
  }
}

function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case 'wallet':
      return <Wallet size={20} />;
    case 'piggy-bank':
      return <PiggyBank size={20} />;
    default:
      return <Calendar size={20} />;
  }
}

export default TransactionsPage;
