
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Category, Transaction, TransactionContextType } from '../types';
import { useAuth } from './AuthContext';
import { toast } from "sonner";

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat1", name: "Alimentação", icon: "category", type: "expense" },
  { id: "cat2", name: "Transporte", icon: "category", type: "expense" },
  { id: "cat3", name: "Moradia", icon: "category", type: "expense" },
  { id: "cat4", name: "Educação", icon: "category", type: "expense" },
  { id: "cat5", name: "Saúde", icon: "category", type: "expense" },
  { id: "cat6", name: "Lazer", icon: "category", type: "expense" },
  { id: "cat7", name: "Outras Despesas", icon: "category", type: "expense" },
  { id: "cat8", name: "Salário", icon: "wallet", type: "income" },
  { id: "cat9", name: "Investimentos", icon: "piggy-bank", type: "income" },
  { id: "cat10", name: "Outras Receitas", icon: "wallet", type: "income" },
];

// Create context
const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  updateTransaction: () => {},
  deleteTransaction: () => {},
  categories: DEFAULT_CATEGORIES,
  addCategory: () => {},
});

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const { user } = useAuth();

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const storedTransactions = localStorage.getItem(`transactions_${user.id}`);
      const storedCategories = localStorage.getItem(`categories_${user.id}`);
      
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        // Convert string dates back to Date objects
        const transactionsWithDates = parsedTransactions.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(transactionsWithDates);
      }
      
      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        // If no stored categories, save default ones for this user
        localStorage.setItem(`categories_${user.id}`, JSON.stringify(DEFAULT_CATEGORIES));
      }
    } else {
      // Reset state when logged out
      setTransactions([]);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(transactions));
      localStorage.setItem(`categories_${user.id}`, JSON.stringify(categories));
    }
  }, [transactions, categories, user]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    toast.success("Transação adicionada com sucesso");
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    if (!user) return;
    
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
    toast.success("Transação atualizada com sucesso");
  };

  const deleteTransaction = (id: string) => {
    if (!user) return;
    
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    toast.success("Transação removida com sucesso");
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    if (!user) return;
    
    const newCategory = {
      ...category,
      id: Date.now().toString()
    };
    
    setCategories(prev => [...prev, newCategory]);
    toast.success("Categoria adicionada com sucesso");
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        addCategory
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);
