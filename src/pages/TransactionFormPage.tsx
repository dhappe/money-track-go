
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Category, Transaction, TransactionType } from '@/types';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TransactionFormPage: React.FC = () => {
  const { user } = useAuth();
  const { transactions, addTransaction, updateTransaction, categories } = useTransactions();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Load transaction if editing
  useEffect(() => {
    if (id) {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setDate(transaction.date);
        setCategory(transaction.category);
        setDescription(transaction.description || '');
      }
    } else {
      // Set default category based on type
      const defaultCategory = categories.find(c => c.type === type);
      if (defaultCategory) {
        setCategory(defaultCategory);
      }
    }
  }, [id, transactions, categories, type]);

  // Update default category when type changes (only for new transactions)
  useEffect(() => {
    if (!id) {
      const defaultCategory = categories.find(c => c.type === type);
      if (defaultCategory) {
        setCategory(defaultCategory);
      }
    }
  }, [type, categories, id]);

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and one decimal point
    const value = e.target.value.replace(/[^\d.]/g, '');
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      return;
    }
    setAmount(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Por favor, informe um valor válido.');
      return;
    }

    if (!category) {
      setFormError('Por favor, selecione uma categoria.');
      return;
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      date,
      category,
      description: description.trim() || undefined,
    };

    if (id) {
      updateTransaction(id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    navigate(-1);
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl">
            {id ? 'Editar transação' : 'Nova transação'}
          </CardTitle>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Tabs 
              defaultValue={type} 
              onValueChange={(v) => setType(v as TransactionType)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="expense">Despesa</TabsTrigger>
                <TabsTrigger value="income">Receita</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Valor
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">R$</span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0,00"
                  className="pl-10"
                  value={amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Data
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Categoria
              </label>
              <div className="grid grid-cols-3 gap-2">
                {filteredCategories.map(cat => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={category?.id === cat.id ? "default" : "outline"}
                    onClick={() => setCategory(cat)}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    {getCategoryIcon(cat.icon)}
                    <span className="mt-1 text-xs">{cat.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <Textarea
                id="description"
                placeholder="Insira uma descrição para a transação"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            {formError && (
              <div className="text-destructive text-sm">{formError}</div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {id ? 'Atualizar' : 'Adicionar'} 
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

// Helper functions
function getCategoryIcon(iconName: string) {
  const iconSize = 24;
  
  switch (iconName) {
    case 'wallet':
      return <Wallet size={iconSize} />;
    case 'piggy-bank':
      return <PiggyBank size={iconSize} />;
    default:
      return <CalendarIcon size={iconSize} />;
  }
}

const Wallet = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);

const PiggyBank = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2 0-.3-.5-2-3-2Z"/>
    <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
    <path d="M16 11a2 2 0 0 0-4 0"/>
  </svg>
);

export default TransactionFormPage;
