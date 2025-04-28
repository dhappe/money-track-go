
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { isThisMonth } from 'date-fns';
import { Progress } from '@/components/ui/progress';

const PlanningPage: React.FC = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(t => isThisMonth(t.date));
  
  const incomes = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate savings rate and spending by category
  const savingsRate = incomes > 0 ? ((incomes - expenses) / incomes) * 100 : 0;
  
  // Get expenses by category
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: (amount / expenses) * 100
    }));

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Planejamento</h1>
        <p className="text-muted-foreground">Analise seus gastos e economias</p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Taxa de economia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">
                {savingsRate.toFixed(0)}%
              </span>
              <span className="text-sm text-muted-foreground">
                Meta: 20%
              </span>
            </div>
            <Progress 
              value={savingsRate} 
              className={`h-2 ${savingsRate >= 20 ? 'bg-secondary/20' : 'bg-destructive/20'}`} 
            />
            <p className="text-sm text-muted-foreground mt-2">
              {savingsRate >= 20 
                ? 'Parabéns! Você está economizando uma boa parte da sua renda.' 
                : 'Tente economizar pelo menos 20% da sua renda mensal.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Distribuição de gastos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedCategories.length > 0 ? (
            sortedCategories.map(category => (
              <div key={category.name} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm">
                    {formatCurrency(category.amount)} ({category.percentage.toFixed(0)}%)
                  </span>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma despesa registrada neste mês
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Dicas para economizar</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="py-2 border-b border-border">
              Reserve de 10% a 20% da sua renda mensal para um fundo de emergências.
            </li>
            <li className="py-2 border-b border-border">
              Use a regra 50/30/20: 50% para necessidades, 30% para desejos e 20% para poupança.
            </li>
            <li className="py-2 border-b border-border">
              Revise assinaturas e serviços mensais para identificar economias potenciais.
            </li>
            <li className="py-2">
              Considere investir parte das suas economias para proteger-se da inflação.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export default PlanningPage;
