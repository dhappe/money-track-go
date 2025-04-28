
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User } from '../types';
import { toast } from "sonner";

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

// Mock users database for demo purposes
const USERS_KEY = 'meu_bolso_users';
const CURRENT_USER_KEY = 'meu_bolso_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for stored user on initial load
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveUserToStorage = (userData: User) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar usuários do localStorage
      const usersStr = localStorage.getItem(USERS_KEY) || '[]';
      let users;
      
      try {
        users = JSON.parse(usersStr);
      } catch (error) {
        console.error('Erro ao processar usuários armazenados:', error);
        users = [];
      }
      
      // Verificar se os dados são um array
      if (!Array.isArray(users)) {
        console.error('Dados de usuários não são um array');
        users = [];
      }
      
      console.log('Tentando login com:', { email, storedUsers: users });
      
      const foundUser = users.find((u: any) => 
        u.email && u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!foundUser) {
        console.log('Usuário não encontrado');
        throw new Error('E-mail ou senha inválidos');
      }
      
      if (foundUser.password !== password) {
        console.log('Senha incorreta');
        throw new Error('E-mail ou senha inválidos');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      console.log('Login bem-sucedido:', userWithoutPassword);
      
      setUser(userWithoutPassword);
      saveUserToStorage(userWithoutPassword);
      toast.success('Login realizado com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Carregar usuários existentes
      const usersStr = localStorage.getItem(USERS_KEY) || '[]';
      let users;
      
      try {
        users = JSON.parse(usersStr);
      } catch (error) {
        console.error('Erro ao processar usuários armazenados:', error);
        users = [];
      }
      
      // Verificar se os dados são um array
      if (!Array.isArray(users)) {
        console.error('Dados de usuários não são um array');
        users = [];
      }
      
      // Verificar se e-mail já existe
      const existingUser = users.find((u: any) => 
        u.email && u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (existingUser) {
        throw new Error('E-mail já cadastrado');
      }
      
      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name
      };
      
      // Adicionar novo usuário e salvar
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      console.log('Usuário cadastrado com sucesso:', { email, name });
      
      // Login automático após signup
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      saveUserToStorage(userWithoutPassword);
      toast.success('Conta criada com sucesso');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.removeItem(CURRENT_USER_KEY);
      setUser(null);
      toast.info('Sessão encerrada');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
