
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, isThisMonth, isThisWeek, startOfMonth, endOfMonth, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction, TransactionType } from '@/types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const filteredTransactions = transactions.filter(transaction => 
    period === 'week' ? isThisWeek(transaction.date) : isThisMonth(transaction.date)
  );

  const incomes = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = incomes - expenses;

  // Prepare data for pie chart
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Prepare data for bar chart
  const prepareMonthlyData = () => {
    const currentMonth = new Date();
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    
    // Create a map of all days in the month
    const dailyData: Record<string, { date: string, income: number, expense: number }> = {};
    
    let day = firstDay;
    while (day <= lastDay) {
      const dateStr = format(day, 'dd');
      dailyData[dateStr] = { date: dateStr, income: 0, expense: 0 };
      day = new Date(day.getTime() + 86400000); // +1 day
    }
    
    // Fill in transaction data
    filteredTransactions.forEach(transaction => {
      const dateStr = format(transaction.date, 'dd');
      if (dailyData[dateStr]) {
        if (transaction.type === 'income') {
          dailyData[dateStr].income += transaction.amount;
        } else {
          dailyData[dateStr].expense += transaction.amount;
        }
      }
    });
    
    return Object.values(dailyData);
  };

  const barChartData = period === 'month' ? prepareMonthlyData() : [];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

  const financialTips = generateFinancialTips(transactions, incomes, expenses);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Olá, {user.name || 'Usuário'}</h1>
          <p className="text-muted-foreground">Aqui está o resumo das suas finanças</p>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Saldo atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {formatCurrency(balance)}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div>
              <span className="text-muted-foreground">Receitas:</span>{' '}
              <span className="text-income">{formatCurrency(incomes)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Despesas:</span>{' '}
              <span className="text-expense">{formatCurrency(expenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="month" onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="month">Este mês</TabsTrigger>
          <TabsTrigger value="week">Esta semana</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {pieChartData.length > 0 ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    itemStyle={{ color: "#1F2937" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Sem despesas no período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {period === 'month' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Fluxo do mês</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {barChartData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis width={50} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      itemStyle={{ color: "#1F2937" }}
                    />
                    <Bar dataKey="income" name="Receitas" fill="#10B981" />
                    <Bar dataKey="expense" name="Despesas" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Sem transações no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Insights financeiros</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-2">
            {financialTips.map((tip, index) => (
              <li key={index} className="text-sm py-2 border-b border-border last:border-0">
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

function generateFinancialTips(
  transactions: Transaction[],
  totalIncome: number,
  totalExpense: number
): string[] {
  const tips: string[] = [];

  // If no transactions, return basic tips
  if (transactions.length === 0) {
    return [
      "Comece registrando suas receitas e despesas para obter insights personalizados.",
      "Criar um orçamento é o primeiro passo para uma vida financeira saudável.",
      "Tente economizar pelo menos 20% da sua renda mensal."
    ];
  }

  // Spending ratio tip
  if (totalIncome > 0) {
    const spendingRatio = (totalExpense / totalIncome) * 100;
    if (spendingRatio > 90) {
      tips.push(`Você está gastando ${spendingRatio.toFixed(0)}% da sua renda. Considere reduzir despesas para melhorar sua saúde financeira.`);
    } else if (spendingRatio > 70) {
      tips.push(`Você está gastando ${spendingRatio.toFixed(0)}% da sua renda. Está dentro do razoável, mas tente economizar mais.`);
    } else {
      tips.push(`Parabéns! Você está gastando apenas ${spendingRatio.toFixed(0)}% da sua renda, o que é excelente para sua saúde financeira.`);
    }
  }

  // Category-specific tips
  const thisMonthTransactions = transactions.filter(t => isThisMonth(t.date));
  const expensesByCategory = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category.name]) acc[t.category.name] = 0;
      acc[t.category.name] += t.amount;
      return acc;
    }, {} as Record<string, number>);

  // Find the highest expense category
  let highestCategory = '';
  let highestAmount = 0;
  
  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    if (amount > highestAmount) {
      highestCategory = category;
      highestAmount = amount;
    }
  });

  if (highestCategory && totalExpense > 0) {
    const categoryPercentage = (highestAmount / totalExpense) * 100;
    tips.push(`Sua maior despesa é com ${highestCategory}, representando ${categoryPercentage.toFixed(0)}% do total gasto.`);
  }

  // Add general tips if we don't have many specific ones
  if (tips.length < 3) {
    tips.push("Reserve uma parte da sua renda para emergências, idealmente o equivalente a 3-6 meses de despesas.");
    tips.push("Considere investir parte das suas economias para proteger-se da inflação.");
    tips.push("Revise suas despesas recorrentes mensalmente para identificar oportunidades de economia.");
  }

  return tips;
}

export default DashboardPage;
